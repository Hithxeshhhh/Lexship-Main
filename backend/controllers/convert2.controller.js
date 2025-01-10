const archiver = require("archiver");
const { PDFNet } = require("@pdftron/pdfnet-node");
const fs = require("fs");
const path = require("path");
const im = require("imagemagick");
require("dotenv").config();
const { exec } = require("child_process");

PDFNet.initialize(process.env.API_LICENSE_KEY);

async function compresstozip(folderPath) {
  return new Promise((resolve, reject) => {
    console.log(`Compressing files in ${folderPath} to ZIP...`);
    const output = fs.createWriteStream("compressed.zip");
    const archive = archiver("zip", {
      zlib: { level: 6 },
    });

    output.on("close", function () {
      console.log("Archive wrote %d bytes", archive.pointer());
      resolve("compressed.zip");
    });

    archive.on("error", function (err) {
      console.error("Error creating ZIP archive:", err);
      reject(err);
    });

    archive.pipe(output);

    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".tif"));
    files.forEach((file) => {
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

async function combineTiffsBatch(
  pdfFiles,
  batchNumber,
  io,
  totalTasks,
  completedTasks
) {
  try {
    const outputFolder = path.join(__dirname, "../combinedTif/");
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }

    await Promise.all(
      pdfFiles.map(async (pdfFile) => {
        const fileName = path.basename(pdfFile, path.extname(pdfFile));
        const pdfFolderPath = path.join(
          __dirname,
          "../convertedTif/",
          fileName
        );

        if (!fs.existsSync(pdfFolderPath)) {
          console.error(`Folder ${pdfFolderPath} does not exist.`);
          return;
        }
        //added new method
        //replaced .convert with magick convert,works on imageMagick version 7 and above
        const multiPageTiffPath = path.join(outputFolder, `${fileName}.tif`);
        await new Promise((resolve, reject) => {
          exec(
            `magick convert ${path.join(pdfFolderPath, "*.tif")} -compress LZW -density 200 -quality 100 -sharpen 0x1.0 -extent 0x0 -append ${multiPageTiffPath}`,
            (err, stdout, stderr) => {
              if (err) {
                console.error(
                  `Error combining TIFF files for ${pdfFile}:`,
                  err
                );
                reject(err);
              } else {
                if (process.env.NODE_ENV !== "prod")
                  console.log(
                    `Successfully combined TIFF files for ${pdfFile}`
                  );
                fs.rmSync(pdfFolderPath, { recursive: true });
                if (process.env.NODE_ENV !== "prod")
                  console.log(`Folder ${pdfFolderPath} deleted.`);
                completedTasks++;
                io.emit("progress", {
                  completed: completedTasks,
                  total: totalTasks,
                });
                resolve();
              }
            }
          );
        });
      })
    );
  } catch (error) {
    console.error("Error combining TIFF files:", error);
  }
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return completedTasks;
}


async function processBatch(
  pdfFiles,
  batchNumber,
  io,
  totalTasks,
  completedTasks
) {
  const inputFolder = path.join(__dirname, "../uploads/");
  const outputFolder = path.join(__dirname, "../convertedTif/");

  console.log(
    `Processing batch ${batchNumber} with ${pdfFiles.length} PDFs...`
  );

  await Promise.all(
    pdfFiles.map(async (pdfFile) => {
      const pdfFilePath = path.join(inputFolder, pdfFile);
      const outputFileName = path.parse(pdfFile).name;
      const outputFolderPath = path.join(outputFolder, outputFileName);

      if (!fs.existsSync(outputFolderPath)) {
        fs.mkdirSync(outputFolderPath);
      }

      if (process.env.NODE_ENV !== "prod")
        console.log(`Converting PDF ${pdfFile} to TIFF...`);
      const doc = await PDFNet.PDFDoc.createFromFilePath(pdfFilePath);
      const pdfDraw = await PDFNet.PDFDraw.create();
      pdfDraw.setDPI(200);
      const pageCount = await doc.getPageCount();
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await doc.getPage(pageNum);
        await pdfDraw.export(
          page,
          `${outputFolderPath}/page_${pageNum}.tif`,
          "TIFF"
        );
      }
      doc.destroy();
      if (process.env.NODE_ENV !== "prod")
        console.log(`PDF ${pdfFile} converted to TIFF successfully.`);
      completedTasks++;
      io.emit("progress", { completed: completedTasks, total: totalTasks });
    })
  );

  // Add a 3-second delay after each batch
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return completedTasks;
}

exports.convertController2 = async (req, res) => {
  const io = req.app.get("socketio");
  try {

    const { successfulDownloads, failedDownloads } = req;
    if (JSON.stringify(successfulDownloads).length !== 2) {
      const inputFolder = path.join(__dirname, "../uploads/");
      const pdfFiles = fs
        .readdirSync(inputFolder)
        .filter((file) => file.endsWith(".pdf"));
      const totalTasks = pdfFiles.length * 2;
      const batchSize = 10;
      const pdfBatches = chunkArray(pdfFiles, batchSize);

      console.log("Starting PDF to TIFF conversion process...");
      if (process.env.NODE_ENV !== "prod")
        console.log(`PDF Files: ${JSON.stringify(pdfFiles)}`);

      let completedTasks = 0;
      let batchNumber = 1;
      for (const batch of pdfBatches) {
        completedTasks = await processBatch(
          batch,
          batchNumber++,
          io,
          totalTasks,
          completedTasks
        );
      }

      batchNumber = 1;
      for (const batch of pdfBatches) {
        console.log(`Combining TIFF files for batch ${batchNumber}...`);
        completedTasks = await combineTiffsBatch(
          batch,
          batchNumber++,
          io,
          totalTasks,
          completedTasks
        );
        console.log(`Batch ${batchNumber - 1} TIFF files combined.`);
      }

      console.log("Compressing TIFF files to ZIP...");
      const zipFilePath = await compresstozip(
        path.join(__dirname, "../combinedTif/")
      );
      const zipFile = fs.readFileSync(zipFilePath);

      fs.unlinkSync(zipFilePath);
      console.log(`ZIP file ${zipFilePath} created and deleted after reading.`);

      pdfFiles.forEach((pdfFile) => {
        const pdfFilePath = path.join(inputFolder, pdfFile);
        fs.unlinkSync(pdfFilePath);
        if (process.env.NODE_ENV !== "prod")
          console.log(`PDF file ${pdfFilePath} deleted.`);
      });

      const tifFiles = fs
        .readdirSync(path.join(__dirname, "../combinedTif/"))
        .filter((file) => file.endsWith(".tif"));
      tifFiles.forEach((tifFile) => {
        const tifFilePath = path.join(
          path.join(__dirname, "../combinedTif/"),
          tifFile
        );
        fs.unlinkSync(tifFilePath);
        if (process.env.NODE_ENV !== "prod")
          console.log(`TIFF file ${tifFilePath} deleted.`);
      });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=converted_files.zip"
      );
      res.setHeader("successful", JSON.stringify(successfulDownloads));
      res.setHeader("failed", JSON.stringify(failedDownloads));
      await res.status(200).send(zipFile);
      console.log(
        "PDF to TIFF conversion process completed and ZIP file sent."
      );
      res.on('finish', () => {
        console.log('Response finished, restarting PM2 process.');})
      await new Promise((resolve) => setTimeout(resolve, 20000));
      if (process.env.NODE_ENV !== "local") {
        exec("pm2 restart all", (err, stdout, stderr) => {
          if (err) {
            console.error("Error restarting PM2 process:", err);
            return;
          }
          console.log("PM2 process restarted successfully:", stdout);
        });
      }
    } else {
      res.setHeader("successful", JSON.stringify(successfulDownloads));
      res.setHeader("failed", JSON.stringify(failedDownloads));
      res.status(200).send("");
      console.log("No successful downloads, returning empty response.");
    }
  } catch (error) {
    console.error("Error converting PDFs to TIFF:", error);
    res.status(500).send("Error converting PDFs to TIFF.");
  }
};

PDFNet.shutdown();