const express = require('express');
const router = express.Router();
const asendiaController = require('../manifestController/asendiaManifest.controller');

// Asendia Vendor Routes
// Route to generate Excel file from JSON data
router.post('/generate-excel', asendiaController.generateExcelFromJSON);

// Route to search for all bagging IDs by MAWB number
router.post('/search-baggings', asendiaController.searchBaggingsByMAWB);

// Route to search by MAWB number and generate Excel from database
router.post('/search-mawb', asendiaController.searchByMAWBAndGenerateExcel);

// Route to get JSON data
router.get('/json-data', asendiaController.getJSONData);

// Route to update JSON data
router.put('/update-json', asendiaController.updateJSONData);

// Route to download generated Excel file by MAWB number
router.get('/download/:mawbNumber', asendiaController.downloadExcelFile);

// Route to get all generated Excel files
router.get('/files', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(__dirname, '../manifestUploads');
        
        const files = fs.readdirSync(uploadsDir);
        const excelFiles = files.filter(file => 
            (file.startsWith('asendia_manifest_') || file.startsWith('mawb_')) && file.endsWith('.xlsx')
        );
        
        const fileList = excelFiles.map(file => {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
            return {
                filename: file,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
        });
        
        res.json({
            success: true,
            totalFiles: excelFiles.length,
            files: fileList
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error reading files',
            error: error.message
        });
    }
});

// Route to delete file by MAWB number
router.delete('/delete-file/:mawbNumber', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const mawbNumber = req.params.mawbNumber;
        const uploadsDir = path.join(__dirname, '../manifestUploads');
        
        if (!fs.existsSync(uploadsDir)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Uploads directory not found' 
            });
        }
        
        const files = fs.readdirSync(uploadsDir);
        const targetFile = files.find(file =>
            file.toLowerCase().includes(mawbNumber.toLowerCase()) &&
            file.endsWith('.xlsx')
        );
        
        if (!targetFile) {
            return res.status(404).json({ 
                success: false, 
                message: `No Excel file found for MAWB number: ${mawbNumber}` 
            });
        }
        
        const filePath = path.join(uploadsDir, targetFile);
        fs.unlinkSync(filePath);
        
        res.json({
            success: true,
            message: `File deleted successfully: ${targetFile}`,
            deletedFile: targetFile
        });
        
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting file',
            error: error.message
        });
    }
});

module.exports = router; 