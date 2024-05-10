const express = require('express');
const uploadMiddleware = require('../middlewares/upload.middleware')(); 
const { uploadController } = require('../controllers/upload.controller');
const { convertController } = require('../controllers/convert.controller');
const { convertController2 } = require('../controllers/convert2.controller');
const { combinedController } = require('../controllers/combined.controller');
const awbtopdfMiddleware = require('../middlewares/awbtopdf.middleware');
const router = express.Router();
router.get('/test',(req,res)=>{
    res.send('Testing page')
})
router.post('/upload', uploadMiddleware, uploadController);
router.post('/convert', convertController2);
router.post('/upload-convert',[awbtopdfMiddleware,convertController2],combinedController);
module.exports = router;
