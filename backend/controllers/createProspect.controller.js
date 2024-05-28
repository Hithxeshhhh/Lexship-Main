require('dotenv').config();
const axios = require('axios');
exports.createProspectController = async (req, res) => {
    try {
        const customer_id = req.params.Customer_id;
        const zoho_id = req.params.Zoho_id;
        // console.log(customer_id,zoho_id,process.env.BEARER_TOKEN)
        const prospectResponse = await axios.get(`${process.env.ZOHO_PROSPECT_API}?Customer_Id=${customer_id}&Zoho_Id=${zoho_id}`,{
            headers:{
                'Authorization':`Bearer ${process.env.BEARER_TOKEN}`,
                'Content-Type':'application/json'
            }
        })
        res.status(200).json(prospectResponse.data)
    } catch (err) {
        res.status(400).json(err);
    }
}