const fetch = require('node-fetch');
const fs = require('fs');

async function awbtopdfMiddleware(req, res, next) {
    try {
        const { awbNumbers } = req.body;
        for (const awb of awbNumbers) {
            const apiUrl = `https://lexlive2.lexship.biz/clevyTiff/${awb}/true`;
            const outputPdfPath = `../backend/uploads/${awb}.pdf`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch PDF content for AWB ${awb}: ${response.status} ${response.statusText}`);
            }
            const pdfContent = await response.text(); 
            fs.writeFileSync(outputPdfPath, pdfContent,'base64');

            console.log(`PDF for AWB ${awb} downloaded and saved successfully.`);
        }

        next();
    } catch (error) {
        console.error('Error downloading PDFs:', error);
        res.status(500).send('Error downloading PDFs');
    }
}

module.exports = awbtopdfMiddleware;
