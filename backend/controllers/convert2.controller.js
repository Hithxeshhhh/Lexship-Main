//Using pdfTron


const { PDFNet } = require('@pdftron/pdfnet-node');
const fs = require('fs');
const path = require('path');
const im = require('imagemagick');
require('dotenv').config();

// Initialize PDFNet
PDFNet.initialize(process.env.API_LICENSE_KEY);


//ATTEMPT1:
// async function combineTiffs(){
//     try {
//         const uploadsFolder = path.join(__dirname, '../uploads/');
//         const outputFolder = path.join(__dirname, '../convertedTif/');
    
//         fs.readdir(uploadsFolder, (err, files) => {
//           if (err) {
//             console.error('Error reading uploads folder:', err);
//             return;
//           }
          
//           const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
    
//           pdfFiles.forEach((pdfFile) => {
//             const fileName = path.basename(pdfFile, path.extname(pdfFile));
//             const pdfFolderPath = path.join(outputFolder, fileName);
    
//             // Check if the folder exists
//             if (!fs.existsSync(pdfFolderPath)) {
//               console.error(`Folder ${pdfFolderPath} does not exist.`);
//               return;
//             }
    
//             // 1. Combine TIFF files within the folder into a single multi-page TIFF
//             const multiPageTiffPath = path.join(outputFolder, `${fileName}.tif`);
//             im.convert([
//               path.join(pdfFolderPath, '*.tif'),
//               '-compress','LZW', 
//               '-density','300',
//               '-quality','100',
//               '-sharpen', '0x1.0',
//               '-extent','0x0',  
//               '-append',
//                multiPageTiffPath
//             ], async (err, stdout) => {
//               if (err) {
//                 console.error(`Error combining TIFF files for ${pdfFile}:`, err);
//                 return;
//               }
//               console.log(`Successfully combined TIFF files for ${pdfFile}`);
    
//               // 2. Delete the folder containing the individual TIFF files
//               fs.rmdirSync(pdfFolderPath, { recursive: true });
//               console.log(`Folder ${pdfFolderPath} deleted.`);
//               resolve();
//             });
//           });
    
//         });
//         await Promise.all(combineTasks);
//         console.log('All PDFs converted and TIFF files combined.');
//         await fs.promises.rmdir(uploadsFolder, { recursive: true });
//         console.log(`Uploads folder ${uploadsFolder} deleted.`);
//       } catch (error) {
//         console.error('Error converting PDFs to TIFF:', error);
//       }
//   }

// exports.convertController2 = async (req, res) => {
//     try {
//         const inputFolder = path.join(__dirname, '../uploads/');
//         const outputFolder = path.join(__dirname, '../convertedTif/');

//         const pdfFiles = fs.readdirSync(inputFolder).filter(file => file.endsWith('.pdf'));

//         for (const pdfFile of pdfFiles) {
//             //converet code
//             const pdfFilePath = path.join(inputFolder, pdfFile);
//             const outputFileName = path.parse(pdfFile).name; 
//             const outputFolderPath = path.join(outputFolder, outputFileName);

//             if (!fs.existsSync(outputFolderPath)) {
//                 fs.mkdirSync(outputFolderPath);
//             }

//             const doc = await PDFNet.PDFDoc.createFromFilePath(pdfFilePath);

//             const pdfDraw = await PDFNet.PDFDraw.create();
//             pdfDraw.setDPI(400);
//             const pageCount = await doc.getPageCount();
//             for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
//                 const page = await doc.getPage(pageNum);
//                 await pdfDraw.export(page, `${outputFolderPath}/page_${pageNum}.tif`, 'TIFF');
//             }

          
//           }
//         await combineTiffs();
//         res.status(200).send('Conversion complete.');
//     } catch (error) {
//         console.error('Error converting PDFs to TIFF:', error);
//         res.status(500).send('Error converting PDFs to TIFF.');
//     }
// };


//ATTEMPT2:

async function remFiles(){
    const uploadsFolder = path.join(__dirname, '../uploads/');
    try {
        const files = await fs.promises.readdir(uploadsFolder);
        const uploadFiles = files.map(file => path.join(uploadsFolder, file));
        await Promise.all(uploadFiles.map(file => fs.promises.unlink(file))); // Corrected fs.promises.unlink
        console.log('All files from the upload folder deleted.');
    } catch(err) {
        console.log(err);
    }
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
          pdfDraw.setDPI(400);
          const pageCount = await doc.getPageCount();
          for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
              const page = await doc.getPage(pageNum);
              await pdfDraw.export(page, `${outputFolderPath}/page_${pageNum}.tif`, 'TIFF');
          }
      }

      await combineTiffs();
      await new Promise(resolve => setTimeout(resolve, 10000));
      await remFiles();
      res.status(200).send('Conversion complete.');
  } catch (error) {
      console.error('Error converting PDFs to TIFF:', error);
      res.status(500).send('Error converting PDFs to TIFF.');
  }
};
