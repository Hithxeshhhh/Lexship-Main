import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import lexhsipLogo from "../assets/lexship.png";
import { ToastContainer, toast } from "react-toastify";

import { 
  CheckCircleIcon, 
  BuildingOfficeIcon, 
  UserIcon, 
  MapPinIcon, 
  CreditCardIcon, 
  KeyIcon,
  XMarkIcon,
  InformationCircleIcon, // Add this import
  ChevronDownIcon // Add this import too since it's used in the business type select
} from '@heroicons/react/24/outline';

// ...existing code...

const Sample = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [animationOrigin, setAnimationOrigin] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [formData, setFormData] = useState({
    // Company Details
    companyName: '',
    businessType: 'select',
    
    // Contact Details
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    username: '',
    accountType: 'WAL',
    
    // Address
    addressLine1: '',
    addressLine2: '',
    pincode: '',
    city: '',
    state: '',
    companyPhone: '',
    
    // Billing
    sameAsAbove: false,
    billingFirstName: '',
    billingLastName: '',
    billingAddressLine1: '',
    billingAddressLine2: '',
    billingPincode: '',
    billingCity: '',
    billingState: '',
    billingPhone: '',
    
    // Credentials
    password: '',
    passwordConfirmation: '',
  });

  const [validationData, setValidationData] = useState({
    gst: '',
  });

  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    gst: '',
  });

  const steps = [
    { id: 1, name: 'Company Details', icon: BuildingOfficeIcon, key: 'company' },
    { id: 2, name: 'Contact Details', icon: UserIcon, key: 'contact' },
    { id: 3, name: 'Company Address', icon: MapPinIcon, key: 'address' },
    { id: 4, name: 'Billing', icon: CreditCardIcon, key: 'billing' },
    { id: 5, name: 'Credentials', icon: KeyIcon, key: 'credentials' },
  ];

  useEffect(() => {
    // Calculate progress
    const progressPercentage = (completedSteps.length / steps.length) * 100;
    setProgress(progressPercentage);
  }, [completedSteps, steps.length]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const openModal = (stepKey, e) => {
    // Get the click position relative to the viewport
    const clickX = e ? e.clientX : window.innerWidth / 4; // Default to sidebar area if no event
    const clickY = e ? e.clientY : window.innerHeight / 2;
    
    setAnimationOrigin({ x: clickX, y: clickY });
    setIsAnimating(true);
    setActiveModal(stepKey);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    
    // Reset the animation state after it completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Match this to your animation duration
  };

  const closeModal = () => {
    setActiveModal(null);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

// Update the completeStep function
const completeStep = (stepKey) => {
  if(formData.businessType === "select") {
    toast.warning("Please Select a Business type.", {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
      style: {
        backgroundColor: "white", // Gray background
        color: "black", // White text
      },
    });
  return;
  }
    if (stepKey === "company" && formData.businessType !== "individual") {
      // Check if GST is required and valid
      if (!validationData.gst || validationErrors.gst) {
        toast.warning("Please enter a valid GST number before proceeding.", {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            style: {
              backgroundColor: "white", // Gray background
              color: "black", // White text
            },
          });
        return;
      }
    }
  
    if (!completedSteps.includes(stepKey)) {
      const newCompletedSteps = [...completedSteps, stepKey];
      setCompletedSteps(newCompletedSteps);
  
      const isLastStep = newCompletedSteps.length === steps.length;
  
      setActiveModal(null);
      document.body.style.overflow = "auto";
  
      if (!isLastStep) {
        setTimeout(() => {
          const nextStep = steps[newCompletedSteps.length];
          if (nextStep) {
            setActiveModal(nextStep.key);
          }
        }, 600);
      }
    } else {
      setActiveModal(null);
      document.body.style.overflow = "auto";
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  
    // Show success notification
    toast.success("Account registration successful!", {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
      style: {
        backgroundColor: "white", // Gray background
        color: "black", // White text
      },
    });
  
    // Mark registration as complete
    setIsRegistrationComplete(true);
  
    // Add form submission logic here
  };

  // Modal Animation Helper
const getModalAnimation = () => {
  if (!activeModal) return "opacity-0 scale-95 pointer-events-none";
  
  return isAnimating 
    ? "opacity-100 scale-100 slide-in-from-left" 
    : "opacity-100 scale-100";
};

  // Function to check if a step is completed
  const isStepCompleted = (stepKey) => {
    return completedSteps.includes(stepKey);
  };

  // Update the validateGST function
  const validateGST = async (gst) => {
    try {
      setIsValidating(true);
      const options = {
        method: "GET",
        url: `https://gst-insights-api.p.rapidapi.com/getGSTDetailsUsingGST/${gst}`,
        headers: {
          "x-rapidapi-key": "c0dd407f62msh3343e0d693c7c6dp1251aajsn6a206f913632",
          "x-rapidapi-host": "gst-insights-api.p.rapidapi.com",
        },
      };
  
      const response = await axios.request(options);
  
      if (response.data.success) {
        // Auto-fill company details from GST data
        setFormData((prev) => ({
          ...prev,
          companyName: response.data.data.tradeName,
          addressLine1: response.data.data.principalAddress.address.buildingName || "",
          addressLine2: response.data.data.principalAddress.address.street || "",
          city: response.data.data.principalAddress.address.city || "",
          state: response.data.data.principalAddress.address.state || "",
          pincode: response.data.data.principalAddress.address.pincode || "",
        }));
  
        // Clear validation error if successful
        setValidationErrors((prev) => ({ ...prev, gst: null }));
        return true;
      }
  
      setValidationErrors((prev) => ({ ...prev, gst: "Invalid GST number" }));
      return false;
    } catch (error) {
      console.error("GST Validation Error:", error);
      setValidationErrors((prev) => ({
        ...prev,
        gst: "Error validating GST. Please try again.",
      }));
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Add success notification for GST validation
  const showGSTValidationSuccess = () => {
    toast.success("GST details validated and auto-filled successfully!", {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      style: {
        backgroundColor: "white", // Gray background (Tailwind's bg-gray-800)
        color: "black", // White text
      },// Custom gray background and white text
    });
  };

  useEffect(() => {
    // Check if the modal has already been shown in this session
    const hasShownModal = sessionStorage.getItem('hasShownCompanyModal');
  
    if (!hasShownModal) {
      // Show the modal and set the flag in sessionStorage
      const timer = setTimeout(() => {
        setActiveModal("company");
        document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
        sessionStorage.setItem('hasShownCompanyModal', 'true'); // Set the flag
      }, 2000);
  
      // Cleanup the timer when the component unmounts
      return () => clearTimeout(timer);
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900">
      <ToastContainer />
      {/* Dashboard Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img src={lexhsipLogo} className="w-32" alt="Lexship Logo"/>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Register</a>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300">
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
          {/* Dashboard Title */}
          <div className="px-6 py-4 bg-gradient-to-tr from-gray-800 to-gray-900 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white">Account Registration</h1>
            <p className="text-gray-400">Complete the form to create your business account</p>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-6 bg-gray-800">
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-700 ease-in-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <span className="font-medium text-white">{Math.round(progress)}% complete</span> - {completedSteps.length} of {steps.length} sections completed
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Step Navigation Sidebar */}
            <div className="w-full md:w-1/4 bg-gray-800 border-r border-gray-700 min-h-[70vh]">
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-6">Registration Steps</h3>
                
                <div className="space-y-1">
                  {steps.map((step, index) => {
                    const isCompleted = isStepCompleted(step.key);
                    const isCurrent = completedSteps.length === index && !isCompleted;
                    const isUpcoming = completedSteps.length < index && !isCompleted;
                    
                    return (
                      <div 
                        key={step.id}
                        onClick={() => !isUpcoming && !isRegistrationComplete && openModal(step.key)}
                        className={`
                          relative flex items-center p-4 rounded-lg cursor-pointer group
                          transition-all duration-300 ease-in-out
                          ${isRegistrationComplete ? "cursor-not-allowed opacity-50" : ""}
                          ${isCompleted ? "bg-green-900/20 text-green-400" : ""}
                          ${isCurrent ? "bg-indigo-900/20 text-indigo-400" : ""}
                          ${isUpcoming ? "text-gray-500 cursor-not-allowed" : "hover:bg-gray-700"}
                        `}
                      >
                        {/* Step indicator */}
                        <div className={`
                          flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mr-3
                          ${isCompleted ? "bg-green-900/30 text-green-400" : ""}
                          ${isCurrent ? "bg-indigo-900/30 text-indigo-400" : ""}
                          ${isUpcoming ? "bg-gray-700 text-gray-500" : ""}
                        `}>
                          {isCompleted ? (
                            <CheckCircleIcon className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        
                        {/* Step content */}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isUpcoming ? "text-gray-500" : "text-gray-300"}`}>
                            {step.name}
                          </p>
                          <p className="text-xs mt-0.5 text-gray-500">
                            {isCompleted 
                              ? "Completed" 
                              : isCurrent 
                                ? "Current Step" 
                                : step.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Help Section */}
              <div className="p-6 border-t border-gray-700">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Need assistance?</h4>
                  <p className="text-xs text-gray-400 mb-3">Our support team is here to help you complete your registration.</p>
                  <button className="w-full bg-gray-600 text-white border border-gray-600 rounded-md px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-700 transition-colors duration-300">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full md:w-3/4 p-6 bg-gray-800">
              <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6">Complete Your Registration</h3>
                
                {/* Current Step Summary */}
                <div className="mb-8">
                  {completedSteps.length < steps.length ? (
                    <>
                      <p className="text-gray-400 mb-2">Your next step:</p>
                      <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 flex items-start">
                        <div className="bg-gray-700 p-2 rounded-md mr-4">
                          {steps[completedSteps.length].icon && 
                            React.createElement(steps[completedSteps.length].icon, { 
                              className: "h-6 w-6 text-indigo-400" 
                            })
                          }
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{steps[completedSteps.length].name}</h4>
                          <p className="text-sm text-gray-400 mt-1 py-2">
                            {steps[completedSteps.length].key === 'company' && "Start by entering your company information and business type. You can also validate your GST number to auto-fill details."}
                            {steps[completedSteps.length].key === 'contact' && "Provide your contact information for account-related communications."}
                            {steps[completedSteps.length].key === 'address' && "Enter your business address for correspondence and delivery purposes."}
                            {steps[completedSteps.length].key === 'billing' && "Please provide your billing information for invoicing. If your billing address is the same as your business address, you can use the 'Same as business address' option."}
                            {steps[completedSteps.length].key === 'credentials' && "Create a secure password for your account. This will be used to log in to your Lexship dashboard."}
                          </p>
                          <button 
                            onClick={() => openModal(steps[completedSteps.length].key)}
                            className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-300"
                          >
                            Continue to {steps[completedSteps.length].name}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-center">
                      <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-2" />
                      <h4 className="text-lg font-medium text-green-400">Registration Complete!</h4>
                      <p className="text-sm text-green-300 mt-1">
                        Thank you for completing your registration. Your account has been created successfully.
                      </p>
                      <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-300">
                        Go to Dashboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Overlay */}
      <div 
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center
          transition-opacity duration-300 ease-in-out
          ${activeModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeModal}
      >
        {/* Modal Container */}
        <div 
          className={`
            bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-700
            transition-all duration-300 ease-in-out ${getModalAnimation()}
          `}
          onClick={e => e.stopPropagation()}
        >
          {activeModal === 'company' && (
            <div>
              <div className="flex justify-between items-center  text-white px-6 py-4 rounded-t-xl  border-gray-700">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-gray-300" />
                  <h2 className="text-lg font-semibold text-white">Company Details</h2>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-400 px-6 pt-4">Fill in your company information to get started.</p>
              <div className="p-6 space-y-6 ">
                <div className="bg-blue-800/50 border border-gray-700 p-4 rounded-md">
                  <div className="flex items-start space-x-3">
                    <InformationCircleIcon className="h-6 w-6 text-blue-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-200">Pro Tip</h3>
                      <p className="text-sm text-gray-400">Using your GST number we will automatically fill in most of your address details to speed up registration.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Business Type Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Business Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="block w-full appearance-none rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="select">Select Type</option>
                        <option value="private">Private Limited Company</option>
                        <option value="public">Public Limited Company</option>
                        <option value="partnership">Partnership</option>
                        <option value="sole">Sole Proprietorship</option>
                        <option value="individual">Individual Trading</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <ChevronDownIcon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* GST Validation section */}
                  <div className={`transition-all duration-500 ease-in-out transform ${
                    formData.businessType === "individual" || formData.businessType === "select"
                      ? "opacity-0 scale-95 h-0 overflow-hidden"
                      : "opacity-100 scale-100 h-auto"
                  }`}>
                    {formData.businessType !== "individual" && formData.businessType !== "select" && (
                      <div className="bg-gray-800/50 p-4 rounded-md border border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                          <label htmlFor="gst" className="block text-sm font-medium text-gray-300">
                            GST Validation <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <p className="text-sm text-yellow-400 mb-2">
                          Auto-fill your details by entering your GST number
                        </p>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            id="gst"
                            placeholder="Enter GST Number"
                            value={validationData?.gst || ""}
                            onChange={(e) => {
                              setValidationData((prev) => ({ ...prev, gst: e.target.value }));
                              setValidationErrors((prev) => ({ ...prev, gst: null }));
                            }}
                            className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            onClick={async () => {
                              const isValid = await validateGST(validationData?.gst);
                              if (isValid) {
                                showGSTValidationSuccess();
                              }
                            }}
                            disabled={isValidating}
                            className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            Validate
                          </button>
                        </div>
                        {validationErrors.gst && (
                          <p className="text-sm text-red-400 mt-1">{validationErrors.gst}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Company Name Input */}
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      placeholder="Your company name"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4  flex justify-end space-x-3  border-gray-700 rounded-b-xl">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => completeStep('company')}
                  className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          )}

          {/* Contact Details Modal */}
          {activeModal === 'contact' && (
            <div>
              <div className="flex justify-between items-center  text-white px-6 py-4 rounded-t-xl  border-gray-700">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-6 w-6 text-gray-300" />
                  <h2 className="text-lg font-semibold">Contact Details</h2>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="px-6 pt-4 max-h-[calc(100vh-200px)] overflow-hidden bg-gray-900">
                <div className="bg-blue-800/50 border border-gray-700 p-3 rounded-lg mb-4">
                  <div className="font-semibold flex items-center">
                    <InformationCircleIcon className="h-6 w-6 text-blue-400 mx-1" />
                    <span className="text-gray-200">Personal Details</span>
                  </div>
                  <div className="text-xs px-8 text-gray-400">Provide your contact information for account-related communications.</div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Your email address"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-300 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      placeholder="Your mobile number"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Account Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Account Type</option>
                      <option value="WAL">Wallet Account 1</option>
                      <option value="WAL">Wallet Account 2</option>
                      <option value="WAL">Wallet Account 3</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4  flex justify-end space-x-3 border-gray-700 rounded-b-xl">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => completeStep('contact')}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          )}

          {/* Address Modal */}
          {activeModal === 'address' && (
            <div>
              <div className="flex justify-between items-center bg-gradient-to-tr text-black px-6 py-4 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-6 w-6 text-white" />
                  <h2 className="text-lg font-semibold text-white">Company Address</h2>
                </div>
                <button onClick={closeModal} className="text-white hover:text-indigo-200">
                <XMarkIcon className="h-6 w-6 text-black" />
                </button>
              </div>
              
              <div className="px-6 pt-4 ">
                <div className="bg-blue-800 p-3 rounded-lg mb-4">
                  <div className="font-semibold flex"><span><InformationCircleIcon className="h-6 w-6 text-blue-500 mx-1" /></span>Address Details</div>
                  <div className="text-xs px-8 text-gray-400">Provide your company's address information.</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-white mb-1">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      placeholder="Enter address line 1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-white mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      id="addressLine2"
                      name="addressLine2"
                      placeholder="Enter address line 2 (optional)"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pincode" className="block text-sm font-medium text-gray-200 mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        placeholder="Enter pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-200 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        placeholder="City (Auto on Pincode)"
                        value={formData.city}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-white mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="block w-full appearance-none rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          required
                        >
                          <option value="">Select State</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Telangana">Telangana</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="companyPhone" className="block text-sm font-medium text-white mb-1">
                        Company Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="companyPhone"
                        name="companyPhone"
                        placeholder="Enter company phone number"
                        value={formData.companyPhone}
                        onChange={handleChange}
                        className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4  flex justify-end space-x-3  border-gray-700 rounded-b-xl">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => completeStep('address')}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          )}

          {activeModal === 'billing' && (
            <div>
              <div className="flex justify-between items-center  text-white px-6 py-4 rounded-t-xl  border-gray-700">
                <div className="flex items-center space-x-3">
                  <CreditCardIcon className="h-6 w-6 text-gray-300" />
                  <h2 className="text-lg font-semibold">Billing Details</h2>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="px-6 pt-4 bg-gray-900">
                <div className="bg-orange-600/50 border border-gray-700 p-3 rounded-lg mb-4">
                  <div className="font-semibold flex items-center">
                    <InformationCircleIcon className="h-6 w-6 text-blue-400 mr-2" />
                    <span className="text-gray-200">Billing Details</span>
                  </div>
                  <div className="text-xs px-8 text-gray-400">Provide your billing information for invoicing.</div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      id="sameAsAbove"
                      name="sameAsAbove"
                      type="checkbox"
                      checked={formData.sameAsAbove}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-700"
                    />
                    <label htmlFor="sameAsAbove" className="ml-2 block text-sm text-gray-300">
                      Same as company address
                    </label>
                  </div>
                </div>

                <div className={`space-y-4 ${formData.sameAsAbove ? 'opacity-50' : ''}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="billingFirstName" className="block text-sm font-medium text-gray-300 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="billingFirstName"
                        name="billingFirstName"
                        placeholder="Enter first name"
                        value={formData.sameAsAbove ? formData.firstName : formData.billingFirstName}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-600 px-4 py-2.5 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-200"
                        disabled={formData.sameAsAbove}
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor="billingLastName" className="block text-sm font-medium text-gray-300 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="billingLastName"
                        name="billingLastName"
                        placeholder="Enter last name"
                        value={formData.sameAsAbove ? formData.lastName : formData.billingLastName}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-600 px-4 py-2.5 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-200"
                        disabled={formData.sameAsAbove}
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="billingAddressLine1" className="block text-sm font-medium text-gray-300 mb-1">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="billingAddressLine1"
                      name="billingAddressLine1"
                      placeholder="Street address, P.O. box"
                      value={formData.sameAsAbove ? formData.addressLine1 : formData.billingAddressLine1}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-600 px-4 py-2.5 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-200"
                      disabled={formData.sameAsAbove}
                      required
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <label htmlFor="billingAddressLine2" className="block text-sm font-medium text-gray-300 mb-1">
                      Address Line 2 <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="billingAddressLine2"
                      name="billingAddressLine2"
                      placeholder="Apartment, suite, unit, building"
                      value={formData.sameAsAbove ? formData.addressLine2 : formData.billingAddressLine2}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-600 px-4 py-2.5 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-200"
                      disabled={formData.sameAsAbove}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="billingPincode" className="block text-sm font-medium text-gray-300 mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="billingPincode"
                        name="billingPincode"
                        placeholder="Enter 6-digit pincode"
                        value={formData.sameAsAbove ? formData.pincode : formData.billingPincode}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-600 px-4 py-2.5 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-200"
                        disabled={formData.sameAsAbove}
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor="billingCity" className="block text-sm font-medium text-gray-300 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="billingCity"
                        name="billingCity"
                        placeholder="City (Auto on Pincode)"
                        value={formData.sameAsAbove ? formData.city : formData.billingCity}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-600 px-4 py-2.5 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-200"
                        disabled={formData.sameAsAbove}
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="billingState" className="block text-sm font-medium text-gray-300 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="billingState"
                          name="billingState"
                          value={formData.sameAsAbove ? formData.state : formData.billingState}
                          onChange={handleChange}
                          className="block w-full appearance-none rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          disabled={formData.sameAsAbove}
                          required
                          aria-required="true"
                        >
                          <option value="">Select State</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="billingPhone" className="block text-sm font-medium text-gray-300 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="billingPhone"
                        name="billingPhone"
                        placeholder="+91 (XXX) XXX-XXXX"
                        value={formData.sameAsAbove ? formData.companyPhone : formData.billingPhone}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-600 px-4 py-2.5 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-200"
                        disabled={formData.sameAsAbove}
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4  flex justify-end space-x-3  border-gray-700 rounded-b-xl">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => completeStep('billing')}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          )}

          {activeModal === 'credentials' && (
            <div>
              <div className="flex justify-between items-center  text-white px-6 py-4 rounded-t-xl border-gray-700">
                <div className="flex items-center space-x-3">
                  <KeyIcon className="h-6 w-6 text-gray-300" />
                  <h2 className="text-lg font-semibold">Credentials</h2>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="px-6 pt-4 bg-gray-900">
                <div className="bg-blue-800/50 border border-gray-700 p-3 rounded-lg mb-4">
                  <div className="font-semibold flex items-center">
                    <InformationCircleIcon className="h-6 w-6 text-blue-400 mr-2" />
                    <span className="text-gray-200">Set Your Password</span>
                  </div>
                  <div className="text-xs px-8 text-gray-400">Create a secure password for your account.</div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-400 flex items-center space-x-2">
                      <InformationCircleIcon className="h-4 w-4 text-blue-400" />
                      <span>Minimum 8 characters, include uppercase, lowercase, number, and special character</span>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-300 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="passwordConfirmation"
                      name="passwordConfirmation"
                      placeholder="Re-enter your password"
                      value={formData.passwordConfirmation}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 flex justify-end space-x-3  border-gray-700 rounded-b-xl">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => completeStep('credentials')}
                  disabled={isRegistrationComplete}
                  className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                    isRegistrationComplete ? "bg-gray-600 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                  } focus:outline-none`}
                >
                  Save & Complete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sample;