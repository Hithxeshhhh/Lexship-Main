require('dotenv').config();
const jwt = require('jsonwebtoken');

const authenticateUser = (req, res) => {
    
    const { username, password } = req.body;

    if (username === process.env.USER_NAME && password === process.env.PASSWORD) {
        // User is authenticated, generate a JWT
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Authentication successful', token });
    } else {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).redirect('/').send({ message: 'Failed to authenticate token' });
        }

        // If everything is good, save to request for use in other routes
        req.username = decoded.username;
        next();
    });
};

module.exports = { authenticateUser, verifyToken };
