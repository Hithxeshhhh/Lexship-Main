require('dotenv').config();
const axios = require('axios')

exports.createAccountController = async(req,res) => {
    try {
        const customerId = req.params.Customer_id;
        const zohoDealId = req.params.Zoho_deal_id;
        const accountName = req.body;
        const payload = {
            data:[
                {
                    Cust_Id:customerId,
                    Customer_ID:zohoDealId,
                    ...accountName
                }
            ]
        }
        const zohocreateAccountResponse = await axios.post(`${process.env.ZOHO_ACCOUNTS_API}`,payload,{
            headers:{
                'Authorization':`Zoho-oauthtoken ${process.env.ZOHO_OAUTH_TOKEN}`,
                'Content-Type':'application/json'
            }
        })
        res.status(200).send(zohocreateAccountResponse.data);

    } catch (error) {
        res.status(500).send(error);
    }
}