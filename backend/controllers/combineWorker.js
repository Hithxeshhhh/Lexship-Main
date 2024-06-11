const { parentPort, workerData } = require('worker_threads');
const im = require('imagemagick');
const fs = require('fs');
const path = require('path');

const { pdfFolderPath, multiPageTiffPath } = workerData;

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
        parentPort.postMessage({ success: false, error: err });
    } else {
        fs.rmSync(pdfFolderPath, { recursive: true });
        parentPort.postMessage({ success: true });
    }
});
