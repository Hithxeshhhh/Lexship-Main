require('dotenv').config()
const axios = require('axios')

exports.updateLeadController = async (req, res) => {
    try {
        const zoho_id = req.params.Zoho_id;
        if (!zoho_id) {
            return res.status(400).json({ error: 'Zoho id is required' });
        }
        const zohoLeadApi = process.env.ZOHO_LEAD_API;
        const zohoOAuthToken = process.env.ZOHO_OAUTH_TOKEN;
        if (!zohoLeadApi || !zohoOAuthToken) {
            return res.status(500).json({ error: 'Zoho API configuration is missing' });
        }
        const toBeUpdatedData = req.body;
        const leadData = {
            data: [
                {
                    id: zoho_id,
                    ...toBeUpdatedData
                }]
        }
        console.log(`Updating lead with data: ${JSON.stringify(leadData)}`);
        console.log(`API Endpoint: ${zohoLeadApi}/${zoho_id}`);
        console.log(`${process.env.ZOHO_LEAD_API}/${zoho_id}`);
        const leadResponse = await axios.put(`${zohoLeadApi}/${zoho_id}`, leadData, {
            headers: {
                'Authorization': `Zoho-oauthtoken ${zohoOAuthToken}`,
                'Content-Type': 'application/json',
            }
        })
        res.status(leadResponse.status).json(leadResponse.data)
    } catch (error) {
        console.log('Error updating zoho lead:', error);
        if (error.response) {
            // API responded with a status code outside the range of 2xx
            res.status(error.response.status).json({
                error: 'Error updating Zoho lead',
                message: error.response.data
            });
        } else if (error.request) {
            // Request was made but no response was received
            res.status(500).json({
                error: 'No response received from Zoho API',
                message: error.message
            });
        } else {
            // Something else happened
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}