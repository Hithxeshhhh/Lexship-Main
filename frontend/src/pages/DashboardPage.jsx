import "react-toastify/dist/ReactToastify.css";
import React, { useState } from "react";
import SideNav from "../components/SideNav";
import searchIcon from "../assets/searchIcon.svg";
import { Spinner } from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

const DashboardPage = () => {
  const [searchInput, setSearchInput] = useState(""); // User input for AWB numbers
  const [filteredData, setFilteredData] = useState([]); // Data returned from API
  const [editingRow, setEditingRow] = useState(null); // Index of the row being edited
  const [updatedData, setUpdatedData] = useState({}); // Data for editing
  const [isSearching, setIsSearching] = useState(false); // Loading state for search button
  const [loadingRows, setLoadingRows] = useState([]); // Tracks rows that are loading

  // Fetch AWB details from API
  const fetchData = async (awbNumbers) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_XINDUS_GET_DETAILS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`, // Replace with actual token
        },
        body: JSON.stringify({ AWBs: awbNumbers }), // Send AWB numbers in POST body
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error("Failed to fetch data.");
      console.error("Error fetching data:", error);
      return [];
    }
  };

  // Handle search functionality
  const handleSearch = async () => {
    setIsSearching(true); // Set loading state for search button

    try {
      if (!searchInput) {
        setFilteredData([]);
        return;
      }

      // Parse AWB numbers, removing empty or invalid values
      const awbNumbers = searchInput
        .split(",")
        .map((num) => num.trim())
        .filter((num) => num);

      if (awbNumbers.length === 0) {
        toast.error("Please enter valid AWB numbers.");
        return; // If no valid AWBs, don't proceed
      }

      // Fetch new AWB details and append to the existing data
      const newData = await fetchData(awbNumbers);

      // Append new data to existing filtered data
      setFilteredData((prevData) => [...prevData, ...newData]);

      // Clear input field after search
      setSearchInput("");
    } catch (error) {
      toast.error("Failed to search.");
    } finally {
      setIsSearching(false); // Hide loading spinner
    }
  };

  // Handle Enter key press for search
  const handleEnter = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  // Handle editing a row
  const handleEdit = (index) => {
    setEditingRow(index); // Set the row to editing mode
    setUpdatedData(filteredData[index]); // Pre-fill edit data with the current row
  };

  // Handle updating the data
  const handleUpdate = async (index) => {
    if (editingRow === null) return;

    setLoadingRows([...loadingRows, index]); // Set loading state for the row

    try {
      const response = await fetch(`${import.meta.env.VITE_XINDUS_UPDATE}`, {
        method: "POST", // Change to POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`, // Replace with actual token
        },
        body: JSON.stringify(updatedData), // Send updated data in POST body
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedRow = await response.json();

      // Ensure that only the updated row is modified
      const updatedRowsData = [...filteredData];
      updatedRowsData[index] = updatedRow; // Update the specific row with the new data
      setFilteredData(updatedRowsData);
      setEditingRow(null); // Exit editing mode
      toast.success("Row updated successfully!");
    } catch (error) {
      toast.error("Failed to update row.");
      console.error("Error updating row:", error);
    } finally {
      setLoadingRows(loadingRows.filter((i) => i !== index)); // Remove loading state for the row
    }
  };

  // Handle input changes in the editable row
  const handleInputChange = (field, value) => {
    setUpdatedData({ ...updatedData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <SideNav />
      <div className="max-w-4xl p-6 space-y-6 mx-auto mr-36">  
        <div className="space-y-4 my-4">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">KYC details</h1>
          <div className="flex space-x-4">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleEnter}
              className="flex-1 p-2 border rounded-lg"
              placeholder="Enter AWB Numbers (comma separated)"
            />
            <button
              onClick={handleSearch}
              className="p-3 bg-[#CECECE] rounded-lg hover:bg-blue-600 font-semibold text-white flex items-center"
              disabled={isSearching}
            >
              <img
                src={searchIcon}
                alt="Search"
                className="w-5 h-5 mr-2"
              />
              {isSearching ? <Spinner size="sm" color="white" /> : "Search"}
            </button>
          </div>
        </div>
      </div>

      {filteredData.length > 0 && (
        <>
          <div className="p-4 ml-64 max-w-7xl">
            <div className="grid grid-cols-8 gap-1 bg-[#4F46E5] text-white font-bold p-4 rounded-t-lg">
              <div className="text-center">AWB Number</div>
              <div className="text-center">Ad Code</div>
              <div className="text-center">HSN Code</div>
              <div className="text-center">PAN Number</div>
              <div className="text-center">Bank Account</div>
              <div className="text-center">Product Type</div>
              <div className="text-center">Edit</div>
              <div className="text-center">Update</div>
            </div>
          </div>

          <div className="p-4 ml-64 max-w-7xl space-y-4">
            {filteredData.map((row, index) => (
              <div
                key={index}
                 className="bg-gray-700 shadow-lg rounded-lg border border-gray-900 p-4 hover:bg-gray-900"
              >
                <div className="grid grid-cols-8 gap-1 items-center">
                  <div className="text-center font-semibold">
                    {editingRow === index ? (
                      <input
                        type="text"
                        value={updatedData.full_awb_number}
                        onChange={(e) =>
                          handleInputChange("full_awb_number", e.target.value)
                        }
                        className="p-1 border rounded"
                      />
                    ) : (
                      row.full_awb_number
                    )}
                  </div>
                  <div className="text-center">
                    {editingRow === index ? (
                      <input
                        type="text"
                        value={updatedData.adcode}
                        onChange={(e) =>
                          handleInputChange("adcode", e.target.value)
                        }
                        className="p-1 border rounded"
                      />
                    ) : (
                      row.adcode
                    )}
                  </div>
                  <div className="text-center">
                    {editingRow === index ? (
                      <input
                        type="text"
                        value={updatedData.hsn_code}
                        onChange={(e) =>
                          handleInputChange("hsn_code", e.target.value)
                        }
                        className="p-1 border rounded"
                      />
                    ) : (
                      row.hsn_code
                    )}
                  </div>
                  <div className="text-center">
                    {editingRow === index ? (
                      <input
                        type="text"
                        value={updatedData.pan_number}
                        onChange={(e) =>
                          handleInputChange("pan_number", e.target.value)
                        }
                        className="p-1 border rounded"
                      />
                    ) : (
                      row.pan_number
                    )}
                  </div>
                  <div className="text-center">
                    {editingRow === index ? (
                      <input
                        type="text"
                        value={updatedData.bank_account}
                        onChange={(e) =>
                          handleInputChange("bank_account", e.target.value)
                        }
                        className="p-1 border rounded"
                      />
                    ) : (
                      row.bank_account
                    )}
                  </div>
                  <div className="text-center">
                    {editingRow === index ? (
                      <select
                        value={updatedData.product_type}
                        onChange={(e) =>
                          handleInputChange("product_type", e.target.value)
                        }
                        className="p-1 border rounded"
                      >
                        <option value="Sale of Goods">Sale of Goods</option>
                        <option value="Gift">Gift</option>
                      </select>
                    ) : (
                      row.product_type
                    )}
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleUpdate(index)}
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                      disabled={loadingRows.includes(index)}
                    >
                      Update
                      {loadingRows.includes(index) ? <Spinner size="sm" color="white" /> : null}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <ToastContainer />
      </div>
  );
};

export default DashboardPage;