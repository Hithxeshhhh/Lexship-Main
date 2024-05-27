require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.createLeadController = async (req, res) => {
  try {
    const leadData = req.body;

    // Send data to Zoho CRM API
    const zohoResponse = await axios.post('https://www.zohoapis.in/crm/v6/Leads', leadData, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${process.env.ZOHO_OAUTH_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });

    const zohoResponseData = zohoResponse.data;

    if (zohoResponseData.data && zohoResponseData.data.length > 0) {
      const leadId = zohoResponseData.data[0].details.id;

      // Define the path to the file
      const filePath = path.join(__dirname, '..', 'leadDetails.txt');

      // Append the lead ID to the file
      fs.appendFileSync(filePath, `${leadId}\n`, 'utf8');
    }

    // Respond with the Zoho CRM API response
    res.status(zohoResponse.status).json(zohoResponse.data);
  } catch (error) {
    console.error('Error creating lead:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      error: 'An error occurred while creating the lead',
      details: error.response ? error.response.data : error.message
    });
  }
};
