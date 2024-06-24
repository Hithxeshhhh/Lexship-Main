const fetch = require('node-fetch');
const fs = require('fs').promise;
const path = require('path'); // Require the path module

const { exec } = require('child_process');
require('dotenv').config()

let url = '';
if(process.env.NODE_ENV==='prod'){
    url = process.env.LEX_PROD_INIT
}else{
    url = process.env.LEX_DEV_INIT
}

async function emptyFolder(folderPath) {
    try {
        const files = await fs.readdir(folderPath);
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            await fs.unlink(filePath);
        }
        console.log(`Successfully emptied folder: ${folderPath}`);
    } catch (err) {
        console.error(`Error emptying folder: ${folderPath}`, err);
    }
}



async function awbtopdfMiddleware(req, res, next) {
    const io = req.app.get('socketio'); // Get socket.io instance
    let completedTasks = 0;
    try {
        emptyFolder(path.join(__dirname, '../uploads/'));
        emptyFolder(path.join(__dirname, '../convertedTif/'));
        const successfulDownloads = [];
        const failedDownloads = [];
        const { awbNumbers, conversionType } = req.body;
        const totalTasks = awbNumbers.length;

        console.log('Starting AWB to PDF conversion process...');
        console.log(`Conversion Type: ${conversionType}`);
        console.log(`AWB Numbers: ${JSON.stringify(awbNumbers)}`);

        for (const awb of awbNumbers) {
            let apiUrl;
            switch (conversionType) {
                case 'Commercial Invoice':
                    apiUrl = `${url}/show/cinvoice/${awb}`;
                    break;
                case 'CI & Label':
                    apiUrl = `${url}/show/commercial-invoice/labels/api/${awb}`;
                    break;
                case 'Clevy Label':
                    apiUrl = `${url}/clevyTiff/${awb}/true`;
                    break;
                case 'Orange Label':
                    apiUrl = `${url}/orangedsTiff/${awb}/true`;
                    break;
                default:
                    apiUrl = '';
                    console.error(`Unknown conversion type: ${conversionType} for AWB ${awb}`);
                    failedDownloads.push(awb);
                    continue;
            }

            console.log(`Fetching PDF for AWB ${awb} from ${apiUrl}...`);

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    failedDownloads.push(awb);
                    console.error(`Failed to fetch PDF content for AWB ${awb}: ${response.status} ${response.statusText}`);
                    continue;
                }

                const fileContent = await response.buffer();
                const pdfStartIndex = fileContent.indexOf('%PDF');
                if (pdfStartIndex === -1) {
                    throw new Error(`Invalid PDF content received for AWB ${awb}`);
                }
                const pdfContent = fileContent.slice(pdfStartIndex);
                const outputPdfPath = path.join(__dirname, '../uploads', `${awb}.pdf`);
                fs.writeFileSync(outputPdfPath, pdfContent);
                successfulDownloads.push(awb);
                console.log(`PDF for AWB ${awb} downloaded and saved successfully.`);
            } catch (downloadError) {
                failedDownloads.push(awb);
                console.error(`Error downloading PDF for AWB ${awb}:`, downloadError);
            }

            completedTasks++;
            io.emit('progress', { completed: completedTasks, total: totalTasks });
        }

        req.successfulDownloads = successfulDownloads;
        req.failedDownloads = failedDownloads;
        console.log('AWB to PDF conversion process completed.');
        console.log(`Successful Downloads: ${JSON.stringify(successfulDownloads)}`);
        console.log(`Failed Downloads: ${JSON.stringify(failedDownloads)}`);
        next();
    } catch (error) {
        console.error('Error in awbtopdfMiddleware:', error);
        res.status(500).send('Error downloading PDFs');
    }
}

module.exports = awbtopdfMiddleware;
