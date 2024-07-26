const express = require('express');
const { authenticateUser, verifyToken } = require('../middlewares/authentication.middleware');
const { convertController2 } = require('../controllers/convert2.controller');
const awbtopdfMiddleware = require('../middlewares/awbtopdf.middleware');
const router = express.Router();

// Testing route
router.get('/test', (req, res) => {
    res.json({ message: 'Testing page' });
});

// Login route
router.post('/login', authenticateUser);


// Protected routes
//pdftotif
router.post('/upload-convert', awbtopdfMiddleware, convertController2);


module.exports = router;
