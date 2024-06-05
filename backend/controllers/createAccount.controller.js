require('dotenv').config();
const axios = require('axios');

const {
    LEX_CUSTOMER_DETAIL_API,
    BEARER_TOKEN,
    ZOHO_DEAL_API,
    ZOHO_OAUTH_TOKEN,
    ZOHO_ACCOUNTS_API
} = process.env;

//Fetching Customer details from Lex customer detail api
const getCustomerDetails = async (customerId) => {
    try {
        const url = `${LEX_CUSTOMER_DETAIL_API}Customer_Id=${customerId}`;
        const headers = {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'Content-Type': 'application/json',
        };
        const response = await axios.get(url, { headers });
        return response.data[0];
    } catch (error) {
        throw new Error(`Failed to fetch customer details: ${error.message}`);
    }
};

//Fetching Zoho Deal details from zoho deal api
const getZohoDealDetails = async (zohoDealId) => {
    try {
        const url = `${ZOHO_DEAL_API}/${zohoDealId}`;
        const headers = {
            'Authorization': `Zoho-oauthtoken ${ZOHO_OAUTH_TOKEN}`,
            'Content-Type': 'application/json',
        };
        const response = await axios.get(url, { headers });
        return response.data.data[0];
    } catch (error) {
        throw new Error(`Failed to fetch Zoho deal details: ${error.message}`);
    }
};

//Creating a zoho account from zoho accounts api
const createZohoAccount = async (payload) => {
    try {
        const headers = {
            'Authorization': `Zoho-oauthtoken ${ZOHO_OAUTH_TOKEN}`,
            'Content-Type': 'application/json',
        };
        const response = await axios.post(ZOHO_ACCOUNTS_API, payload, { headers });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to create Zoho account: ${error.message}`);
    }
};

//Constructing payload that is to be sent to create account
const constructPayload = (customerId, zohoDealId, accountName, customerDetails, dealDetails) => {
    return {
        data: [
            {
                Cust_Id: customerId,
                Customer_ID: zohoDealId,
                ...accountName,
                Account_Type: customerDetails.account_type,
                IFSC_Code: customerDetails.ifsc_code,
                Bank_Account_Number: customerDetails.bank_account,
                Market_Place: dealDetails.Market_Place,
                Competitors: dealDetails.Competitors,
                No_of_shipments: dealDetails.No_of_shipments1,
                Major_Destinations: dealDetails.Major_Destinations1,
                Expectations_of_the_customer_for_Services_Quot: dealDetails.Expectations_of_the_customer_for_Services_Quot,
                Weight_Package: dealDetails.Weight_Package,
                Type_of_business: dealDetails.Type_of_business,
                Locked__s: dealDetails.Locked__s,
                Tag: dealDetails.Tag,
            }
        ]
    };
};

//Create Account Controller
exports.createAccountController = async (req, res) => {
    try {
        const { Customer_id: customerId} = req.params;
        const accountName = req.body;
        if (!customerId) {
            return res.status(400).json({ error: 'Customer_id is required' });
        }
        if (!accountName || Object.keys(accountName).length === 0) {
            return res.status(400).json({ error: 'Account name details are required in the request body' });
        }
        const customerDetails = await getCustomerDetails(customerId);
        const zohoDealId = customerDetails.Zoho_Deal_ID;
        const dealDetails = await getZohoDealDetails(zohoDealId);
        const payload = constructPayload(customerId, zohoDealId, accountName, customerDetails, dealDetails);
        console.log("Payload being sent to Zoho:", JSON.stringify(payload, null, 2));
        // const zohoCreateAccountResponse = await createZohoAccount(payload);
        // console.log("Response from Zoho:", zohoCreateAccountResponse);
        // res.status(200).send(zohoCreateAccountResponse);
    } catch (error) {
        console.error("Error creating account:", error.response ? error.response.data : error.message);
        res.status(500).send(error.response ? error.response.data : { message: error.message });
    }
};
