require('dotenv').config();
const axios = require('axios')

const {
    ZOHO_SHIPMENTS_API,
    ZOHO_OAUTH_TOKEN
} = process.env

exports.createShipmentController = async (req, res) => {
    try {
        console.log('clicked')
        const headers = {
            'Authorization': `Zoho-oauthtoken ${ZOHO_OAUTH_TOKEN}`,
            'Content-Type': 'application/json'
        }
        const payload = {
            data:[{
                ...req.body,
            }]
        }
        const response = await axios.post(ZOHO_SHIPMENTS_API,payload,{headers});
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).send(`Failed to create Zoho deal : ${error}`);
    }
}