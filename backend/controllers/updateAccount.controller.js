require('dotenv').config();
const axios = require('axios');

exports.updateAccountController = async (req, res) => {
    try {
        const zohoAccountId = req.params.Zoho_Account_id;
        const toBeUpdated = req.body;
        const payload = {
            data: [
                {
                    ...toBeUpdated
                }
            ]
        }
        const updateAccountApiResponse = await axios.put(`${process.env.ZOHO_ACCOUNTS_API}/${zohoAccountId}`, payload, {
            headers: {
                'Authorization': `Zoho-oauthtoken ${process.env.ZOHO_OAUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        })
        res.status(200).send(updateAccountApiResponse.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
}