require('dotenv').config();
const axios = require('axios');
exports.getLeadController = async(req,res) =>{
    try{
        const zoho_id = req.params.Zoho_id;
        if(!zoho_id){
            return res.status(400).json({error:'Zoho id is required'})
        }
        const zohoLeadApi = process.env.ZOHO_LEAD_API;
        const zohoOAuthToken = process.env.ZOHO_OAUTH_TOKEN;
        if (!zohoLeadApi || !zohoOAuthToken) {
            return res.status(500).json({ error: 'Zoho API configuration is missing' });
        }
        console.log(`${process.env.ZOHO_LEAD_API}/${zoho_id}`)
        const leadResponse = await axios.get(`${zohoLeadApi}/${zoho_id}`, {
            headers: {
                'Authorization': `Zoho-oauthtoken ${zohoOAuthToken}`,
                'Content-Type': 'application/json',
            }
        });
        res.status(leadResponse.status).json(leadResponse.data);
    }catch(error){
        console.error('Error fetching Zoho lead:', error);

        if (error.response) {
            res.status(error.response.status).json({
                error: 'Error fetching Zoho lead',
                message: error.response.data
            });
        } else if (error.request) {
            res.status(500).json({
                error: 'No response received from Zoho API',
                message: error.message
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}