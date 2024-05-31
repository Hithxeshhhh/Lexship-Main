require('dotenv').config();
const axios = require('axios');

const {
    LEX_CUSTOMER_DETAIL_API,
    BEARER_TOKEN,
    ZOHO_DEAL_API,
    ZOHO_OAUTH_TOKEN,
    LEX_UPDATE_ZOHO_API
} = process.env;

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

const createZohoDeal = async (payload) => {
    try {
        const headers = {
            'Authorization': `Zoho-oauthtoken ${ZOHO_OAUTH_TOKEN}`,
            'Content-Type': 'application/json',
        };
        const response = await axios.post(ZOHO_DEAL_API, payload, { headers });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to create Zoho deal: ${error.message}`);
    }
};

const updateCustomerDetails = async (customerId, zohoLeadId, zohoDealId) => {
    try {
        const url = `${LEX_UPDATE_ZOHO_API}Customer_Id=${customerId}&Zoho_Lead_Id=${zohoLeadId}&Zoho_Deal_Id=${zohoDealId}`;
        const headers = {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'Content-Type': 'application/json',
        };
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to update customer details: ${error.message}`);
    }
};

exports.createDealController = async (req, res) => {
    try {
        const dealName = req.body;
        const customerId = req.params.Customer_id;

        console.log(`API Called for customer detail: ${LEX_CUSTOMER_DETAIL_API}Customer_Id=${customerId}`);

        const customerDetails = await getCustomerDetails(customerId);
        const zohoLeadId = customerDetails.Zoho_Lead_ID;
        console.log(`LEX Customer Detail API Zoho ID: ${zohoLeadId}`);
        const contactName = `${customerDetails.name} ${customerDetails.last_name}`;
        const payload = {
            data: [{
                id: zohoLeadId,
                ...dealName,
                Cust_ID: customerDetails.id.toString(),
                Customer_ID: zohoLeadId,
                Customer_Type: customerDetails.account_type,
                Account_Name: contactName,
                Type_of_business: customerDetails.type_of_business
            }]
        };
        console.log(`Request body data to Zoho API: ${JSON.stringify(payload)}`);

        const zohoDealResponseData = await createZohoDeal(payload);
        const createdDealId = zohoDealResponseData.data[0].details.id;

        console.log(`Updating customer details with Deal ID: ${createdDealId}`);

        const customerUpdateResponse = await updateCustomerDetails(customerId, zohoLeadId, createdDealId);

        res.status(200).json(customerUpdateResponse);
    } catch (err) {
        console.error('Error creating deal:', err);
        res.status(400).json({ error: 'Failed to create deal', details: err.message });
    }
};
