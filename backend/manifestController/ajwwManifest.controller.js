const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

// Function to search for all bagging IDs by MAWB number
const searchBaggingsByMAWB = async (req, res) => {
    try {
        const { mawbNumber } = req.body;
        
        // Add vendor information to request object
        req.vendor = "ajww";
        
        if (!mawbNumber) {
            return res.status(400).json({
                success: false,
                message: 'MAWB number is required'
            });
        }

        // Search baggings table for all IDs with the given MAWB
        const [baggingsResult] = await pool.execute(
            'SELECT id FROM baggings WHERE mawb = ?',
            [mawbNumber]
        );

        if (baggingsResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No baggings found for MAWB: ${mawbNumber}`
            });
        }

        const baggingIds = baggingsResult.map(row => row.id);

        res.json({
            success: true,
            message: 'Baggings found successfully',
            vendor: req.vendor,
            mawbNumber: mawbNumber,
            totalBaggings: baggingIds.length,
            baggingIds: baggingIds
        });

    } catch (error) {
        console.error('Error in searchBaggingsByMAWB:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching baggings',
            error: error.message
        });
    }
};

// Function to search by MAWB number and generate Excel with payload data
const searchByMAWBAndGenerateExcel = async (req, res) => {
    try {
        const { mawbNumber } = req.body;
        
        // Add vendor information to request object
        req.vendor = "ajww";
        
        if (!mawbNumber) {
            return res.status(400).json({
                success: false,
                message: 'MAWB number is required'
            });
        }

        // Read JSON file for static data
        const jsonFilePath = path.join(__dirname, '../data/ajww.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

        // Step 1: Search baggings table for ALL IDs with the given MAWB
        const [baggingsResult] = await pool.execute(
            'SELECT id, flight FROM baggings WHERE mawb = ?',
            [mawbNumber]
        );

        if (baggingsResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No baggings found for MAWB: ${mawbNumber}`
            });
        }

        const baggingIds = baggingsResult.map(row => row.id);
        const flightNumber = baggingsResult[0].flight; // Get flight number from first record

        // Step 2: Search bag_items table for parcel_id using ALL bag_ids
        const bagIdPlaceholders = baggingIds.map(() => '?').join(',');
        const [bagItemsResult] = await pool.execute(
            `SELECT parcel_id FROM bag_items WHERE bag_id IN (${bagIdPlaceholders})`,
            baggingIds
        );

        if (bagItemsResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No bag items found for bag IDs: ${baggingIds.join(', ')}`
            });
        }

        // Step 3: Get all AWB numbers from parcel_id
        const awbNumbers = bagItemsResult.map(item => item.parcel_id).filter(Boolean);

        if (awbNumbers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No AWB numbers found in parcel_id'
            });
        }

        // Step 4: Search customer_shipments table for each AWB number
        const placeholders = awbNumbers.map(() => '?').join(',');
        const [shipmentsResult] = await pool.execute(
            `SELECT awb_number, payload, customer_id, received_weight FROM customer_shippments WHERE awb_number IN (${placeholders})`,
            awbNumbers
        );

        if (shipmentsResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No customer shipments found for the AWB numbers'
            });
        }

        // Process payload data and map to Excel headers
        const mappedData = [];
        
        // Get static data from JSON file for orange headers
        const staticData = jsonData.manifest_data;
        
        for (const shipment of shipmentsResult) {
            try {
                const payload = JSON.parse(shipment.payload);
                
                // Fetch company_name and mobile from ct_users table using customer_id
                let companyName = '';
                let userMobile = '';
                if (shipment.customer_id) {
                    try {
                        const [userResult] = await pool.execute(
                            'SELECT company_name, mobile FROM ct_users WHERE id = ?',
                            [shipment.customer_id]
                        );
                        if (userResult.length > 0) {
                            companyName = userResult[0].company_name || '';
                            userMobile = userResult[0].mobile || '';
                        }
                    } catch (error) {
                        console.error(`Error fetching user data for customer_id ${shipment.customer_id}:`, error);
                    }
                }
                
                // Currency conversion logic (rates show how many INR = 1 foreign currency)
                let convertedValue = payload.productValue || '';
                let finalCurrencyCode = payload.productcurrency || '';
                
                if (payload.productcurrency && payload.productValue) {
                    const sourceCurrency = payload.productcurrency.toUpperCase();
                    const sourceValue = parseFloat(payload.productValue);
                    
                    // Only convert if source currency is not USD and we have a valid value
                    if (sourceCurrency !== 'USD' && !isNaN(sourceValue) && sourceValue > 0) {
                        try {
                            // Get exchange rate for the source currency from currency_rates table
                            const [sourceCurrencyResult] = await pool.execute(
                                'SELECT exchange_rate FROM currency_rates WHERE UPPER(currency_type) = ?',
                                [sourceCurrency]
                            );
                            
                            // Get exchange rate for USD from currency_rates table  
                            const [usdCurrencyResult] = await pool.execute(
                                'SELECT exchange_rate FROM currency_rates WHERE UPPER(currency_type) = ?',
                                ['USD']
                            );
                            
                            if (sourceCurrencyResult.length > 0 && usdCurrencyResult.length > 0) {
                                const sourceToInrRate = parseFloat(sourceCurrencyResult[0].exchange_rate);
                                const usdToInrRate = parseFloat(usdCurrencyResult[0].exchange_rate);
                                
                                if (!isNaN(sourceToInrRate) && !isNaN(usdToInrRate) && sourceToInrRate > 0 && usdToInrRate > 0) {
                                    // Convert to USD
                                    // Step 1: Convert source currency to INR: sourceValue * sourceToInrRate
                                    // Step 2: Convert INR to USD: inrValue / usdToInrRate
                                    const inrValue = sourceValue * sourceToInrRate;
                                    convertedValue = (inrValue / usdToInrRate).toFixed(2);
                                    finalCurrencyCode = 'USD';
                                    
                                    // Currency conversion completed silently
                                } else {
                                    console.warn(`Invalid exchange rates - ${sourceCurrency}: ${sourceToInrRate}, USD: ${usdToInrRate}`);
                                    // Keep original values if rates are invalid
                                    convertedValue = sourceValue.toFixed(2);
                                    finalCurrencyCode = sourceCurrency;
                                }
                            } else {
                                console.warn(`Exchange rates not found - ${sourceCurrency}: ${sourceCurrencyResult.length > 0}, USD: ${usdCurrencyResult.length > 0}`);
                                // Keep original values if rates not found
                                convertedValue = sourceValue.toFixed(2);
                                finalCurrencyCode = sourceCurrency;
                            }
                        } catch (error) {
                            console.error(`Error converting ${sourceCurrency} to USD for AWB ${shipment.awb_number}:`, error);
                            // Keep original values if conversion fails
                            convertedValue = sourceValue.toFixed(2);
                            finalCurrencyCode = sourceCurrency;
                        }
                    } else if (sourceCurrency === 'USD') {
                        // If already USD, just format the value
                        convertedValue = sourceValue.toFixed(2);
                        finalCurrencyCode = 'USD';
                    } else if (sourceCurrency === 'INR') {
                        // If INR, convert to USD
                        try {
                            const [usdCurrencyResult] = await pool.execute(
                                'SELECT exchange_rate FROM currency_rates WHERE UPPER(currency_type) = ?',
                                ['USD']
                            );
                            
                            if (usdCurrencyResult.length > 0) {
                                const usdToInrRate = parseFloat(usdCurrencyResult[0].exchange_rate);
                                if (!isNaN(usdToInrRate) && usdToInrRate > 0) {
                                    convertedValue = (sourceValue / usdToInrRate).toFixed(2);
                                    finalCurrencyCode = 'USD';
                                    // Currency conversion completed silently
                                } else {
                                    convertedValue = sourceValue.toFixed(2);
                                    finalCurrencyCode = sourceCurrency;
                                }
                            } else {
                                convertedValue = sourceValue.toFixed(2);
                                finalCurrencyCode = sourceCurrency;
                            }
                        } catch (error) {
                            console.error(`Error converting INR to USD for AWB ${shipment.awb_number}:`, error);
                            convertedValue = sourceValue.toFixed(2);
                            finalCurrencyCode = sourceCurrency;
                        }
                    } else {
                        // If no valid currency or value, keep original
                        convertedValue = sourceValue ? sourceValue.toFixed(2) : '';
                        finalCurrencyCode = sourceCurrency || '';
                    }
                }
                
                const mappedRow = await mapPayloadToExcelHeaders(payload, shipment.awb_number, staticData, mawbNumber, flightNumber, companyName, convertedValue, finalCurrencyCode, shipment.received_weight, userMobile);
                mappedData.push(mappedRow);
            } catch (error) {
                console.error(`Error parsing payload for AWB ${shipment.awb_number}:`, error);
            }
        }

        // Generate Excel file with mapped data
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Manifest Data');

        // Get headers from JSON structure
        const headers = Object.keys(jsonData.manifest_data);

        // Add headers row
        const headerRow = worksheet.addRow(headers);

        // Add data rows
        mappedData.forEach(dataRow => {
            const rowData = headers.map(header => dataRow[header] || '');
            worksheet.addRow(rowData);
        });

        // Apply styling
        applyExcelStyling(worksheet, headers);

        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `mawb_${mawbNumber}_${timestamp}.xlsx`;
        const outputPath = path.join(__dirname, '../manifestUploads', filename);

        // Write Excel file
        await workbook.xlsx.writeFile(outputPath);
        
        console.log(`[${new Date().toISOString()}] Excel file generated successfully: ${filename} for MAWB: ${mawbNumber}`);

        res.json({
            success: true,
            message: 'Excel file generated successfully from database data',
            vendor: req.vendor,
            filename: filename,
            mawbNumber: mawbNumber,
            totalBaggings: baggingIds.length,
            totalShipments: mappedData.length,
            baggingIds: baggingIds
        });

    } catch (error) {
        console.error('Error in searchByMAWBAndGenerateExcel:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing MAWB data',
            error: error.message
        });
    }
};

// Function to map payload data to Excel headers
// Function to convert state code to full state name
const convertStateCodeToName = async (stateCode) => {
    if (!stateCode || stateCode.length <= 2) {
        // If it's a short code, try to convert it
        try {
            const [rows] = await pool.query(
                'SELECT StateName FROM India_states WHERE StateCode = ?',
                [stateCode]
            );
            return rows.length > 0 ? rows[0].StateName : stateCode;
        } catch (error) {
            console.error('Error converting state code:', error);
            return stateCode; // Return original if conversion fails
        }
    }
    return stateCode; // Return as is if it's already a full name
};

const mapPayloadToExcelHeaders = async (payload, awbNumber, staticData, mawbNumberFromReq, flightNumber, companyName, convertedValue, finalCurrencyCode, receivedWeight, userMobile) => {
    const mapping = {
        // MAWB Level Data - Static from JSON
        'manifest_number': staticData['manifest_number'] || '',
        'flight_number': flightNumber || '', // Use flight number from database
        'flight_date': staticData['flight_date'] || '',
        'mawb_number': mawbNumberFromReq || '', // Use MAWB from request body
        'hawb_number': staticData['hawb_number'] || '',
        'mawb_origin': staticData['mawb_origin'] || '',
        'mawb_destination': staticData['mawb_destination'] || '',
        'total_bags': staticData['total_bags'] || '',
        'total_weight': staticData['total_weight'] || '',
        'manifest_value_type': staticData['manifest_value_type'] || '',
        
        // MAWB Shipper Data - Static from JSON
        'mawb_shipper_name': staticData['mawb_shipper_name'] || '',
        'mawb_shipper_street_address_line_1': staticData['mawb_shipper_street_address_line_1'] || '',
        'mawb_shipper_street_address_line_2': staticData['mawb_shipper_street_address_line_2'] || '',
        'mawb_shipper_city': staticData['mawb_shipper_city'] || '',
        'mawb_shipper_county_or_state': staticData['mawb_shipper_county_or_state'] || '',
        'mawb_shipper_postal_code': staticData['mawb_shipper_postal_code'] || '',
        'mawb_shipper_country_code': staticData['mawb_shipper_country_code'] || '',
        'mawb_shipper_tel': staticData['mawb_shipper_tel'] || '',
        'mawb_shipper_email': staticData['mawb_shipper_email'] || '',
        
        // MAWB Consignee Data - Static from JSON
        'mawb_consignee_name': staticData['mawb_consignee_name'] || '',
        'mawb_consignee_street_address_line_1': staticData['mawb_consignee_street_address_line_1'] || '',
        'mawb_consignee_street_address_line_2': staticData['mawb_consignee_street_address_line_2'] || '',
        'mawb_consignee_city': staticData['mawb_consignee_city'] || '',
        'mawb_consignee_county_or_state': staticData['mawb_consignee_county_or_state'] || '',
        'mawb_consignee_postal_code': staticData['mawb_consignee_postal_code'] || '',
        'mawb_consignee_country_code': staticData['mawb_consignee_country_code'] || '',
        'mawb_consignee_tel': staticData['mawb_consignee_tel'] || '',
        'mawb_consignee_email': staticData['mawb_consignee_email'] || '',
        
        // Consignment Level Data - From Database Payload
        'consignment_number': awbNumber || '',
        'shipper_name': companyName || '',
        'shipper_street_address_line_1': payload.sellerAddress || '',
        'shipper_street_address_line_2': payload.sellerCity || '',
        'shipper_city': payload.sellerCity || '',
        'shipper_county_or_state': await convertStateCodeToName(payload.sellerState) || '',
        'shipper_postal_code': payload.sellerPincode || '',
        'shipper_country_code': payload.sellercountrycode || '',
        'shipper_tel': userMobile || payload.sellerMobile || '',
        'shipper_email': payload.sellerEmail || '',
        'consignee_name': `${payload.consigneeFirstName || ''} ${payload.consigneeLastName || ''}`.trim(),
        'consignee_street_address_line_1': payload.consigneeAddress || '',
        'consignee_street_address_line_2': payload.consigneeCity || '',
        'consignee_city': payload.consigneeCity || '',
        'consignee_county_or_state': payload.consigneeState || '',
        'consignee_postal_code': payload.consigneePincode || '',
        'consignee_country_code': payload.consigneeCountryCode || '',
        'consignee_tel': payload.consigneeMobile || '',
        'consignee_email': payload.consigneeEmail || '',
        'pieces': payload.Pcs || '',
        'weight': receivedWeight || '',
        'description': payload.productDescription || '',
        'value': convertedValue || payload.productValue || '',
        'value_currency_code': finalCurrencyCode || payload.productcurrency || '',
        'service_info': '',
        'bag_numbers': ''
    };

    return mapping;
};

// Function to apply Excel styling
const applyExcelStyling = (worksheet, headers) => {
    // Define header groups
    const orangeHeaders = [
        'manifest_number', 'flight_number', 'flight_date', 'mawb_number', 'hawb_number',
        'mawb_origin', 'mawb_destination', 'total_bags', 'total_weight', 'manifest_value_type',
        'mawb_shipper_name', 'mawb_shipper_street_address_line_1', 'mawb_shipper_street_address_line_2',
        'mawb_shipper_city', 'mawb_shipper_county_or_state', 'mawb_shipper_postal_code',
        'mawb_shipper_country_code', 'mawb_shipper_tel', 'mawb_shipper_email',
        'mawb_consignee_name', 'mawb_consignee_street_address_line_1', 'mawb_consignee_street_address_line_2',
        'mawb_consignee_city', 'mawb_consignee_county_or_state', 'mawb_consignee_postal_code',
        'mawb_consignee_country_code', 'mawb_consignee_tel', 'mawb_consignee_email'
    ];

    const darkBlueHeaders = [
        'consignment_number', 'shipper_name', 'shipper_street_address_line_1', 'shipper_street_address_line_2',
        'shipper_city', 'shipper_county_or_state', 'shipper_postal_code', 'shipper_country_code',
        'shipper_tel', 'shipper_email', 'consignee_name', 'consignee_street_address_line_1',
        'consignee_street_address_line_2', 'consignee_city', 'consignee_county_or_state',
        'consignee_postal_code', 'consignee_country_code', 'consignee_tel', 'consignee_email',
        'pieces', 'weight', 'description', 'value', 'value_currency_code', 'service_info', 'bag_numbers'
    ];

    // Apply styling to all rows
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            const headerName = headers[colNumber - 1];
            
            // Set font properties
            cell.font = {
                name: 'Aptos Narrow',
                size: 11,
                color: { argb: 'FF000000' }
            };
            
            cell.alignment = {
                horizontal: 'left',
                vertical: 'middle'
            };

            // Set background color for header row only
            if (rowNumber === 1) {
                if (orangeHeaders.includes(headerName)) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFE6CC' }
                    };
                } else if (darkBlueHeaders.includes(headerName)) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE6F3FF' }
                    };
                }
            }
        });
    });

    // Set column widths
    headers.forEach((header, index) => {
        const column = worksheet.getColumn(index + 1);
        column.width = Math.max(header.length + 2, 20);
    });
};

// Function to generate Excel file from JSON data
const generateExcelFromJSON = async (req, res) => {
    try {
        // Add vendor information to request object
        req.vendor = "ajww";
        
        // Read the JSON file
        const jsonFilePath = path.join(__dirname, '../data/ajww.json');
        
        if (!fs.existsSync(jsonFilePath)) {
            return res.status(404).json({
                success: false,
                message: 'JSON file not found'
            });
        }

        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const manifestData = jsonData.manifest_data;

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Manifest Data');

        // Get headers and values
        const headers = Object.keys(manifestData);
        const values = Object.values(manifestData);

        // Add headers row
        const headerRow = worksheet.addRow(headers);
        
        // Add values row
        const valueRow = worksheet.addRow(values);

        // Define the header groups for background colors based on JSON structure
        const orangeHeaders = [
            'manifest_number', 'flight_number', 'flight_date', 'mawb_number', 'hawb_number',
            'mawb_origin', 'mawb_destination', 'total_bags', 'total_weight', 'manifest_value_type',
            'mawb_shipper_name', 'mawb_shipper_street_address_line_1', 'mawb_shipper_street_address_line_2',
            'mawb_shipper_city', 'mawb_shipper_county_or_state', 'mawb_shipper_postal_code',
            'mawb_shipper_country_code', 'mawb_shipper_tel', 'mawb_shipper_email',
            'mawb_consignee_name', 'mawb_consignee_street_address_line_1', 'mawb_consignee_street_address_line_2',
            'mawb_consignee_city', 'mawb_consignee_county_or_state', 'mawb_consignee_postal_code',
            'mawb_consignee_country_code', 'mawb_consignee_tel', 'mawb_consignee_email'
        ];

        const darkBlueHeaders = [
            'consignment_number', 'shipper_name', 'shipper_street_address_line_1', 'shipper_street_address_line_2',
            'shipper_city', 'shipper_county_or_state', 'shipper_postal_code', 'shipper_country_code',
            'shipper_tel', 'shipper_email', 'consignee_name', 'consignee_street_address_line_1',
            'consignee_street_address_line_2', 'consignee_city', 'consignee_county_or_state',
            'consignee_postal_code', 'consignee_country_code', 'consignee_tel', 'consignee_email',
            'pieces', 'weight', 'description', 'value', 'value_currency_code', 'service_info', 'bag_numbers'
        ];

        // Set font and background for header row
        headerRow.eachCell((cell, colNumber) => {
            const headerName = headers[colNumber - 1];
            
            // Set font properties
            cell.font = {
                name: 'Aptos Narrow',
                size: 11,
                color: { argb: 'FF000000' }
            };
            
            cell.alignment = {
                horizontal: 'left',
                vertical: 'middle'
            };

            // Set background color based on header group
            if (orangeHeaders.includes(headerName)) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFE6CC' } // Orange Accent 2, Lighter 80%
                };
            } else if (darkBlueHeaders.includes(headerName)) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE6F3FF' } // Dark Blue, Text 2, Lighter 90%
                };
            }
        });

        // Set font for values row (no background color)
        valueRow.eachCell((cell, colNumber) => {
            cell.font = {
                name: 'Aptos Narrow',
                size: 11,
                color: { argb: 'FF000000' }
            };
            cell.alignment = {
                horizontal: 'left',
                vertical: 'middle'
            };
        });

        // Set column widths for better readability
        headers.forEach((header, index) => {
            const column = worksheet.getColumn(index + 1);
            column.width = Math.max(header.length + 2, 20);
        });

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `ajww_manifest_${timestamp}.xlsx`;
        const outputPath = path.join(__dirname, '../manifestUploads', filename);

        // Write Excel file
        await workbook.xlsx.writeFile(outputPath);
        
        console.log(`[${new Date().toISOString()}] Excel file generated successfully: ${filename} from JSON data`);

        // Send success response with file info
        res.json({
            success: true,
            message: 'Excel file generated successfully',
            vendor: req.vendor,
            filename: filename,
            filePath: outputPath,
            headers: headers,
            data: manifestData,
            stylingApplied: true,
            headerGroups: {
                orangeHeaders: orangeHeaders.length,
                darkBlueHeaders: darkBlueHeaders.length
            }
        });

    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating Excel file',
            error: error.message
        });
    }
};

// Function to update JSON data
const updateJSONData = async (req, res) => {
    try {
        // Add vendor information to request object
        req.vendor = "ajww";
        
        const { updates } = req.body;
        
        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Updates object is required'
            });
        }

        const jsonFilePath = path.join(__dirname, '../data/ajww.json');
        
        if (!fs.existsSync(jsonFilePath)) {
            return res.status(404).json({
                success: false,
                message: 'JSON file not found'
            });
        }

        // Read current JSON data
        const currentData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        
        // Update the manifest_data with new values
        if (currentData.manifest_data) {
            Object.assign(currentData.manifest_data, updates);
        } else {
            currentData.manifest_data = updates;
        }

        // Write updated data back to file
        fs.writeFileSync(jsonFilePath, JSON.stringify(currentData, null, 2), 'utf8');
        
        res.json({
            success: true,
            vendor: req.vendor,
            message: 'JSON data updated successfully',
            updatedFields: Object.keys(updates),
            data: currentData
        });

    } catch (error) {
        console.error('Error updating JSON file:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating JSON file',
            error: error.message
        });
    }
};

// Function to get JSON data
const getJSONData = async (req, res) => {
    try {
        // Add vendor information to request object
        req.vendor = "ajww";
        
        const jsonFilePath = path.join(__dirname, '../data/ajww.json');
        
        if (!fs.existsSync(jsonFilePath)) {
            return res.status(404).json({
                success: false,
                message: 'JSON file not found'
            });
        }

        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        
        res.json({
            success: true,
            vendor: req.vendor,
            data: jsonData
        });

    } catch (error) {
        console.error('Error reading JSON file:', error);
        res.status(500).json({
            success: false,
            message: 'Error reading JSON file',
            error: error.message
        });
    }
};

// Function to delete Excel file by MAWB number
const deleteExcelFile = async (req, res) => {
    try {
        // Add vendor information to request object
        req.vendor = "ajww";
        
        const mawbNumber = req.params.mawbNumber;
        const uploadsDir = path.join(__dirname, '../manifestUploads');
        
        // Check if directory exists
        if (!fs.existsSync(uploadsDir)) {
            return res.status(404).json({
                success: false,
                message: 'Uploads directory not found'
            });
        }

        // Read all files in the directory
        const files = fs.readdirSync(uploadsDir);
        
        // Find file that contains the MAWB number
        const targetFile = files.find(file => 
            file.toLowerCase().includes(mawbNumber.toLowerCase()) && 
            file.endsWith('.xlsx')
        );

        if (!targetFile) {
            return res.status(404).json({
                success: false,
                message: `No Excel file found for MAWB number: ${mawbNumber}`
            });
        }

        const filePath = path.join(uploadsDir, targetFile);
        
        // Delete the file
        fs.unlinkSync(filePath);
        
        console.log(`[${new Date().toISOString()}] Excel file deleted: ${targetFile} for MAWB: ${mawbNumber}`);

        res.json({
            success: true,
            message: `Excel file deleted successfully for MAWB: ${mawbNumber}`,
            vendor: req.vendor,
            deletedFile: targetFile
        });

    } catch (error) {
        console.error('Error in deleteExcelFile:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting file',
            error: error.message
        });
    }
};

// Function to download the generated Excel file by MAWB number
const downloadExcelFile = async (req, res) => {
    try {
        // Add vendor information to request object
        req.vendor = "ajww";
        
        const mawbNumber = req.params.mawbNumber;
        const uploadsDir = path.join(__dirname, '../manifestUploads');
        
        // Check if directory exists
        if (!fs.existsSync(uploadsDir)) {
            return res.status(404).json({
                success: false,
                message: 'Uploads directory not found'
            });
        }

        // Read all files in the directory
        const files = fs.readdirSync(uploadsDir);
        
        // Find file that contains the MAWB number
        const targetFile = files.find(file => 
            file.toLowerCase().includes(mawbNumber.toLowerCase()) && 
            file.endsWith('.xlsx')
        );

        if (!targetFile) {
            return res.status(404).json({
                success: false,
                message: `No Excel file found for MAWB number: ${mawbNumber}`
            });
        }

        const filePath = path.join(uploadsDir, targetFile);
        
        // Set filename for download
        const downloadFilename = `manifest_${mawbNumber}.xlsx`;
        
        console.log(`[${new Date().toISOString()}] Excel file sent to frontend: ${downloadFilename} for MAWB: ${mawbNumber}`);

        res.download(filePath, downloadFilename, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).json({
                    success: false,
                    message: 'Error downloading file'
                });
            }
        });

    } catch (error) {
        console.error('Error in downloadExcelFile:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading file',
            error: error.message
        });
    }
};

module.exports = {
    generateExcelFromJSON,
    getJSONData,
    downloadExcelFile,
    deleteExcelFile,
    searchByMAWBAndGenerateExcel,
    searchBaggingsByMAWB,
    updateJSONData
};