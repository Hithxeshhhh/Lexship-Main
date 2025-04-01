import React, { useEffect, useState } from "react";
import lexhsipLogo from "../assets/lexship.png";

import { 
  CheckCircleIcon, 
  BuildingOfficeIcon, 
  UserIcon, 
  MapPinIcon, 
  CreditCardIcon, 
  KeyIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Tracking = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [animationOrigin, setAnimationOrigin] = useState({ x: 0, y: 0 });
const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    // Company Details
    companyName: '',
    businessType: 'private',
    
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

  const steps = [
    { id: 1, name: 'Company Details', icon: BuildingOfficeIcon, key: 'company' },
    { id: 2, name: 'Contact Details', icon: UserIcon, key: 'contact' },
    { id: 3, name: 'Address', icon: MapPinIcon, key: 'address' },
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
  // Add the current step to completedSteps if not already included
  if (!completedSteps.includes(stepKey)) {
    const newCompletedSteps = [...completedSteps, stepKey];
    setCompletedSteps(newCompletedSteps);
    
    // Check if this was the last step
    const isLastStep = newCompletedSteps.length === steps.length;
    
    // Close the current modal and restore scrolling immediately for the last step
    setActiveModal(null);
    document.body.style.overflow = 'auto'; // Always ensure scrolling is restored
    
    // If this wasn't the last step, open the next modal after a delay
    if (!isLastStep) {
      setTimeout(() => {
        // Find the next step that hasn't been completed
        const nextStep = steps[newCompletedSteps.length];
        if (nextStep) {
          setActiveModal(nextStep.key);
        }
      }, 600);
    }
  } else {
    // Just close the modal if this step was already completed
    setActiveModal(null);
    document.body.style.overflow = 'auto';
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add form submission logic here
    alert("Account registration successful!");
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

  return (
    <div className="min-h-screen bg-[#F2F8FF]">
      {/* Dashboard Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-indigo-600 text-xl font-bold"><img src={lexhsipLogo} className="w-32" alt="Lexship Logo"/></span>
              </div>
            </div>
            <div className="flex items-center">
              <a href="#" className="text-gray-700 hover:text-gray-900">Register</a>
              <button className="bg-black text-white mx-2 px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300">Login</button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Dashboard Title */}
          {/* Dashboard Title - with gradient background */}
<div className="px-6 py-4 bg-gradient-to-tr from-indigo-800 to-blue-500 text-white">
  <h1 className="text-2xl font-bold">Account Registration</h1>
  <p className="text-indigo-100">Complete the form to create your business account</p>
</div>

          {/* Progress Bar */}
          <div className="px-6 py-3 bg-gray-50">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-700 ease-in-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">{Math.round(progress)}% complete</span> - {completedSteps.length} of {steps.length} sections completed
            </div>
          </div>

          // Replace the existing content with this new layout structure

<div className="flex flex-col md:flex-row">
  {/* Step Navigation Sidebar */}
  <div className="w-full md:w-1/4 bg-gray-50 border-r border-gray-200 min-h-[70vh]">
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Registration Steps</h3>
      
      <div className="space-y-1">
        {steps.map((step, index) => {
          const isCompleted = isStepCompleted(step.key);
          const isCurrent = completedSteps.length === index && !isCompleted;
          const isUpcoming = completedSteps.length < index && !isCompleted;
          
          return (
            <div 
              key={step.id}
              onClick={() => !isUpcoming && openModal(step.key)}
              className={`
                relative flex items-center p-4 rounded-lg cursor-pointer group
                transition-all duration-300 ease-in-out
                ${isCompleted ? 'bg-green-50 text-green-800' : ''}
                ${isCurrent ? 'bg-indigo-50 text-indigo-800' : ''}
                ${isUpcoming ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}
              `}
            >
              {/* Step connector line */}
              {index !== 0 && (
                <div className="absolute top-0 left-6 h-4 w-0.5 -mt-4 bg-gray-200"></div>
              )}
              
              {/* Step indicator */}
              <div className={`
                flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mr-3 
                ${isCompleted ? 'bg-green-100 text-green-600' : ''}
                ${isCurrent ? 'bg-indigo-100 text-indigo-600' : ''}
                ${isUpcoming ? 'bg-gray-100 text-gray-400' : ''}
              `}>
                {isCompleted ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              {/* Step content */}
              <div className="flex-1">
                <p className={`text-sm font-medium ${isUpcoming ? 'text-gray-400' : ''}`}>
                  {step.name}
                </p>
                <p className="text-xs mt-0.5">
                  {isCompleted 
                    ? 'Completed' 
                    : isCurrent 
                      ? 'Current Step' 
                      : step.name}
                </p>
              </div>
              
              {/* Arrow indicator for completed or current */}
              {!isUpcoming && (
                <div className={`
                  ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  ${isCompleted ? 'text-green-500' : 'text-indigo-500'}
                `}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
    
    {/* Additional Help Section */}
    <div className="p-6 border-t border-gray-200">
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-indigo-800 mb-2">Need assistance?</h4>
        <p className="text-xs text-indigo-600 mb-3">Our support team is here to help you complete your registration.</p>
        <button className="w-full bg-white text-indigo-600 border border-indigo-300 rounded-md px-3 py-2 text-sm font-medium shadow-sm hover:bg-indigo-50 transition-colors duration-300">
          Contact Support
        </button>
      </div>
    </div>
  </div>

  {/* Main Content Area */}
  <div className="w-full md:w-3/4 p-6">
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Complete Your Registration</h3>
      
      {/* Current Step Summary */}
      <div className="mb-8">
        {completedSteps.length < steps.length ? (
          <>
            <p className="text-gray-600 mb-2">Your next step:</p>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start">
              <div className="bg-indigo-100 p-2 rounded-md mr-4">
                {steps[completedSteps.length].icon && React.createElement(steps[completedSteps.length].icon, { className: "h-6 w-6 text-indigo-600" })}
              </div>
              <div>
                <h4 className="font-medium text-indigo-900">{steps[completedSteps.length].name}</h4>
                <p className="text-sm text-indigo-700 mt-1">
                  Complete this information to continue with your registration.
                </p>
                <button 
                  onClick={() => openModal(steps[completedSteps.length].key)}
                  className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-300"
                >
                  Continue
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <h4 className="text-lg font-medium text-green-800">Registration Complete!</h4>
            <p className="text-sm text-green-600 mt-1">
              Thank you for completing your registration. Your account has been created successfully.
            </p>
            <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-300">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
      
      {/* Completed Steps Summary */}
      {completedSteps.length > 0 && completedSteps.length < steps.length && (
        <div>
          <h4 className="text-gray-700 font-medium mb-3">Completed Steps</h4>
          <div className="bg-gray-50 rounded-lg border border-gray-100 divide-y divide-gray-200">
            {completedSteps.map((stepKey, index) => {
              const step = steps.find(s => s.key === stepKey);
              return (
                <div key={step.id} className="flex items-center p-3 hover:bg-gray-100 cursor-pointer" onClick={() => openModal(step.key)}>
                  <div className="bg-green-100 p-1.5 rounded-md mr-3">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">{step.name}</span>
                  <span className="ml-auto text-xs text-gray-500">Edit</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
            bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto
            transition-all duration-300 ease-in-out ${getModalAnimation()}
          `}
          onClick={e => e.stopPropagation()}
        >
          {/* Company Details Modal */}
          {activeModal === 'company' && (
            <div>
              <div className="flex justify-between items-center bg-gradient-to-tr from-indigo-800 to-blue-500 text-white px-6 py-4 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="h-6 w-6" />
                  <h2 className="text-lg font-semibold">Company Details</h2>
                </div>
                <button onClick={closeModal} className="text-white hover:text-indigo-200">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Type Of Business <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'public', label: 'Public Limited Company' },
                      { id: 'private', label: 'Private Limited Company' },
                      { id: 'partnership', label: 'Partnership' },
                      { id: 'sole', label: 'Sole Proprietorship' },
                      { id: 'individual', label: 'Individual Trading' },
                    ].map((type) => (
                      <div key={type.id} className="flex items-center">
                        <input
                          id={`business-type-${type.id}`}
                          name="businessType"
                          type="radio"
                          value={type.id}
                          checked={formData.businessType === type.id}
                          onChange={handleChange}
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={`business-type-${type.id}`} className="ml-3 block text-sm text-gray-700">
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
  onClick={() => completeStep('company')} // Pass the current step key
  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
>
  Save & Continue
</button>
              </div>
            </div>
          )}

          {/* Contact Details Modal */}
          {activeModal === 'contact' && (
            <div>
              <div className="flex justify-between items-center bg-gradient-to-tr from-indigo-800 to-blue-500 text-white px-6 py-4 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-6 w-6" />
                  <h2 className="text-lg font-semibold">Contact Details</h2>
                </div>
                <button onClick={closeModal} className="text-white hover:text-indigo-200">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Type
                    </label>
                    <div className="flex items-center h-10">
                      <input
                        id="accountType"
                        name="accountType"
                        type="checkbox"
                        checked={formData.accountType === 'WAL'}
                        onChange={() => setFormData({...formData, accountType: formData.accountType === 'WAL' ? '' : 'WAL'})}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="accountType" className="ml-2 block text-sm text-gray-700">
                        WAL
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => completeStep('contact')}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          )}

          {/* Address Modal */}
          {activeModal === 'address' && (
            <div>
              <div className="flex justify-between items-center bg-gradient-to-tr from-indigo-800 to-blue-500 text-white px-6 py-4 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-6 w-6" />
                  <h2 className="text-lg font-semibold">Company Address</h2>
                </div>
                <button onClick={closeModal} className="text-white hover:text-indigo-200">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      id="addressLine2"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City (Auto on Pincode)"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select a State</option>
                      <option value="state1">State 1</option>
                      <option value="state2">State 2</option>
                      <option value="state3">State 3</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="companyPhone"
                      name="companyPhone"
                      value={formData.companyPhone}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => completeStep('address')}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          )}

          {/* Billing Modal */}
          {activeModal === 'billing' && (
            <div>
              <div className="flex justify-between items-center bg-gradient-to-tr from-indigo-800 to-blue-500 text-white px-6 py-4 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <CreditCardIcon className="h-6 w-6" />
                  <h2 className="text-lg font-semibold">Billing Details</h2>
                </div>
                <button onClick={closeModal} className="text-white hover:text-indigo-200">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      id="sameAsAbove"
                      name="sameAsAbove"
                      type="checkbox"
                      checked={formData.sameAsAbove}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="sameAsAbove" className="ml-2 block text-sm text-gray-700">
                      Same as company address
                    </label>
                  </div>
                </div>

                <div className={formData.sameAsAbove ? 'opacity-50' : ''}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="billingFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="billingFirstName"
                        name="billingFirstName"
                        value={formData.sameAsAbove ? formData.firstName : formData.billingFirstName}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        disabled={formData.sameAsAbove}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="billingLastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="billingLastName"
                        name="billingLastName"
                        value={formData.sameAsAbove ? formData.lastName : formData.billingLastName}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        disabled={formData.sameAsAbove}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="billingAddressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="billingAddressLine1"
                        name="billingAddressLine1"
                        value={formData.sameAsAbove ? formData.addressLine1 : formData.billingAddressLine1}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        disabled={formData.sameAsAbove}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="billingAddressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        id="billingAddressLine2"
                        name="billingAddressLine2"
                        value={formData.sameAsAbove ? formData.addressLine2 : formData.billingAddressLine2}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        disabled={formData.sameAsAbove}
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="billingPincode" className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="billingPincode"
                        name="billingPincode"
                        value={formData.sameAsAbove ? formData.pincode : formData.billingPincode}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        disabled={formData.sameAsAbove}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                       type="text"
                       id="billingCity"
                       name="billingCity"
                       value={formData.sameAsAbove ? formData.city : formData.billingCity}
                       onChange={handleChange}
                       placeholder="City (Auto on Pincode)"
                       className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                       disabled={formData.sameAsAbove}
                       required
                     />
                   </div>
                 </div>

                 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-1">
                       State <span className="text-red-500">*</span>
                     </label>
                     <select
                       id="billingState"
                       name="billingState"
                       value={formData.sameAsAbove ? formData.state : formData.billingState}
                       onChange={handleChange}
                       className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                       disabled={formData.sameAsAbove}
                       required
                     >
                       <option value="">Select a State</option>
                       <option value="state1">State 1</option>
                       <option value="state2">State 2</option>
                       <option value="state3">State 3</option>
                     </select>
                   </div>
                   <div>
                     <label htmlFor="billingPhone" className="block text-sm font-medium text-gray-700 mb-1">
                       Phone <span className="text-red-500">*</span>
                     </label>
                     <input
                       type="tel"
                       id="billingPhone"
                       name="billingPhone"
                       value={formData.sameAsAbove ? formData.companyPhone : formData.billingPhone}
                       onChange={handleChange}
                       className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                       disabled={formData.sameAsAbove}
                       required
                     />
                   </div>
                 </div>
               </div>
             </div>
             
             <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
               <button
                 onClick={closeModal}
                 className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
               >
                 Cancel
               </button>
               <button
                 onClick={() => completeStep('billing')}
                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
               >
                 Save & Continue
               </button>
             </div>
           </div>
         )}

         {/* Credentials Modal */}
         {activeModal === 'credentials' && (
           <div>
             <div className="flex justify-between items-center bg-gradient-to-tr from-indigo-800 to-blue-500 text-white px-6 py-4 rounded-t-xl">
               <div className="flex items-center space-x-3">
                 <KeyIcon className="h-6 w-6" />
                 <h2 className="text-lg font-semibold">Credentials</h2>
               </div>
               <button onClick={closeModal} className="text-white hover:text-indigo-200">
                 <XMarkIcon className="h-6 w-6" />
               </button>
             </div>
             
             <div className="p-6 space-y-6">
               <div>
                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                   Password <span className="text-red-500">*</span>
                 </label>
                 <input
                   type="password"
                   id="password"
                   name="password"
                   value={formData.password}
                   onChange={handleChange}
                   className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                   required
                 />
                 <p className="mt-1 text-xs text-gray-500">
                   Minimum 8 characters, must include uppercase, lowercase, number, and special character
                 </p>
               </div>

               <div>
                 <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700 mb-1">
                   Confirm Password <span className="text-red-500">*</span>
                 </label>
                 <input
                   type="password"
                   id="passwordConfirmation"
                   name="passwordConfirmation"
                   value={formData.passwordConfirmation}
                   onChange={handleChange}
                   className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                   required
                 />
               </div>
             </div>
             
             <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
               <button
                 onClick={closeModal}
                 className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
               >
                 Cancel
               </button>
               <button
                 onClick={() => completeStep('credentials')}
                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
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

export default Tracking;