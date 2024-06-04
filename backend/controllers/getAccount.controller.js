require('dotenv').config();
const axios = require('axios');
exports.getAccountController = async (req,res)=>{
    try {
        const accountId = req.params.Zoho_Account_id;
        //calling the account get api serving account id to it
        const accountApiResponse = await axios.get(`${process.env.ZOHO_ACCOUNTS_API}/${accountId}`,{
            headers:{
                'Authorization' : `Zoho-oauthtoken ${process.env.ZOHO_OAUTH_TOKEN}`,
                'Content-Type' : 'application/json'
            }
        })
        res.status(200).send(accountApiResponse.data);
    } catch (error) {
        res.status(500).send(error);
    }
}