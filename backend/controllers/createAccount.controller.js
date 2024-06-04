require('dotenv').config();
const axios = require('axios');

exports.createAccountController = async (req, res) => {
    try {
        const customerId = req.params.Customer_id;
        const zohoDealId = req.params.Zoho_deal_id;
        const accountName = req.body;

        const payload = {
            data: [
                {
                    Cust_Id: customerId,
                    Customer_ID: zohoDealId,
                    ...accountName
                }
            ]
        };
        console.log("Payload being sent to Zoho:", JSON.stringify(payload, null, 2));
        const zohocreateAccountResponse = await axios.post(
            `${process.env.ZOHO_ACCOUNTS_API}`,
            payload,
            {
                headers: {
                    'Authorization': `Zoho-oauthtoken ${process.env.ZOHO_OAUTH_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Response from Zoho:", zohocreateAccountResponse.data);
        res.status(200).send(zohocreateAccountResponse.data);

    } catch (error) {
        console.error("Error creating account:", error.response ? error.response.data : error.message);
        res.status(500).send(error.response ? error.response.data : { message: error.message });
    }
};
