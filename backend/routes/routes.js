const express = require('express');
const { authenticateUser, verifyToken } = require('../middlewares/authentication.middleware');
const { convertController2 } = require('../controllers/convert2.controller');
const awbtopdfMiddleware = require('../middlewares/awbtopdf.middleware');
const ajwwRoutes = require('./ajwwRoutes');
const asendiaRoutes = require('./asendiaRoutes');
const router = express.Router();

// Testing route
router.get('/test', (req, res) => {
    res.json({ message: 'Testing page' });
});

// Login route
router.post('/login', authenticateUser);

// Vendor-specific manifest routes
router.use('/ajww', ajwwRoutes);
router.use('/asendia', asendiaRoutes);

// Protected routes
//pdftotif
router.post('/upload-convert', awbtopdfMiddleware, convertController2);

module.exports = router;
