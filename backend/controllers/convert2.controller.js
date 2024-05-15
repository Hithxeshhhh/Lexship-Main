
const archiver = require('archiver');
const { PDFNet } = require('@pdftron/pdfnet-node');
const fs = require('fs');
const path = require('path');
const im = require('imagemagick');
require('dotenv').config();

PDFNet.initialize(process.env.API_LICENSE_KEY);

async function compresstozip(folderPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream('compressed.zip');
        const archive = archiver('zip', {
            zlib: { level: 9 } // Set compression level to maximum
        });

        output.on('close', function () {
            console.log('Archive wrote %d bytes', archive.pointer());
            resolve('compressed.zip');
        });

        archive.on('error', function (err) {
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
    try {
        const { successfulDownloads, failedDownloads } = req;
        if(JSON.stringify(successfulDownloads).length!==2){
        const inputFolder = path.join(__dirname, '../uploads/');
        const outputFolder = path.join(__dirname, '../convertedTif/');

        const pdfFiles = fs.readdirSync(inputFolder).filter(file => file.endsWith('.pdf'));

        for (const pdfFile of pdfFiles) {
            // Convert code
            const pdfFilePath = path.join(inputFolder, pdfFile);
            const outputFileName = path.parse(pdfFile).name;
            const outputFolderPath = path.join(outputFolder, outputFileName);

            if (!fs.existsSync(outputFolderPath)) {
                fs.mkdirSync(outputFolderPath);
            }
            const doc = await PDFNet.PDFDoc.createFromFilePath(pdfFilePath);
            const pdfDraw = await PDFNet.PDFDraw.create();
            pdfDraw.setDPI(200);
            const pageCount = await doc.getPageCount();
            for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
                const page = await doc.getPage(pageNum);
                await pdfDraw.export(page, `${outputFolderPath}/page_${pageNum}.tif`, 'TIFF');

            }
            doc.destroy();
        }
        await combineTiffs();
        //   await new Promise(resolve => setTimeout(resolve, 10000));
        //   await remFiles();
        const zipFilePath = await compresstozip(outputFolder); // Generate the ZIP file
        const zipFile = fs.readFileSync(zipFilePath);

        fs.unlinkSync(zipFilePath);
        pdfFiles.forEach(pdfFile => {
            const pdfFilePath = path.join(inputFolder, pdfFile);
            fs.unlinkSync(pdfFilePath);
        });
        const tifFiles = fs.readdirSync(outputFolder).filter(file => file.endsWith('.tif'));
        tifFiles.forEach(tifFile => {
            const tifFilePath = path.join(outputFolder, tifFile);
            fs.unlinkSync(tifFilePath);
        });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=converted_files.zip');
        res.setHeader('successful',JSON.stringify(successfulDownloads))
        res.setHeader('failed',JSON.stringify(failedDownloads))
        res.status(200).send(zipFile);
    }else{
        res.setHeader('successful',JSON.stringify(successfulDownloads))
        res.setHeader('failed',JSON.stringify(failedDownloads))
        res.status(200).send('')
    }

    } catch (error) {
        console.error('Error converting PDFs to TIFF:', error);
        res.status(500).send('Error converting PDFs to TIFF.');
    }
};
PDFNet.shutdown();

