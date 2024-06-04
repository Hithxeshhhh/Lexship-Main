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
const { createAccountController } = require('../controllers/createAccount.controller');
const { getAccountController } = require('../controllers/getAccount.controller');
const { updateAccountController } = require('../controllers/updateAccount.controller');
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
router.put('/update-lead/:Zoho_id',updateLeadController)
router.get('/get-lead/:Zoho_id',getLeadController)
router.post('/create-deal/:Customer_id/',createDealController)
router.put('/update-deal/:Zoho_Deal_Id',updateDealController)
router.get('/get-deal/:Zoho_Deal_Id',getDealController)
router.post('/create-account/:Customer_id/:Zoho_deal_id',createAccountController)
router.get('/get-account/:Zoho_Account_id',getAccountController)
router.put('/update-account/:Zoho_Account_id',updateAccountController)
module.exports = router;
