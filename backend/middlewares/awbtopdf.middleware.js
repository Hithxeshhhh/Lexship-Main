const fetch = require('node-fetch');
const fs = require('fs');

async function awbtopdfMiddleware(req, res, next) {
    try {
        const successfulDownloads = [];
        const failedDownloads = [];
        const { awbNumbers, conversionType } = req.body;
        console.log(conversionType);
        for (const awb of awbNumbers) {
            let apiUrl;
            switch (conversionType) {
                case 'Commercial Invoice':
                    apiUrl = `https://lexlive2.lexship.biz/show/cinvoice/${awb}`;
                    break;
                case 'CI & Label':
                    apiUrl = `https://lexlive2.lexship.biz/show/commercial-invoice/labels/api/${awb}`;
                    break;
                case 'Clevy Label':
                    apiUrl = `https://lexlive2.lexship.biz/clevyTiff/${awb}/true`;
                    break;
                case 'Orange Label':
                    apiUrl = `https://lexlive2.lexship.biz/orangedsTiff/${awb}/true`;
                    break;
                default:
                    apiUrl = ``;
            }
            const outputPdfPath = `../backend/uploads/${awb}.pdf`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                failedDownloads.push(awb);
                console.error(`Failed to fetch PDF content for AWB ${awb}: ${response.status} ${response.statusText}`);
                continue;
            }
            if (conversionType === 'Clevy Label' ) {
                const pdfContent = await response.text();
                fs.writeFileSync(outputPdfPath, pdfContent,'base64');
            }
            else if(conversionType==='CI & Label' && awb.startsWith('WC')){
                const pdfContent = await response.text();
                fs.writeFileSync(outputPdfPath, pdfContent,'base64');
            }
            else{
                const pdfContent = await response.buffer();
                fs.writeFileSync(outputPdfPath, pdfContent);
            }
            successfulDownloads.push(awb);
            console.log(`PDF for AWB ${awb} downloaded and saved successfully.`);
        }
        req.successfulDownloads = successfulDownloads;
        req.failedDownloads = failedDownloads;
        next();
    } catch (error) {
        console.error('Error downloading PDFs:', error);
        res.status(500).send('Error downloading PDFs');
    }
}

module.exports = awbtopdfMiddleware;
