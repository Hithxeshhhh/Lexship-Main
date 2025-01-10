import "react-toastify/dist/ReactToastify.css";
import React, { useState } from "react";
import SideNav from "../components/SideNav";
import sampleData from "../utils/sampleData.json";
import searchIcon from "../assets/searchIcon.svg";
import { Spinner } from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

const DashboardPage = () => {
  const [searchInput, setSearchInput] = useState(""); // Stores user input for search
  const [filteredData, setFilteredData] = useState([]); // Stores filtered rows based on search
  const [editingRow, setEditingRow] = useState(null); // Tracks the row being edited
  const [updatedData, setUpdatedData] = useState({}); // Stores temporary updates for editing
  const [loading, setLoading] = useState(false);

  // Handle search
  const handleSearch = () => {
    if (!searchInput.trim()) {
      toast.info("Please enter valid AWB numbers to search."); // Optional user feedback
      return; // Exit without modifying `filteredData`
    }
  
    setLoading(true);
  
    // Get AWB numbers from user input and filter rows
    const awbNumbers = searchInput.split(",").map((num) => num.trim());
    const filtered = sampleData.filter((row) =>
      awbNumbers.includes(row.full_awb_number)
    );
  
    // Ensure new rows are added without duplication
    const newFilteredData = [...filteredData];
    filtered.forEach((newRow) => {
      const exists = newFilteredData.some(
        (row) => row.full_awb_number === newRow.full_awb_number
      );
      if (!exists) {
        newFilteredData.push(newRow);
      }
    });
  
    setFilteredData(newFilteredData); // Update the state with merged data
    setSearchInput(""); // Clear the search input
    setLoading(false);
  };
  

  // Handle enabling editing mode
  const handleEdit = (index) => {
    setEditingRow(index);
    setUpdatedData(filteredData[index]); // Store the current data of the row being edited
  };

  // Handle saving updated row
  const handleUpdate = (index) => {
    if (editingRow === null) return;

    // Ensure that only the updated row is modified
    const updatedRows = [...filteredData];
    updatedRows[index] = { ...updatedRows[index], ...updatedData }; // Only update the specific row
    setFilteredData(updatedRows);
    setEditingRow(null); // Exit editing mode
    toast.success("Row updated successfully!");
  };

  // Handle input changes in the editable row
  const handleInputChange = (field, value) => {
    setUpdatedData({ ...updatedData, [field]: value });
  };

  return (
    <>
      <SideNav />
      <div className="max-w-4xl p-6 space-y-6 mx-auto mr-36">
        <div className="space-y-4 my-4">
          <h1 className="text-xl font-bold">Xindus details</h1>
          <div className="flex space-x-4">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
              placeholder="Enter AWB Numbers (comma separated)"
            />
            <button
              onClick={handleSearch}
              className="p-3 bg-[#CECECE] rounded-lg hover:bg-blue-600 font-semibold text-white flex items-center"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" color="white" /> : null}
              <img
                src={searchIcon}
                alt="Search"
                className="w-5 h-5 mr-2"
              />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Display the table only if filtered data exists */}
      {filteredData.length > 0 && (
        <>
          {/* Table Header */}
          <div className="p-4 ml-64 max-w-7xl">
            <div className="grid grid-cols-7 gap-4 bg-indigo-600 text-white font-bold p-4 rounded-t-lg">
              <div className="text-center">AWB Number</div>
              <div className="text-center">Ad Code</div>
              <div className="text-center">HSN Code</div>
              <div className="text-center">PAN Number</div>
              <div className="text-center">Bank Account</div>
              <div className="text-center">Edit</div>
              <div className="text-center">Operation</div>
            </div>
          </div>

          {/* Rows */}
          <div className="p-4 ml-64 max-w-7xl space-y-4">
            {filteredData.map((row, index) => (
              <div
                key={index}
                className="bg-gray-700 shadow-lg rounded-lg border border-gray-900 p-4 hover:bg-gray-900"
              >
                <div className="grid grid-cols-7 gap-4 items-center">
                  {/* AWB Number */}
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

                  {/* Ad Code */}
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
                  {/* HSN code */}
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

                  {/* PAN Number */}
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

                  {/* Bank Account */}
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

                  {/* Edit Button */}
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                  </div>

                  {/* Update Button */}
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleUpdate(index)}
                      className={`bg-blue-500 text-white py-1 px-3 rounded ${
                        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                      }`}
                      disabled={loading}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Toast Container for notifications */}
      <ToastContainer />
    </>
  );
};

export default DashboardPage;
