import React, { useEffect, useState } from "react";
import SideNav from "../components/SideNav.jsx";
import axios from "axios";

const Settings = () => {
    const [isLoggingEnabled, setIsLoggingEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use environment variables for API URLs
    const loggingStatusUrl = import.meta.env.VITE_LOGGING_STATUS_URL;
    const loggingToggleUrl = import.meta.env.VITE_LOGGING_TOGGLE_URL;

    useEffect(() => {
        // Fetch the logging status when the component mounts
        const fetchLoggingStatus = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(loggingStatusUrl, {
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_ZOHO_BEARER_TOKEN}`,
                    },
                });

                // Handle the GET response which uses isEnabled
                setIsLoggingEnabled(!!response.data.isEnabled);
                setError(null);
            } catch (error) {
                console.error("Error fetching logging status:", error);
                setError("Failed to fetch logging status");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLoggingStatus();
    }, [loggingStatusUrl]);

    const toggleLogging = async () => {
        // Immediately update the UI for better user experience
        const newLoggingStatus = !isLoggingEnabled;
        setIsLoggingEnabled(newLoggingStatus);

        try {
            setIsLoading(true);
            const response = await axios.post(
                loggingToggleUrl,
                {
                    enable: newLoggingStatus,
                },
                {
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_ZOHO_BEARER_TOKEN}`,
                    },
                }
            );

            // Handle the POST response which uses status
            let apiSuccess = false;

            if (response.data.status) {
                // If response uses status field
                apiSuccess = (response.data.status === "enabled") === newLoggingStatus;
            } else if (response.data.isEnabled !== undefined) {
                // If response uses isEnabled field
                apiSuccess = response.data.isEnabled === newLoggingStatus;
            }

            // If the API call didn't set the status as expected, revert
            if (!apiSuccess) {
                setIsLoggingEnabled(!newLoggingStatus);
                setError("Server returned unexpected status");
            } else {
                setError(null);
            }
        } catch (error) {
            console.error("Error toggling logging status:", error);
            // Revert the UI state if the API call fails
            setIsLoggingEnabled(!newLoggingStatus);
            setError("Failed to update logging settings");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
            <SideNav />
            <div className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <header className="pb-6 border-b border-gray-200">
                        <h1 className="font-bold bg-clip-text text-3xl text-transparent bg-gradient-to-r from-gray-300 to-indigo-500">
                            Settings
                        </h1>
                        <p className="mt-2 text-sm text-blue-500">
                            Manage your application preferences and configurations
                        </p>
                    </header>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 rounded-md border border-red-200">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-300">System Preferences</h2>

                        <div className="mt-4 p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-200">Logs</h3>
                                    <p className="text-sm text-gray-300">
                                        Enable or disable logging for debugging and monitoring
                                    </p>
                                    <div className="mt-2">
                                        <span className="text-sm text-gray-400">
                                            Status:{" "}
                                            <span
                                                className={
                                                    isLoggingEnabled
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                }
                                            >
                                                {isLoggingEnabled ? "Active" : "Inactive"}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    {isLoading && (
                                        <span className="text-sm text-gray-500 mr-3">
                                            Loading...
                                        </span>
                                    )}
                                    <button
                                        onClick={toggleLogging}
                                        disabled={isLoading}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                            isLoggingEnabled
                                                ? "bg-blue-600"
                                                : "bg-gray-200"
                                        }`}
                                        role="switch"
                                        aria-checked={isLoggingEnabled}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                isLoggingEnabled
                                                    ? "translate-x-6"
                                                    : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;