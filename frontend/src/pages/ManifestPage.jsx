import SideNav from "../components/SideNav";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaArrowRight, FaCheck, FaChevronLeft, FaChevronRight, FaCloud, FaCog, FaDatabase, FaDownload, FaEdit, FaEye, FaFileExcel, FaRocket, FaSearch, FaTrash } from "react-icons/fa";
import { ajwwManifest, asendiaManifest } from "../utils/data.json";

import { 
  Alert, 
  AlertIcon, 
  Button, 
  Divider, 
  Flex, 
  Grid, 
  GridItem, 
  Heading, 
  Input, 
  InputGroup, 
  InputRightElement, 
  Select, 
  Spinner, 
  Tag, 
  TagCloseButton, 
  TagLabel, 
  Text,
  Box,
  VStack,
  HStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Tooltip,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Container,
  Progress
} from "@chakra-ui/react";

const ManifestPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("ajww");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jsonData, setJsonData] = useState(null);

  const [selectedField, setSelectedField] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const toast = useToast();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Dynamic URL selection
  let baseURL = '';
  if (import.meta.env.VITE_ENV === 'prod') baseURL = import.meta.env.VITE_BACKEND_PROD
  else if (import.meta.env.VITE_ENV === 'dev') baseURL = import.meta.env.VITE_BACKEND_DEV
  else baseURL = import.meta.env.VITE_BACKEND_LOCAL || 'http://localhost:3000'

  // Create axios instance with dynamic baseURL
  const instance = axios.create({
    baseURL: baseURL,
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
    },
  });

  // Vendor options
  const vendors = [
    { value: "ajww", label: "AJWW" },
    { value: "asendia", label: "Asendia" }
  ];

  // Dynamically select manifest config based on vendor
  const manifestConfig = selectedVendor === "ajww" ? ajwwManifest : asendiaManifest;

  // Steps configuration
  const steps = [
    { id: 1, title: "Vendor Selection", description: "Choose your vendor" },
    { id: 2, title: "Template Management", description: "Configure template (optional)" },
    { id: 3, title: "MAWB Search", description: "Process MAWB and generate Excel" }
  ];

  // Fetch JSON data on component mount and when vendor changes
  useEffect(() => {
    fetchJsonData();
  }, [selectedVendor]);

  const fetchJsonData = async () => {
    try {
      setLoading(true);
      const jsonDataRoute = manifestConfig.find(route => route.name === "Get JSON Data");
      const response = await instance.get(jsonDataRoute.endpoint);
      if (response.data.success) {
        setJsonData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching JSON data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch JSON data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Remove any commas and multiple spaces
    const cleanedValue = value.replace(/,/g, '').replace(/\s+/g, ' ');
    setInputValue(cleanedValue);
    setError("");
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEnter();
    }
  };

  const handleEnter = async () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      setError("Please enter a MAWB number");
      return;
    }

    // Check if input contains multiple values (comma-separated)
    if (trimmedValue.includes(',')) {
      setError("Please enter only one MAWB number at a time");
      return;
    }

    // Basic validation - ensure it's not empty and contains alphanumeric characters
    if (!trimmedValue.match(/^[a-zA-Z0-9\-]+$/)) {
      setError("Please enter a valid MAWB number (alphanumeric characters and hyphens only)");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const searchRoute = manifestConfig.find(route => route.name === "Search by MAWB and Generate Excel");
      const endpoint = searchRoute.endpoint;
      
      console.log('Making request to:', endpoint);
      console.log('Request body:', { mawbNumber: trimmedValue });
      
      const response = await instance.post(endpoint, {
        mawbNumber: trimmedValue
      });

      console.log('Response received:', response.data);

      if (response.data.success) {
        setSuccess(true);
        
        // Auto download the generated file
        try {
          const mawbNumber = trimmedValue;
          const downloadRoute = manifestConfig.find(route => route.name === "Download Excel by MAWB");
          const downloadEndpoint = downloadRoute.endpoint.replace(':mawbNumber', mawbNumber);
          const downloadResponse = await instance.get(downloadEndpoint, {
            responseType: 'blob'
          });
          
          // Create download link
          const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `manifest_${mawbNumber}.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          
          toast({
            title: "Success",
            description: `Excel file generated and downloaded: ${response.data.filename}`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          
          // Delete the file from server after download
          try {
            const deleteRoute = manifestConfig.find(route => route.name === "Delete File by MAWB");
            const deleteEndpoint = deleteRoute.endpoint.replace(':mawbNumber', mawbNumber);
            await instance.delete(deleteEndpoint);
            console.log('File deleted from server successfully');
          } catch (deleteError) {
            console.error('Error deleting file from server:', deleteError);
            // Don't show error to user as download was successful
          }
          
        } catch (downloadError) {
          console.error('Error downloading file:', downloadError);
          toast({
            title: "Warning",
            description: "File generated but download failed. Please try downloading manually.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
        
        setInputValue("");
      }
    } catch (error) {
      console.error('Error searching MAWB:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || "Error processing MAWB");
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to process MAWB",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJson = async () => {
    if (!selectedField || !fieldValue.trim()) {
      toast({
        title: "Error",
        description: "Please select a field and enter a value",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const updateRoute = manifestConfig.find(route => route.name === "Update JSON Data");
      const response = await instance.put(updateRoute.endpoint, {
        updates: {
          [selectedField]: fieldValue.trim()
        }
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Updated ${selectedField} successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchJsonData(); // Refresh JSON data
        setSelectedField("");
        setFieldValue("");
        setIsUpdateModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating JSON:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update JSON",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && selectedVendor) {
      setCompletedSteps([...completedSteps, 1]);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCompletedSteps([...completedSteps, 2]);
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const skipStep = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
    }
  };
 
  return (
    <Flex flexDir='row' minH="100vh" bg="gray.900">
      <SideNav />
      <Box flex="1" ml="30vh">
        <Container maxW="4xl" py={8}>
        {success && (
            <Alert status="success" bg="green.900" color="green.100" border="1px" borderColor="green.700" borderRadius="lg" mb={6}>
              <AlertIcon color="green.400" />
              Excel file generated successfully.
          </Alert>
        )}

          {/* Header */}
          <VStack spacing={6} mb={8}>
            <VStack spacing={2} textAlign="center">
              <Heading size='xl' color="white" fontWeight="600">
                Manifest Management
              </Heading>
              <Text color="gray.400" fontSize="lg">
                Follow the steps below to process your manifest
              </Text>
            </VStack>

            {/* Progress Steps */}
            <Box w="100%" maxW="2xl">
              <HStack spacing={0} justify="space-between" mb={4}>
                {steps.map((step, index) => (
                  <HStack key={step.id} flex="1" spacing={2}>
                    <Button
                      size="sm"
                      borderRadius="full"
                      w={8}
                      h={8}
                      minW={8}
                      bg={completedSteps.includes(step.id) ? "green.500" : currentStep === step.id ? "blue.500" : "gray.700"}
                      color="white"
                      _hover={{
                        bg: completedSteps.includes(step.id) ? "green.600" : currentStep === step.id ? "blue.600" : "gray.600"
                      }}
                      onClick={() => goToStep(step.id)}
                      fontSize="sm"
                    >
                      {completedSteps.includes(step.id) ? <FaCheck size={12} /> : step.id}
                    </Button>
                    {index < steps.length - 1 && (
                      <Box 
                        flex="1" 
                        h="2px" 
                        bg={completedSteps.includes(step.id) ? "green.500" : "gray.700"} 
                        mx={2}
                      />
                    )}
                  </HStack>
                ))}
              </HStack>
              
              <HStack spacing={4} justify="space-between">
                {steps.map((step) => (
                  <VStack key={step.id} flex="1" spacing={1} textAlign="center">
                    <Text 
                      fontSize="sm" 
                      fontWeight="600" 
                      color={currentStep === step.id ? "blue.400" : completedSteps.includes(step.id) ? "green.400" : "gray.500"}
                    >
                      {step.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {step.description}
                    </Text>
                  </VStack>
                ))}
              </HStack>
            </Box>
          </VStack>

          {/* Step Content */}
          <Box minH="400px">
            {/* Step 1: Vendor Selection */}
            {currentStep === 1 && (
              <Card bg="gray.800" border="1px" borderColor="gray.700" borderRadius="xl" maxW="2xl" mx="auto">
                <CardHeader>
                  <HStack spacing={3}>
                    <Box p={3} bg="orange.900" borderRadius="lg">
                      <FaCog color="#FB923C" size={20} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Heading size="lg" color="white" fontWeight="600">
                        Select Vendor
                      </Heading>
                      <Text color="gray.400">
                        Choose the vendor for your manifest processing
                      </Text>
                    </VStack>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6}>
                    <VStack align="stretch" spacing={3} w="100%">
                      <Text color="gray.300" fontWeight="500">
                        Available Vendors
                      </Text>
                      <Select 
                        value={selectedVendor} 
                        onChange={(e) => setSelectedVendor(e.target.value)}
                        bg="gray.700"
                        color="white"
                        border="1px"
                        borderColor="gray.600"
                        borderRadius="lg"
                        size="lg"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3B82F6" }}
                      >
                        {vendors.map(vendor => (
                          <option key={vendor.value} value={vendor.value} style={{backgroundColor: '#374151'}}>
                            {vendor.label}
                          </option>
                        ))}
                      </Select>
                    </VStack>

                    <HStack justify="flex-end" w="100%" spacing={3}>
                      <Button
                        rightIcon={<FaChevronRight />}
                        colorScheme="blue"
                        size="lg"
                        onClick={nextStep}
                        isDisabled={!selectedVendor}
                      >
                        Continue
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Step 2: Template Management */}
            {currentStep === 2 && (
              <Card bg="gray.800" border="1px" borderColor="gray.700" borderRadius="xl" maxW="2xl" mx="auto">
                <CardHeader>
                  <HStack spacing={3}>
                    <Box p={3} bg="blue.900" borderRadius="lg">
                      <FaDatabase color="#60A5FA" size={20} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Heading size="lg" color="white" fontWeight="600">
                        Template Management
                      </Heading>
                      <Text color="gray.400">
                        Configure your template settings (optional)
                      </Text>
                    </VStack>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6}>
                    <Box p={4} bg="gray.750" borderRadius="lg" border="1px" borderColor="gray.600" w="100%">
                      {loading ? (
                        <Flex justify="center" p={4}>
                          <Spinner color="blue.400" />
                        </Flex>
                      ) : jsonData ? (
                        <VStack align="start" spacing={3}>
                          <HStack>
                            <Box w={2} h={2} bg="green.400" borderRadius="full" />
                            <Text color="green.400" fontWeight="500">
                              Template Active for {selectedVendor.toUpperCase()}
                            </Text>
                          </HStack>
                          <Text color="gray.300" fontSize="sm">
                            Your template is loaded and ready. You can update it using the button below or skip this step.
                          </Text>
                          <Button 
                            leftIcon={<FaEdit />} 
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => setIsUpdateModalOpen(true)}
                          >
                            Update Template
                          </Button>
                        </VStack>
                      ) : (
                        <VStack align="start" spacing={3}>
                          <HStack>
                            <Box w={2} h={2} bg="red.400" borderRadius="full" />
                            <Text color="red.400" fontWeight="500">
                              No Template Found
                            </Text>
                          </HStack>
                          <Text color="gray.300" fontSize="sm">
                            No template data available for {selectedVendor.toUpperCase()}. You can skip this step.
                          </Text>
                        </VStack>
                      )}
                    </Box>

                    <HStack justify="space-between" w="100%">
                      <Button
                        leftIcon={<FaChevronLeft />}
                        variant="outline"
                        size="lg"
                        onClick={prevStep}
                      >
                        Back
                      </Button>
                      <HStack spacing={3}>
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={skipStep}
                          color="gray.400"
                        >
                          Skip
                        </Button>
                        <Button
                          rightIcon={<FaChevronRight />}
                          colorScheme="blue"
                          size="lg"
                          onClick={nextStep}
                        >
                          Continue
                        </Button>
                      </HStack>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Step 3: MAWB Search */}
            {currentStep === 3 && (
              <Card bg="gray.800" border="1px" borderColor="gray.700" borderRadius="xl" maxW="2xl" mx="auto">
                <CardHeader>
                  <HStack spacing={3}>
                    <Box p={3} bg="green.900" borderRadius="lg">
                      <FaSearch color="#4ADE80" size={20} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Heading size="lg" color="white" fontWeight="600">
                        MAWB Processing
                      </Heading>
                      <Text color="gray.400">
                        Enter MAWB number to generate Excel manifest
                      </Text>
                    </VStack>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6}>
                    <VStack align="stretch" spacing={4} w="100%">
                      <VStack align="stretch" spacing={3}>
                        <Text color="gray.300" fontWeight="500">
                          Master Air Waybill Number
                        </Text>
                        <InputGroup size="lg">
            <Input
                          placeholder="Enter single MAWB number (e.g., 125-12345678)"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
                          bg="gray.700"
                          color="white"
                          border="1px"
                          borderColor={error ? "red.500" : "gray.600"}
                          borderRadius="lg"
                          _placeholder={{ color: "gray.400" }}
                          _hover={{ borderColor: error ? "red.400" : "gray.500" }}
                          _focus={{ 
                            borderColor: error ? "red.500" : "green.500", 
                            boxShadow: error ? "0 0 0 1px #EF4444" : "0 0 0 1px #10B981"
                          }}
            />
            <InputRightElement>
                            <Button 
                              onClick={handleEnter} 
                              isLoading={loading}
                              colorScheme="green"
                              size="md"
                              borderRadius="md"
                            >
                <FaArrowRight />
              </Button>
            </InputRightElement>
          </InputGroup>
                        {error && (
                          <Text color="red.400" fontSize="sm" fontWeight="500">
                            {error}
                          </Text>
                        )}
                      </VStack>

                      <Box p={4} bg="rgba(59, 130, 246, 0.1)" borderRadius="lg" border="1px" borderColor="blue.800">
                        <HStack spacing={3}>
                          <FaCloud color="#60A5FA" size={16} />
                          <Text color="blue.300" fontSize="sm">
                            Excel manifest will be automatically generated and downloaded after processing
                          </Text>
                        </HStack>
                      </Box>

                      {/* Vendor Info */}
                      <Box p={3} bg="gray.750" borderRadius="lg" border="1px" borderColor="gray.600">
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">Active Vendor:</Text>
                          <Text color="white" fontWeight="600">{selectedVendor.toUpperCase()}</Text>
                        </HStack>
                      </Box>
                    </VStack>

                    <HStack justify="space-between" w="100%">
                      <Button
                        leftIcon={<FaChevronLeft />}
                        variant="outline"
                        size="lg"
                        onClick={prevStep}
                      >
                        Back
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </Box>
        </Container>
      </Box>

      {/* Update JSON Modal */}
      <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} size="lg">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent bg="gray.800" borderRadius="xl" border="1px" borderColor="gray.700">
          <ModalHeader borderBottom="1px" borderColor="gray.700" color="white">
            <HStack spacing={3}>
              <Box p={2} bg="blue.900" borderRadius="lg">
                <FaEdit color="#60A5FA" size={16} />
              </Box>
              <Text fontWeight="600">Update Template - {selectedVendor.toUpperCase()}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody py={6}>
            <VStack spacing={6}>
              <VStack align="stretch" spacing={3} w="100%">
                <Text color="gray.300" fontWeight="500">
                  Select Field
                </Text>
                <Select 
                  value={selectedField} 
                  onChange={(e) => setSelectedField(e.target.value)}
                  bg="gray.700"
                  color="white"
                  border="1px"
                  borderColor="gray.600"
                  borderRadius="lg"
                  _hover={{ borderColor: "gray.500" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3B82F6" }}
                >
                  <option value="" style={{backgroundColor: '#374151'}}>Choose a field...</option>
                  {jsonData && (() => {
                    // Handle different JSON structures for AJWW vs Asendia
                    let templateData;
                    if (selectedVendor === "ajww") {
                      // AJWW uses object structure
                      templateData = jsonData.manifest_data;
                    } else {
                      // Asendia now uses object structure like AJWW
                      templateData = jsonData.manifest_data || {};
                    }
                    return Object.keys(templateData).map(key => (
                      <option key={key} value={key} style={{backgroundColor: '#374151'}}>
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </option>
                    ));
                  })()}
                </Select>
              </VStack>
              
              <VStack align="stretch" spacing={3} w="100%">
                <Text color="gray.300" fontWeight="500">
                  New Value
                </Text>
                <Input 
                  value={fieldValue} 
                  onChange={(e) => setFieldValue(e.target.value)}
                  placeholder="Enter new value"
                  bg="gray.700"
                  color="white"
                  border="1px"
                  borderColor="gray.600"
                  borderRadius="lg"
                  _placeholder={{ color: "gray.400" }}
                  _hover={{ borderColor: "gray.500" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3B82F6" }}
                />
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor="gray.700">
            <Button 
              colorScheme="blue"
              mr={3} 
              onClick={handleUpdateJson} 
              isLoading={loading}
            >
              Update
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setIsUpdateModalOpen(false)}
              color="gray.400"
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default ManifestPage;