import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import CSVReader from "react-csv-reader";
import React, { useEffect, useState } from "react";
import SideNav from "../components/SideNav";
import axios from "axios";
import { AlertCircle, ArrowLeft, CheckCircle, ChevronDown, Database, Info, RefreshCw, Settings, Upload, X } from "lucide-react";
import { FaTruck, FaUser, FaUserPlus } from "react-icons/fa";

const Toast = ({ notifications, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 20000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const getBackgroundColor = (type) => {
    switch(type) {
      case 'success': return 'bg-green-600';
      case 'error': return 'bg-red-600';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-blue-600';
    }
  };
  
  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-white" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-white" />;
      case 'warning': return <Info className="w-5 h-5 text-white" />;
      default: return <Info className="w-5 h-5 text-white" />;
    }
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {notifications.map((notification, index) => (
        <div key={index} className="animate-slideInRight">
          <div className={`flex items-center p-4 rounded-lg shadow-lg ${getBackgroundColor(notification.type)}`}>
            <div className="flex-shrink-0 mr-3">
              {getIcon(notification.type)}
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-white whitespace-pre-line">
                {notification.message}
              </p>
            </div>
            <button 
              onClick={() => onClose(index)}
              className="ml-auto flex-shrink-0 text-white hover:text-gray-200 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const Progress = ({ value }) => (
  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
    <div
      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 flex items-center justify-end"
      style={{ width: `${value}%` }}
    >
      {value > 30 && (
        <span className="text-xs font-semibold mr-2 text-white drop-shadow-md">
          {Math.round(value)}%
        </span>
      )}
    </div>
  </div>
);

const CategoryCard = ({ icon, title, onClick }) => (
  <div 
    onClick={onClick}
    className="flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 bg-gray-800 hover:bg-gray-750 border-2 border-transparent hover:border-purple-500 transform hover:scale-[1.02]"
  >
    <div className="p-3 rounded-full bg-gray-700">
      {icon}
    </div>
    <span className="ml-3 font-medium">{title}</span>
  </div>
);

const handleCSVUpload = (data, setInputData, showNotification, setShowBulkUpload) => {
  const awbNumbers = data.map(row => row.Awb_no).filter(awb => awb);
  setInputData(awbNumbers.join(','));

  // Show notification when CSV is successfully loaded
  if (awbNumbers.length > 0) {
    showNotification('success', 'CSV file uploaded successfully!');
    // Hide bulk upload section after successful CSV upload
    setShowBulkUpload(false);
  } else {
    showNotification('warning', 'No valid AWB numbers found in the CSV file.');
  }
};

const downloadFailedAWBs = (failedUpdates, results) => {
  let failedAWBsMap = new Map(); // Using Map to store unique AWBs with their errors

  // For POST requests (create-shipment)
  if (results?.length > 0) {
    results.forEach(result => {
      if (result.failedAWBs) {
        result.failedAWBs.forEach(item => {
          // Only add if not already present or if the error is "duplicate data"
          if (!failedAWBsMap.has(item.awb) || item.error.includes('duplicate data')) {
            failedAWBsMap.set(item.awb, item.error);
          }
        });
      }
    });
  }

  // For failedUpdates in POST response
  if (failedUpdates?.failedAWBs?.length > 0) {
    failedUpdates.failedAWBs.forEach(item => {
      // Prioritize "duplicate data" error
      if (!failedAWBsMap.has(item.awb) || item.error.includes('duplicate data')) {
        failedAWBsMap.set(item.awb, item.error);
      }
    });
  }

  // If there are any failed AWBs, create and download the file
  if (failedAWBsMap.size > 0) {
    const content = Array.from(failedAWBsMap.entries())
      .map(([awb, error]) => `${awb} - ${error}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `failed_awbs_${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return failedAWBsMap.size;
  }

  return 0;
};

const LexZohoSync = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategorySelection, setShowCategorySelection] = useState(true);
  const [inputData, setInputData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  

  const categories = [
    { id: "shipments", title: "Shipments", icon: <FaTruck className="h-5 w-5" /> },
    { id: "accounts", title: "Accounts", icon: <Database className="h-5 w-5" /> },
    { id: "suspects", title: "Suspects", icon: <FaUserPlus className="h-5 w-5" /> },
    { id: "prospects", title: "Prospects", icon: <FaUser className="h-5 w-5" /> },
  ];

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowCategorySelection(false);
  };

  const handleBackToCategories = () => {
    setShowCategorySelection(true);
    setInputData("");
    setIsLoading(false);
    setShowBulkUpload(false); 
  };

  const showNotification = (type, message) => {
    setNotifications(prev => [...prev, { type, message }]);
  };

  const clearNotification = (index) => {
    if (index !== undefined) {
      setNotifications(prev => prev.filter((_, i) => i !== index));
    } else {
      setNotifications([]);
    }
  };

  const validateInput = () => {
    if (!inputData.trim()) {
      showNotification('warning', 'Please enter data to synchronize');
      return false;
    }
    return true;
  };

  // Vite environment variables must be prefixed with VITE_
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const zohoBaseUrl = import.meta.env.VITE_ZOHO_BASE_URL;

  const getZohoEndpoint = (category, hasId) => {
    switch(category) {
      case 'shipments':
        return zohoBaseUrl + (hasId ? 'update-shipment' : 'create-shipment');
      case 'accounts':
        return zohoBaseUrl + (hasId ? 'update-account' : 'create-account');
      case 'suspects':
        return zohoBaseUrl + (hasId ? 'update-lead' : 'create-lead');
      case 'prospects':
        return zohoBaseUrl + (hasId ? 'update-deal' : 'create-deal');
      default:
        return zohoBaseUrl;
    }
  };

  const getDetailsEndpoint = (category) => {
    switch(category) {
      case 'shipments':
        return 'shipment/details';
      case 'accounts':
        return 'customer/details';
      case 'suspects':
        return 'customer/details';
      case 'prospects':
        return 'customer/details';
      default:
        return '';  
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedCategory) {
      showNotification('warning', 'Please select a category');
      return;
    }
  
    if (!validateInput()) {
      return;
    }
  
    if (!inputData.trim()) {
      showNotification('warning', 'Please enter data to synchronize');
      return;
    }
  
    setIsLoading(true);
    setProgress(0);
    setShowBulkUpload(false);
  
    const bearerToken = import.meta.env.VITE_BEARER_TOKEN;
    const zohoBearerToken = import.meta.env.VITE_ZOHO_BEARER_TOKEN;
  
    try {
      const awbNumbers = inputData.split(',').map(awb => awb.trim());
      const shipmentIds = [];
      const createShipments = [];
      const accountIds = [];
      const createAccounts = [];
      const dealIds = [];
      const createDeals = [];
  
// automatically detects which category the input data belongs to

      for (const awb of awbNumbers) {
        const queryParam = ['accounts', 'prospects', 'suspects'].includes(selectedCategory) ? 'Customer_Id' : 'AWB';
        const detailsEndpoint = `${apiBaseUrl}${getDetailsEndpoint(selectedCategory)}?${queryParam}=${awb}`;
        const detailsResponse = await axios.get(detailsEndpoint, {
          headers: {
            'Authorization': `Bearer ${bearerToken}`
          }
        });
        const details = detailsResponse.data;
  
        switch (selectedCategory) {
          case 'shipments':
            if (details.id) {
              shipmentIds.push(details.id);
            } else {
              createShipments.push(awb);
            }
            break;
          case 'accounts':
            if (details[0].Zoho_Cust_ID) {
              accountIds.push(details[0].Zoho_Cust_ID);
            } else {
              createAccounts.push(awb);
              console.error(`No Zoho_Cust_ID found for Customer_Id: ${awb}`);
            }
            break;
          case 'prospects':
            if (details[0].Zoho_Deal_ID) {
              dealIds.push(details[0].Zoho_Deal_ID);
            } else {
              createDeals.push(awb);
              console.error(`No Zoho_Deal_ID found for Deal_Id: ${awb}`);
            }
            break;
          case 'suspects':
            if (details[0].Zoho_Deal_ID) {
              dealIds.push(details[0].Zoho_Deal_ID);
            } else {
              createDeals.push(awb);
              console.error(`No Zoho_Deal_ID found for Deal_Id: ${awb}`);
            }
            break;
          default:
            break;
        }
        setProgress(prevProgress => prevProgress + (50 / awbNumbers.length));
      }
  
      // Log the arrays to debug
      console.log('Shipment IDs:', shipmentIds);
      console.log('Create Shipments:', createShipments);
      console.log('Account IDs:', accountIds);
      console.log('Create Accounts:', createAccounts);
      console.log('Deal IDs:', dealIds);
      console.log('Create Deals:', createDeals);
  
      if (shipmentIds.length === 0 && createShipments.length === 0 && accountIds.length === 0 && createAccounts.length === 0 && dealIds.length === 0 && createDeals.length === 0) {
        showNotification('error', 'No valid IDs found.');
        setIsLoading(false);
        return;
      }
  
      const processRequest = async (ids, createIds, endpoint, method, category) => {
        if (ids.length > 0) {
          const postData = category === 'accounts' ? { accountIds: ids } : 
                          category === 'prospects' || category === 'suspects' ? { dealIds: ids } : 
                          { shipmentIds: ids };
          
          console.log(method, endpoint, postData);
          const response = await axios[method](endpoint, postData, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${zohoBearerToken}`,
            }
          });
          console.log('Success response:', response.data);
  
          // Update the summary message format for PUT requests
          const summaryData = response.data.summary;
          const summaryMessage = `${categories.find(c => c.id === selectedCategory)?.title} sync complete:\n
          Total: ${summaryData.total}
          Success: ${summaryData.successful}
          Failed: ${summaryData.failed}
          Queue: ${summaryData.failed_updates_queue}`;
          
          showNotification('success', summaryMessage);
  
          // Only if there are failed updates, download them and show the download notification
          if (response.data.failedUpdates && 
              response.data.failedUpdates.items && 
              response.data.failedUpdates.items.length > 0) {
            
            const totalFailed = downloadFailedAWBs(response.data.failedUpdates, response.data.results);
            
            // Show download notification after a small delay
            setTimeout(() => {
              showNotification('info', `Downloaded ${totalFailed} failed AWBs to text file`);
            }, 300);
          }
        }
  
        if (createIds.length > 0) {
          const postData = category === 'accounts' ? { customerIds: createIds } : 
                          category === 'prospects' || category === 'suspects' ? { dealIds: createIds } : 
                          { AWB: createIds };
          const createEndpoint = getZohoEndpoint(category, false);
          console.log('post', createEndpoint, postData);
          const response = await axios.post(createEndpoint, postData, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${zohoBearerToken}`,
            }
          });
          console.log('Success response:', response.data);
          console.log(category, method);
  
          // For create-shipments
          if (category === 'shipments' && method === 'post') {
            const summaryData = response.data.summary;
            const message = `${categories.find(c => c.id === selectedCategory)?.title} processing completed:\n
            Total Shipments: ${summaryData.total_shipments}
            Processed: ${summaryData.processed}
            Successful: ${summaryData.successful}
            Failed: ${summaryData.failed}
            Failed Updates: ${summaryData.failed_updates}`;
  
            // Check for failed AWBs first
            let notifications = [{ type: 'success', message }];
            
            if (response.data.failedUpdates || response.data.results) {
              const totalFailed = downloadFailedAWBs(response.data.failedUpdates, response.data.results);
              if (totalFailed > 0) {
                notifications.push({
                  type: 'info',
                  message: `Downloaded ${totalFailed} failed AWBs to text file`
                });
              }
            }

            // Set all notifications at once
            setNotifications(notifications);
          }
        }
      };
  
      // Process requests for shipments
      if (shipmentIds.length > 0) {
        await processRequest(shipmentIds, [], getZohoEndpoint('shipments', true), 'put', 'shipments');
      }
      if (createShipments.length > 0) {
        await processRequest([], createShipments, getZohoEndpoint('shipments', false), 'post', 'shipments');
      }
  
      // Process requests for other categories
      await processRequest(accountIds, createAccounts, getZohoEndpoint('accounts', true), 'put', 'accounts');
      await processRequest(dealIds, createDeals, getZohoEndpoint('prospects', true), 'put', 'prospects');
      await processRequest(dealIds, createDeals, getZohoEndpoint('suspects', true), 'put', 'suspects');
  
      setProgress(100);
      setInputData("");
    } catch (error) {
      console.error("Error processing request:", error);
      const errorMessage = error.response?.data?.message || 
        `Failed to synchronize ${categories.find(c => c.id === selectedCategory)?.title}. Please try again.`;
      showNotification('error', errorMessage);
    }
  
    setIsLoading(false);
  };

  const toggleBulkUpload = () => {
    setShowBulkUpload(!showBulkUpload);
  };

  const selectedCategoryInfo = categories.find(c => c.id === selectedCategory);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      <SideNav />
      
      {/* Updated Notification Toast */}
      {notifications.length > 0 && (
        <Toast 
          notifications={notifications}
          onClose={clearNotification}
        />
      )}
      
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
              Lex Zoho Sync
            </h1>
            <p className="text-gray-400">
              Synchronize data between Lexship and Zoho
            </p>
          </div>

          <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-800">
            {/* Category Selection View */}
            {showCategorySelection ? (
              <>
                <h2 className="text-xl font-semibold mb-6">Select Category to Sync</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      icon={category.icon}
                      title={category.title}
                      onClick={() => handleCategorySelect(category.id)}
                    />
                  ))}
                </div>
              </>
            ) : ( 
              /* Input Form View */
              <div className="animate-fadeIn">
                <button 
                  onClick={handleBackToCategories}
                  className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to categories
                </button>
                
                <div className="flex items-center mb-8">
                  <div className="p-3 rounded-full bg-purple-800/50 mr-4">
                    {selectedCategoryInfo?.icon}
                  </div>
                  <h2 className="text-2xl font-semibold text-purple-300">
                    {selectedCategoryInfo?.title} Synchronization
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Enter {selectedCategoryInfo?.title} Data
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder={`Enter ${selectedCategoryInfo?.title.toLowerCase()} data to synchronize...`}
                        disabled={isLoading}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Required - Data format should match Zoho requirements
                    </p>
                  </div>

                {/* Added bulk upload functionality which accepts csv file with limitless awb numbers */}
                {/* The csv header must be in this format [Awb_no] */}

                  <button
                    type="button"
                    onClick={toggleBulkUpload}
                    className="w-full mt-4 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all font-medium flex items-center justify-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {showBulkUpload ? "Cancel Upload" : "Bulk Upload"}
                  </button>

                  {showBulkUpload && (
                    <>
                      <div className="relative">
                        <div className="flex items-center my-6">
                          <div className="h-px flex-1 bg-gray-800"></div>
                          <span className="px-3 text-xs text-gray-500">OR</span>
                          <div className="h-px flex-1 bg-gray-800"></div>
                        </div>
                      </div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        Upload CSV File
                      </label>
                      <div className="relative group">
                        <div className="w-full h-32 border-2 border-dashed border-gray-700 group-hover:border-purple-500 rounded-lg transition-all duration-200 relative">
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-400 mb-2" />
                            <span className="text-sm font-medium text-gray-400 group-hover:text-purple-400">
                              Drop CSV file here or click to browse
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              Supports CSV files with AWB numbers/Customer Id's
                            </span>
                          </div>
                          <CSVReader
                            cssClass="cursor-pointer opacity-0 absolute inset-0 w-full h-full z-10"
                            label=""
                            onFileLoaded={(data) => handleCSVUpload(data, setInputData, showNotification, setShowBulkUpload)}
                            parserOptions={{ header: true }}
                            inputId="csv-upload"
                            inputStyle={{
                              width: '100%',
                              height: '100%',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              opacity: 0,
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  {isLoading ? (
                    <div className="space-y-4 py-2">
                      <Progress value={progress} />
                      <p className="text-center text-sm text-purple-300 animate-pulse">
                        Synchronizing {selectedCategoryInfo?.title}...
                      </p>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-medium"
                    >
                      Synchronize {selectedCategoryInfo?.title}
                    </button>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LexZohoSync;