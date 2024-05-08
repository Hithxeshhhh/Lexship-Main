const fetch = require('node-fetch');
const fs = require('fs');

async function awbtopdfMiddleware(req, res, next) {
    try {
        const { awbNumbers } = req.body; // Assuming the array of AWB numbers is sent in the request body
        console.log(awbNumbers)
        // Iterate over each AWB number
        for (const awb of awbNumbers) {
            const apiUrl = `https://lexlive2.lexship.biz/clevyTiff/${awb}/true`;
            console.log(apiUrl)
            const outputPdfPath = `../backend/uploads/${awb}.pdf`;

            // Fetch the PDF content from the API URL
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch PDF content for AWB ${awb}: ${response.status} ${response.statusText}`);
            }
            const pdfContent = await response.text(); 

            // Write the PDF content to a file with the AWB number as the filename
            fs.writeFileSync(outputPdfPath, pdfContent,'base64');

            console.log(`PDF for AWB ${awb} downloaded and saved successfully.`);
        }

        next(); // Call next middleware or route handler
    } catch (error) {
        console.error('Error downloading PDFs:', error);
        res.status(500).send('Error downloading PDFs');
    }
}

module.exports = awbtopdfMiddleware;
