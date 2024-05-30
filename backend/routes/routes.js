const express = require('express');
const uploadMiddleware = require('../middlewares/upload.middleware')(); 
const { uploadController } = require('../controllers/upload.controller');
const { convertController } = require('../controllers/convert.controller');
const { convertController2 } = require('../controllers/convert2.controller');
const { combinedController } = require('../controllers/combined.controller');
const awbtopdfMiddleware = require('../middlewares/awbtopdf.middleware');
const { createLeadController } = require('../controllers/createLead.controller');
const { createDealController } = require('../controllers/createDeal.controller');
const { getLeadController } = require('../controllers/getLead.controller');
const { updateLeadController } = require('../controllers/updateLead.controller');
const { updateDealController } = require('../controllers/updateDeal.controller');
const { getDealController } = require('../controllers/getDeal.controller');
const router = express.Router();

//testing route
router.get('/test',(req,res)=>{
    res.json({message:'Testing page'})
})

//module routes
router.post('/upload', uploadMiddleware, uploadController);
router.post('/convert', convertController2);
router.post('/upload-convert',awbtopdfMiddleware,convertController2);

//Zoho integration routes
router.post('/create-lead/:Customer_id',createLeadController)
router.get('/get-lead/:Zoho_id',getLeadController)
router.put('/update-lead/:Zoho_id',updateLeadController)
router.post('/create-deal/:Customer_id/',createDealController)
router.put('/update-deal/:Zoho_Deal_Id',updateDealController)
router.get('/get-deal/:Zoho_Deal_Id',getDealController)
module.exports = router;
