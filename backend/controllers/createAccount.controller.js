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
const constructPayload = (customerId, zohoDealId, reqBodyData, customerDetails, dealDetails) => {
    return {
        data: [
            {
                Adcode: customerDetails.adcode,
                Bank_Account_Number: customerDetails.bank_account,
                Cust_Id: customerId,
                Customer_ID: zohoDealId,
                ...reqBodyData,
                Mobile: customerDetails.mobile,
                Email: customerDetails.email,
                Account_Type: customerDetails.account_type,
                IFSC_Code: customerDetails.ifsc_code,
                Market_Place: customerDetails.Market_Place,
                Competitors: dealDetails.Competitors,
                No_of_shipments: dealDetails.No_of_shipments1,
                Major_Destinations1: dealDetails.Major_Destinations1,
                Expectations_of_the_customer_for_Services_Quot: dealDetails.Expectations_of_the_customer_for_Services_Quot,
                Weight_Package: dealDetails.Weight_Package,
                Type_of_business: dealDetails.Type_of_business,
                Locked__s: dealDetails.Locked__s,
                Tag: dealDetails.Tag,
                Prospect_Name: dealDetails.Deal_Name,
                Prospect_Stage: dealDetails.Stage,
                Account: customerDetails.Account||"",
                Account_Status: customerDetails.Account_Status||"",
                Account_Type1: customerDetails.Account_Type1||"",
                Adcode_Certificate: customerDetails.Adcode_Certificate||"",
                Address_Proof: customerDetails.Address_Proof||"",
                Billing_City: customerDetails.Billing_City||"",
                Billing_Code: customerDetails.Billing_Code||"",
                Billing_Country: customerDetails.Billing_Country||"",
                Billing_State: customerDetails.Billing_State||"",
                Billing_State1: customerDetails.Billing_State1||"",
                Billing_Street: customerDetails.Billing_Street||"",
                Account_Number: customerDetails.Account_Number||"",
                GST_Certificate: customerDetails.GST_Certificate||"",
                GST_Number: customerDetails.GST_Number||"",
                Identity_Proof: customerDetails.Identity_Proof||"",
                IEC_Certificate: customerDetails.IEC_Certificate||"",
                IEC_Code: customerDetails.IEC_Code||"",
                Industry: customerDetails.Industry||"",
                LUT_Certificate: customerDetails.LUT_Certificate||"",
                LUT_Expiration_Date: customerDetails.LUT_Expiration_Date||"",
                Phone: customerDetails.Phone||"",
                Sales_Person_Name: customerDetails.Sales_Person_Name||"",
                Seller: customerDetails.Seller||"",
                Seller_ID: customerDetails.Seller_ID||"",
                Shipping_City: customerDetails.Shipping_City||"",
                Shipping_Code: customerDetails.Shipping_Code|| "",
                Shipping_Country: customerDetails.Shipping_Country||"",
                Shipping_State: customerDetails.Shipping_State||"",
                Shipping_State1: customerDetails.Shipping_State1||"",
                Shipping_Street: customerDetails.Shipping_Street||"",
                Upload_Address_Proof: customerDetails.Upload_Address_Proof||"",
                Upload_Identity_Proof: customerDetails.Upload_Identity_Proof||"",
            }
        ]
    };
};

//Create Account Controller
exports.createAccountController = async (req, res) => {
    try {
        const { Customer_id: customerId } = req.params;
        const reqBodyData = req.body;
        if (!customerId) {
            return res.status(400).json({ error: 'Customer_id is required' });
        }
        const customerDetails = await getCustomerDetails(customerId);
        const zohoDealId = customerDetails.Zoho_Deal_ID;
        const dealDetails = await getZohoDealDetails(zohoDealId);
        const payload = constructPayload(customerId, zohoDealId, reqBodyData, customerDetails, dealDetails);
        console.log("Payload being sent to Zoho Accounts API:", JSON.stringify(payload, null, 2));
        // const zohoCreateAccountResponse = await createZohoAccount(payload);
        // console.log("Response from Zoho:", zohoCreateAccountResponse);
        // res.status(200).send(zohoCreateAccountResponse);
    } catch (error) {
        console.error("Error creating account:", error.response ? error.response.data : error.message);
        res.status(500).send(error.response ? error.response.data : { message: error.message });
    }
};
