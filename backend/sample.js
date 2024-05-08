const fetch = require('node-fetch');
const fs = require('fs');

async function downloadPDFFromAPI(apiUrl, outputPath) {
    try {
        // Fetch the PDF content from the API URL
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF content: ${response.status} ${response.statusText}`);
        }
        const pdfContent = await response.text();

        // Write the PDF content to a file
        fs.writeFileSync(outputPath, pdfContent, 'base64');

        console.log('PDF file downloaded and saved successfully.');
    } catch (error) {
        console.error('Error downloading PDF:', error);
    }
}

// Example API URL
const apiUrl = 'https://lexlive2.lexship.biz/clevyTiff/WC213829525GB/true';
// Output PDF file path
const outputPdfPath = 'output.pdf';

// Download the PDF file from the API URL and save it to a file
downloadPDFFromAPI(apiUrl, outputPdfPath);
