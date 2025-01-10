// import "react-toastify/dist/ReactToastify.css";
// import React, { useEffect, useState } from "react";
// import sampleData from "../../../utils/sampleData.json";
// import searchIcon from "../../assets/searchIcon.svg";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { ToastContainer, toast } from "react-toastify";

// const Update = () => {
//   const [data, setData] = useState([]); // Data fetched from API or JSON
//   const [searchInput, setSearchInput] = useState("");
//   const [filteredData, setFilteredData] = useState([]);
//   const [editingRow, setEditingRow] = useState(null);
//   const [updatedData, setUpdatedData] = useState({});

//   // Fetch data from API or use sampleData as fallback
//   const fetchData = async () => {
//     try {
//       const response = await fetch("https://your-api-endpoint.com/data", {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: "Bearer your-api-token", // Replace with actual token
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`API Error: ${response.statusText}`);
//       }

//       const data = await response.json();
//       setData(data); // Set data from API
//     } catch (error) {
//       console.error("Error fetching data from API:", error.message);
//       setData(sampleData); // Fallback to JSON file
//     }
//   };

//   // Update data using PUT request
//   const updateData = async (id, updatedFields) => {
//     try {
//       const response = await fetch(`https://your-api-endpoint.com/data/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: "Bearer your-api-token", // Replace with actual token
//         },
//         body: JSON.stringify(updatedFields),
//       });

//       if (!response.ok) {
//         throw new Error(`API Error: ${response.statusText}`);
//       }

//       const updatedRow = await response.json();
//       toast.success("Data updated successfully!");

//       // Update the row in the local state
//       const updatedRows = data.map((row) =>
//         row.id === id ? { ...row, ...updatedRow } : row
//       );
//       setData(updatedRows);
//       setFilteredData(updatedRows); // Update filtered data as well
//     } catch (error) {
//       console.error("Error updating data:", error.message);
//       toast.error("Failed to update data.");
//     }
//   };

//   // Handle search functionality
//   const handleSearch = () => {
//     if (!searchInput) {
//       setFilteredData([]);
//       return;
//     }

//     const awbNumbers = searchInput.split(",").map((num) => num.trim());
//     const filtered = data.filter((row) =>
//       awbNumbers.includes(row.full_awb_number)
//     );

//     setFilteredData(filtered);
//     setSearchInput("");
//   };

//   // Handle editing a row
//   const handleEdit = (index) => {
//     setEditingRow(index);
//     setUpdatedData(filteredData[index]);
//   };

//   // Handle saving the updated row
//   const handleUpdate = (index) => {
//     if (editingRow === null) return;

//     const updatedFields = {
//       full_awb_number: updatedData.full_awb_number,
//       adcode: updatedData.adcode,
//       pan_number: updatedData.pan_number,
//       bank_account: updatedData.bank_account,
//     };

//     // Call updateData function
//     updateData(filteredData[index].id, updatedFields);

//     setEditingRow(null); // Exit editing mode
//   };

//   // Handle input changes during editing
//   const handleInputChange = (field, value) => {
//     setUpdatedData({ ...updatedData, [field]: value });
//   };

//   // Load data when the component mounts
//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <>
//       <div className="max-w-4xl p-6 space-y-6 mx-auto mr-36">
//         <div className="space-y-4">
//           <h1 className="text-xl font-bold">Xindus details</h1>
//           <div className="flex space-x-4">
//             <input
//               type="text"
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//               className="flex-1 p-2 border rounded-lg"
//               placeholder="Enter AWB Numbers (comma separated)"
//             />
//             <button
//               onClick={handleSearch}
//               className="p-3 bg-[#CECECE] rounded-lg hover:bg-blue-600 font-semibold text-white flex items-center"
//             >
//               <img
//                 src={searchIcon}
//                 alt="Search"
//                 className="w-5 h-5 mr-2"
//               />
//               Search
//             </button>
//           </div>
//         </div>
//       </div>

//       {filteredData.length > 0 && (
//         <>
//           <div className="p-4 ml-64 max-w-7xl">
//             <div className="grid grid-cols-7 gap-4 bg-gray-100 text-gray-700 font-bold p-4 rounded-t-lg">
//               <div className="text-center">AWB Number</div>
//               <div className="text-center">Ad Code</div>
//               <div className="text-center">PAN Number</div>
//               <div className="text-center">Bank Account</div>
//               <div className="text-center">Status</div>
//               <div className="text-center">Operation</div>
//               <div className="text-center">Action</div>
//             </div>
//           </div>

//           <div className="p-4 ml-64 max-w-7xl space-y-4">
//             {filteredData.map((row, index) => (
//               <div
//                 key={row.id}
//                 className="bg-white shadow-lg rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
//               >
//                 <div className="grid grid-cols-7 gap-4 items-center">
//                   <div className="text-center font-semibold">
//                     {editingRow === index ? (
//                       <input
//                         type="text"
//                         value={updatedData.full_awb_number}
//                         onChange={(e) =>
//                           handleInputChange("full_awb_number", e.target.value)
//                         }
//                         className="p-1 border rounded"
//                       />
//                     ) : (
//                       row.full_awb_number
//                     )}
//                   </div>
//                   <div className="text-center">
//                     {editingRow === index ? (
//                       <input
//                         type="text"
//                         value={updatedData.adcode}
//                         onChange={(e) =>
//                           handleInputChange("adcode", e.target.value)
//                         }
//                         className="p-1 border rounded"
//                       />
//                     ) : (
//                       row.adcode
//                     )}
//                   </div>
//                   <div className="text-center">
//                     {editingRow === index ? (
//                       <input
//                         type="text"
//                         value={updatedData.pan_number}
//                         onChange={(e) =>
//                           handleInputChange("pan_number", e.target.value)
//                         }
//                         className="p-1 border rounded"
//                       />
//                     ) : (
//                       row.pan_number
//                     )}
//                   </div>
//                   <div className="text-center">
//                     {editingRow === index ? (
//                       <input
//                         type="text"
//                         value={updatedData.bank_account}
//                         onChange={(e) =>
//                           handleInputChange("bank_account", e.target.value)
//                         }
//                         className="p-1 border rounded"
//                       />
//                     ) : (
//                       row.bank_account
//                     )}
//                   </div>
//                   <div
//                     className={`py-2 px-4 text-center font-semibold ${
//                       row.status === "Active"
//                         ? "bg-green-100 text-green-700 rounded-full"
//                         : "bg-red-500 text-white rounded-full"
//                     }`}
//                   >
//                     {row.status || "Active"}
//                   </div>
//                   <div className="flex justify-center gap-4">
//                     <button
//                       onClick={() => handleEdit(index)}
//                       className="text-blue-500 hover:text-blue-700"
//                     >
//                       <FaEdit />
//                     </button>
//                     <button
//                       onClick={() => handleUpdate(index)}
//                       className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
//                     >
//                       Update
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//       <ToastContainer />
//     </>
//   );
// };

// export default Update;
