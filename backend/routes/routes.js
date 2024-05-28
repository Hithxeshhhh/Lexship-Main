const express = require('express');
const uploadMiddleware = require('../middlewares/upload.middleware')(); 
const { uploadController } = require('../controllers/upload.controller');
const { convertController } = require('../controllers/convert.controller');
const { convertController2 } = require('../controllers/convert2.controller');
const { combinedController } = require('../controllers/combined.controller');
const awbtopdfMiddleware = require('../middlewares/awbtopdf.middleware');
const { createLeadController } = require('../controllers/createLead.controller');
const { createProspectController } = require('../controllers/createProspect.controller');
const router = express.Router();

router.get('/test',(req,res)=>{
    res.json({message:'Testing page'})
})
router.post('/upload', uploadMiddleware, uploadController);
router.post('/convert', convertController2);
router.post('/upload-convert',awbtopdfMiddleware,convertController2);
router.post('/create-lead/:Customer_id',createLeadController)
router.post('/create-prospect/:Customer_id/:Zoho_id',createProspectController)
module.exports = router;
