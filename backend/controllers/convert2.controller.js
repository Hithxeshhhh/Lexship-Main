const archiver = require('archiver');
const { PDFNet } = require('@pdftron/pdfnet-node');
const fs = require('fs');
const path = require('path');
const im = require('imagemagick');
require('dotenv').config();
const { exec } = require('child_process');

PDFNet.initialize(process.env.API_LICENSE_KEY);



async function compresstozip(folderPath) {
    return new Promise((resolve, reject) => {
        console.log(`Compressing files in ${folderPath} to ZIP...`);
        const output = fs.createWriteStream('compressed.zip');
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', function () {
            console.log('Archive wrote %d bytes', archive.pointer());
            resolve('compressed.zip');
        });

        archive.on('error', function (err) {
            console.error('Error creating ZIP archive:', err);
            reject(err);
        });

        archive.pipe(output);

        // Add all TIFF files in the folder to the archive
        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.tif'));
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            archive.append(fs.createReadStream(filePath), { name: file });
        });

        archive.finalize();
    });
}

async function combineTiffs() {
    try {
        const uploadsFolder = path.join(__dirname, '../uploads/');
        const outputFolder = path.join(__dirname, '../convertedTif/');
        console.log('Combining TIFF files...');

        const files = await fs.promises.readdir(uploadsFolder);
        const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');

        const combineTasks = pdfFiles.map(async (pdfFile) => {
            const fileName = path.basename(pdfFile, path.extname(pdfFile));
            const pdfFolderPath = path.join(outputFolder, fileName);

            // Check if the folder exists
            if (!fs.existsSync(pdfFolderPath)) {
                console.error(`Folder ${pdfFolderPath} does not exist.`);
                return;
            }

            // 1. Combine TIFF files within the folder into a single multi-page TIFF
            const multiPageTiffPath = path.join(outputFolder, `${fileName}.tif`);
            await new Promise((resolve, reject) => {
                im.convert([
                    path.join(pdfFolderPath, '*.tif'),
                    '-compress', 'LZW',
                    '-density', '300',
                    '-quality', '100',
                    '-sharpen', '0x1.0',
                    '-extent', '0x0',
                    '-append',
                    multiPageTiffPath
                ], (err, stdout) => {
                    if (err) {
                        console.error(`Error combining TIFF files for ${pdfFile}:`, err);
                        reject(err);
                    } else {
                        console.log(`Successfully combined TIFF files for ${pdfFile}`);
                        // 2. Delete the folder containing the individual TIFF files
                        fs.rmSync(pdfFolderPath, { recursive: true });
                        console.log(`Folder ${pdfFolderPath} deleted.`);
                        resolve();
                    }
                });
            });
        });
        await Promise.all(combineTasks);
        console.log('All PDFs converted and TIFF files combined.');

    } catch (error) {
        console.error('Error combining TIFF files:', error);
    }
}




exports.convertController2 = async (req, res) => {
    const io = req.app.get('socketio');
    try {

        const { successfulDownloads, failedDownloads } = req;
        if (JSON.stringify(successfulDownloads).length !== 2) {
            const inputFolder = path.join(__dirname, '../uploads/');
            const outputFolder = path.join(__dirname, '../convertedTif/');
            
            const pdfFiles = fs.readdirSync(inputFolder).filter(file => file.endsWith('.pdf'));
            let completedTasks = pdfFiles.length;
            const totalTasks = pdfFiles.length * 2; // Number of steps in the process

            console.log('Starting PDF to TIFF conversion process...');
            console.log(`PDF Files: ${JSON.stringify(pdfFiles)}`);

            for (const pdfFile of pdfFiles) {
                // Convert code
                const pdfFilePath = path.join(inputFolder, pdfFile);
                const outputFileName = path.parse(pdfFile).name;
                const outputFolderPath = path.join(outputFolder, outputFileName);

                if (!fs.existsSync(outputFolderPath)) {
                    fs.mkdirSync(outputFolderPath);
                }

                console.log(`Converting PDF ${pdfFile} to TIFF...`);
                const doc = await PDFNet.PDFDoc.createFromFilePath(pdfFilePath);
                const pdfDraw = await PDFNet.PDFDraw.create();
                pdfDraw.setDPI(200);
                const pageCount = await doc.getPageCount();
                for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
                    const page = await doc.getPage(pageNum);
                    await pdfDraw.export(page, `${outputFolderPath}/page_${pageNum}.tif`, 'TIFF');
                }
                doc.destroy();
                console.log(`PDF ${pdfFile} converted to TIFF successfully.`);
                completedTasks++;
                io.emit('progress', { completed: completedTasks, total: totalTasks });
            }

            await combineTiffs();
            console.log('Compressing TIFF files to ZIP...');
            const zipFilePath = await compresstozip(outputFolder); // Generate the ZIP file
            const zipFile = fs.readFileSync(zipFilePath);
            
            fs.unlinkSync(zipFilePath);
            console.log(`ZIP file ${zipFilePath} created and deleted after reading.`);

            pdfFiles.forEach(pdfFile => {
                const pdfFilePath = path.join(inputFolder, pdfFile);
                fs.unlinkSync(pdfFilePath);
                console.log(`PDF file ${pdfFilePath} deleted.`);
            });

            const tifFiles = fs.readdirSync(outputFolder).filter(file => file.endsWith('.tif'));
            tifFiles.forEach(tifFile => {
                const tifFilePath = path.join(outputFolder, tifFile);
                fs.unlinkSync(tifFilePath);
                console.log(`TIFF file ${tifFilePath} deleted.`);
            });
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename=converted_files.zip');
            res.setHeader('successful', JSON.stringify(successfulDownloads));
            res.setHeader('failed', JSON.stringify(failedDownloads));
            res.status(200).send(zipFile);
            console.log('PDF to TIFF conversion process completed and ZIP file sent.');
        } else {
            res.setHeader('successful', JSON.stringify(successfulDownloads));
            res.setHeader('failed', JSON.stringify(failedDownloads));
            res.status(200).send('');
            console.log('No successful downloads, returning empty response.');
        }
    } catch (error) {
        console.error('Error converting PDFs to TIFF:', error);
        res.status(500).send('Error converting PDFs to TIFF.');
    }
};

PDFNet.shutdown(); 
