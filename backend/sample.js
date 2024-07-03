// const fetch = require('node-fetch');
// const fs = require('fs');

// async function downloadFileFromAPI(apiUrl, outputPath) {
//     try {
//         const response = await fetch(apiUrl, {
//             headers: {
//                 'Content-Type': 'application/pdf; charset=utf-8'
//             }
//         });
//         if (!response.ok) {
//             throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
//         }
//         const fileContent = await response.text();
//         console.log(fileContent)
//         fs.writeFileSync(outputPath, fileContent,'base64');
//             console.log('File downloaded and saved successfully.');
//     } catch (error) {
//         console.error('Error downloading file:', error);
//     }
// }

// const apiUrl = 'https://lexlive2.lexship.biz/clevyTiff/WC213504634GB/true';
// const outputFilePath = 'output.pdf';
// downloadFileFromAPI(apiUrl, outputFilePath);
const fetch = require('node-fetch');
const fs = require('fs');
const { file } = require('jszip');

async function downloadFileFromAPI(apiUrl, outputPath) {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/pdf; charset=utf-8'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
        }
        const fileContent = await response.buffer(); // Use buffer() to get the response as a Buffer
        
        fs.appendFileSync(outputPath, fileContent);
        console.log('File downloaded and saved successfully.');
    } catch (error) {
        console.error('Error downloading file:', error);
    }
}

const apiUrl = 'https://live1.lexship.com/show/commercial-invoice/labels/api/WC211400662GB';
const outputFilePath = 'output.pdf';
downloadFileFromAPI(apiUrl, outputFilePath);
// const axios = require('axios');

// const login = async () => {
//   try {
//     const response = await axios({
//       method: 'POST',
//       url: 'https://lexlive2.lexship.biz/api/auth/login',
//       headers: {
//         'Accept': 'application/json',
//       },
//       data: {
//         email: 'test.dev@lexship.com',
//         password: 'lex$hip07',
//       },
//     });
//     console.log(response.data);
//   } catch (error) {
//     console.error('Error:', error.response ? error.response.data : error.message);
//   }
// };

// login();

