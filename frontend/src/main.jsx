import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.jsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { ToastContainer } from "react-toastify";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider >
      <App />
      <ToastContainer />
    </ChakraProvider>
  </React.StrictMode>,
)