//eta for 80awbs is 2mins 30sec
//eta for 160awbs is 4mins 52sec
//etc for 240awbs is 7mins 02sec
const archiver = require('archiver');
const { PDFNet } = require('@pdftron/pdfnet-node');
const fs = require('fs');
const path = require('path');
const { Worker } = require('worker_threads');
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

        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.tif'));
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            archive.append(fs.createReadStream(filePath), { name: file });
        });

        archive.finalize();
    });
}

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

function runCombineWorker(pdfFolderPath, multiPageTiffPath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, 'combineWorker.js'), {
            workerData: { pdfFolderPath, multiPageTiffPath }
        });

        worker.on('message', (message) => {
            if (message.success) {
                resolve();
            } else {
                reject(message.error);
            }
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

async function combineTiffsBatch(pdfFiles) {
    try {
        const outputFolder = path.join(__dirname, '../combinedTif/');
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder);
        }

        await Promise.all(pdfFiles.map(async (pdfFile) => {
            const fileName = path.basename(pdfFile, path.extname(pdfFile));
            const pdfFolderPath = path.join(__dirname, '../convertedTif/', fileName);

            if (!fs.existsSync(pdfFolderPath)) {
                console.error(`Folder ${pdfFolderPath} does not exist.`);
                return;
            }

            const multiPageTiffPath = path.join(outputFolder, `${fileName}.tif`);
            await runCombineWorker(pdfFolderPath, multiPageTiffPath);
            console.log(`Successfully combined TIFF files for ${pdfFile}`);
        }));
        console.log('All PDFs converted and TIFF files combined.');
    } catch (error) {
        console.error('Error combining TIFF files:', error);
    }
}

async function processBatch(pdfFiles, batchNumber, io, totalTasks, completedTasks) {
    const inputFolder = path.join(__dirname, '../uploads/');
    const outputFolder = path.join(__dirname, '../convertedTif/');

    console.log(`Processing batch ${batchNumber} with ${pdfFiles.length} PDFs...`);

    await Promise.all(pdfFiles.map(async (pdfFile) => {
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
    }));
    await new Promise(resolve => setTimeout(resolve, 3000));
    return completedTasks;
}

exports.convertController2 = async (req, res) => {
    const io = req.app.get('socketio');
    try {
        const { successfulDownloads, failedDownloads } = req;
        if (JSON.stringify(successfulDownloads).length !== 2) {
            const inputFolder = path.join(__dirname, '../uploads/');
            const pdfFiles = fs.readdirSync(inputFolder).filter(file => file.endsWith('.pdf'));
            const totalTasks = pdfFiles.length * 2;
            const batchSize = 100;
            const pdfBatches = chunkArray(pdfFiles, batchSize);

            console.log('Starting PDF to TIFF conversion process...');
            console.log(`PDF Files: ${JSON.stringify(pdfFiles)}`);

            let completedTasks = 0;
            let batchNumber = 1;
            for (const batch of pdfBatches) {
                completedTasks = await processBatch(batch, batchNumber++, io, totalTasks, completedTasks);
            }

            batchNumber = 1;
            for (const batch of pdfBatches) {
                console.log(`Combining TIFF files for batch ${batchNumber}...`);
                await combineTiffsBatch(batch);
                console.log(`Batch ${batchNumber} TIFF files combined.`);
                batchNumber++;
            }

            console.log('Compressing TIFF files to ZIP...');
            const zipFilePath = await compresstozip(path.join(__dirname, '../combinedTif/'));
            const zipFile = fs.readFileSync(zipFilePath);

            fs.unlinkSync(zipFilePath);
            console.log(`ZIP file ${zipFilePath} created and deleted after reading.`);

            pdfFiles.forEach(pdfFile => {
                const pdfFilePath = path.join(inputFolder, pdfFile);
                fs.unlinkSync(pdfFilePath);
                console.log(`PDF file ${pdfFilePath} deleted.`);
            });

            const tifFiles = fs.readdirSync(path.join(__dirname, '../combinedTif/')).filter(file => file.endsWith('.tif'));
            tifFiles.forEach(tifFile => {
                const tifFilePath = path.join(path.join(__dirname, '../combinedTif/'), tifFile);
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
