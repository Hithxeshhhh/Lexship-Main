import "react-toastify/dist/ReactToastify.css";
import BarcodeScanner from "../components/BarcodeScanner";
import React from "react";
import SideNav from "../components/SideNav";
import instance from "../utils/AxiosInstance";
import { keyframes } from "@chakra-ui/react";
import { useState } from "react";
import { FaArrowRight, FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";
import { labelData } from "../utils/data.json";

import {
  Box,
  Flex, Heading, Input, Button, InputGroup, InputRightElement, Text, Grid, GridItem, Tag, TagLabel, TagCloseButton, Divider, Spinner, Alert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Select, RadioGroup, Radio, Stack, useToast
} from '@chakra-ui/react';

const Relabel = () => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [successfulAWBs, setSuccessfulAWBs] = useState([]);
  const [failedAWBs, setFailedAWBs] = useState([]);
  const [emiratesOption, setEmiratesOption] = useState("");
  const [showOptions , setShowOptions] = useState(false);
  const toasts = useToast();




  const handleResetAll = () => {
    setTags([]);
    setError('');
    setSuccessfulAWBs([]);
    setFailedAWBs([]);
    setEmiratesOption("");
    setShowOptions(false);
  };

  const handleProvider = (e) => {
    setProvider(e.target.value);
    if (e.target.value === 'EMIRATES') {
      setShowOptions(true)
    }
    if (e.target.value !== 'EMIRATES') {
      setShowOptions(false)
      setEmiratesOption("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError('');
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      const trimmedInput = inputValue.trim();
      const newTags = trimmedInput.split(',').map(tag => tag.trim());
      const uniqueNewTags = newTags.filter(tag => !tags.includes(tag));
      const invalidTags = uniqueNewTags.filter(tag => !/^[a-zA-Z0-9]+$/.test(tag));
      if (invalidTags.length === 0) {
        const duplicates = newTags.filter(tag => tags.includes(tag));
        if (duplicates.length === 0) {
          setTags([...tags, ...uniqueNewTags]);
        } else {
          setError('One or more AWB numbers already exist.');
        }
        setTags([...tags, ...uniqueNewTags]);
      } else {
        setError('Invalid AWB format.');
      }

      setInputValue('');
    }
  };

  const handleEnter = () => {
    if (inputValue.trim() !== '') {
      const trimmedInput = inputValue.trim();
      const newTags = trimmedInput.split(',').map(tag => tag.trim());
      const uniqueNewTags = newTags.filter(tag => !tags.includes(tag));
      const invalidTags = uniqueNewTags.filter(tag => !/^[a-zA-Z0-9]+$/.test(tag));
      if (invalidTags.length === 0) {
        const duplicates = newTags.filter(tag => tags.includes(tag));
        if (duplicates.length === 0) {
          setTags([...tags, ...uniqueNewTags]);
        } else {
          setError('One or more AWB numbers already exist.');
        }
        setTags([...tags, ...uniqueNewTags]);
      } else {
        setError('Invalid AWB format.');
      }

      setInputValue('');
    }
  };
  var selectedProvider = "";

  // new changes in function to handle the submit
  const handleSubmit = async () => {
    let url_lex = '';
    if (import.meta.env.VITE_ENV === 'prod') url_lex = import.meta.env.VITE_LEX_INITIAL_PROD;
    else url_lex = import.meta.env.VITE_LEX_INITIAL_DEV;

    try {
        setLoading(true);
        selectedProvider = labelData.find(data => data.name === provider);

        if (selectedProvider) {
            const url = `${url_lex}/${selectedProvider.api}`;
            let payload;

            if (provider === 'EMIRATES') {
                payload = { AWB: tags, SERIES: emiratesOption };
                if (!emiratesOption) {
                    setError('Please select an Emirates option.');
                    setLoading(false);
                    return;
                }
            } else if (provider === 'XINDUS') {
                payload = { LEXSHIP: tags }; 
            } else {
                payload = { AWB: tags }; 
            }

            console.log(payload, url);
            const res = await instance.post(url, payload);
            console.log(res.data);
            
            // Check if the response is a string and parse it if necessary
            let responseData;
            if (typeof res.data === 'string') {
                console.log("Response is a string, attempting to extract JSON");
                try {
                    // Find the first '{' character to extract just the JSON part
                    const jsonStartIndex = res.data.indexOf('{');
                    if (jsonStartIndex !== -1) {
                        const jsonStr = res.data.substring(jsonStartIndex);
                        console.log("Extracted JSON string:", jsonStr);
                        responseData = JSON.parse(jsonStr);
                    } else {
                        console.error("No JSON object found in response");
                        responseData = { Success: [], Fail: [] };
                    }
                } catch (err) {
                    console.error("Error parsing response as JSON:", err);
                    responseData = { Success: [], Fail: [] };
                }
            } else {
                responseData = res.data;
            }
            
            const { Success = [], Fail = [] } = responseData;
            console.log("Original Fail array:", Fail);
            
            // used this function especially for XINDUS provider
            const normalizeKeys = (obj) => {
                const newObj = {};
                for (const key in obj) {
                    // Replace spaces in keys with underscores
                    const newKey = key.replace(/ /g, "_");
                    newObj[newKey] = obj[key];
                }
                return newObj;
            };

            // Normalize keys in both Success and Fail arrays
            const normalizedSuccess = Success && Array.isArray(Success) ? Success.map(normalizeKeys) : [];
            const normalizedFail = Fail && Array.isArray(Fail) ? Fail.map(normalizeKeys) : [];
            console.log("Normalized Fail array:", normalizedFail);
            
            setSuccessfulAWBs(normalizedSuccess);
            // Map failed AWBs with specific handling for XINDUS provider
            if (provider === 'XINDUS') {
                // For XINDUS, directly access the original fields before normalization
                setFailedAWBs(Fail && Array.isArray(Fail) ? Fail.map(item => ({
                  awb: item["LEXSHIP AWB"] || "",
                  message: item.MESSAGE || ""
                })) : []);
            } else {
                setFailedAWBs(normalizedFail.map(item => ({
                  awb: item.FROM_AWB || item.POST11 || item.LEXSHIP_AWB,
                  message: item.MESSAGE
                })));
            }
            
            if (normalizedSuccess.length === tags.length) {
                setSuccess(true);
            } else {
                setError(`${normalizedFail.length} Invalid or already booked AWBs`);
            }

            setTimeout(() => setSuccess(false), 6000);
        } else {
            setError('Invalid provider selected.');
        }
    } catch (err) {
        console.error('Error:', err);
        
    } finally {
        setLoading(false);
    }
};


// handles the copy to clipboard function
  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toasts({
        title: "Copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }).catch((err) => {
      console.error('Failed to copy:', err);
    });
  };


  return (
    <Flex flexDir='row' className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <SideNav />
      <Flex w='100%' align='center' flexDir='column' p='1%' ml='30vh'>
        {success && (
          <Alert status="success" w="50vh" mt={2}>
            <AlertIcon />
            AWBs relabeled successfully
          </Alert>
        )}
        <Heading size='lg' textAlign='center' className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">Relabel</Heading>
        <Flex flexWrap='wrap' w='70vh' mt='2vh'>
          <Heading fontSize='18px' fontWeight='500' color='gray.300' mr={3}>AWB numbers:</Heading>
          <InputGroup size='md' mt={2} mb={2}>
            <Input
              placeholder="Enter AWB numbers separated by commas"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              variant={error ? "filled" : "outline"}
              size="md"
              border={'1px'}
              borderColor={error ? "red.300" : "gray.600"}
            />
            {inputValue.trim() === '' ?
              <InputRightElement width="4.3rem">
                <Button h="2.4rem" size="sm" onClick={() => setIsScannerOpen(true)} borderRadius={0} borderRight={'1px solid #565656'}>
                  <FaCamera />
                </Button>
                <Button h="2.4rem" size="sm" onClick={handleEnter} borderRadius={'0px 0.25rem 0.25rem 0px'}>
                  <FaArrowRight />
                </Button>
              </InputRightElement> :
              <InputRightElement>
                <Button onClick={handleEnter}>
                  <FaArrowRight />
                </Button>
              </InputRightElement>
            }
          </InputGroup>
          {error && <Text color="red.500" fontSize="sm">{error}</Text>}
        </Flex>
        <Flex w='100%' flexDir='col' p={3} justifyContent='center' alignItems='center' mt={5}>
          <Grid templateColumns='repeat(1,1fr)' gap={9} w='100%'>
            {(tags.length !== 0) &&
              <GridItem className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-800" p={5} borderRadius='10'>
                <Heading size='md' mb={3} textAlign='center'>Input AWBs : {tags.length}</Heading>
                <Grid templateColumns='repeat(6, 1fr)' gap={1}>
                  {tags.map((tag, index) => (
                    <Tag key={index} mr={2} mb={2} justifyContent='space-between' size="md" variant="solid" colorScheme="teal">
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleTagRemove(tag)} />
                    </Tag>
                  ))}
                </Grid>
                <Divider />
                <Flex flexDir='row' mt={5} gap={5} alignItems={'center'}>
                  <Heading size='sm' fontWeight={400} whiteSpace={'nowrap'}>Choose Provider:</Heading>
                  <Select placeholder='Select Type' onChange={handleProvider}>
                    {labelData.map((data, index) => (
                      <option key={index}>{data.name}</option>
                    ))}
                  </Select>
                </Flex>
                {showOptions && (
                  <Flex mt={5} gap={5} flexDir={'column'} alignItems={'center'}>
                    <Heading size='sm' fontWeight={400}>Select Emirates Option:</Heading>
                    <RadioGroup onChange={setEmiratesOption} value={emiratesOption}>
                      <Stack direction="row">
                        <Radio value='LX'>LX</Radio>
                        <Radio value="RR">RR</Radio>
                        <Radio value="EPX">EPX</Radio>
                      </Stack>
                    </RadioGroup>
                  </Flex>
                )}
                <Flex alignItems={'center'} justifyContent={'center'} mt={10} gap={5}>
                  <Button onClick={handleResetAll}>Reset All</Button>
                  <Button colorScheme='teal' isLoading={loading} onClick={handleSubmit}>
                    {loading ? <Spinner size='sm' color='white' /> : 'Submit'}
                  </Button>
                </Flex>
              </GridItem>
            }
          </Grid>
        </Flex>
        <Flex w="100%" p={3} flexDir="col" justifyContent="space-around" alignItems="center" mt={5}>
  <Grid templateColumns="repeat(1,1fr)" gap={9} w="100%">
    {(successfulAWBs.length > 0 || failedAWBs.length > 0) && (
      <GridItem className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-800" p={4} borderRadius="10">
        {successfulAWBs.length > 0 && (
          <GridItem>
            <Heading size="md" mb={5} textAlign="center">
              Successful: {successfulAWBs.length}
            </Heading>
            <Grid templateColumns="repeat(1, 1fr)">
              {successfulAWBs.map((awb, index) => (
                <Flex key={index} mb={2} justifyContent="center" alignItems="center">
                  {provider === 'EMIRATES' && (
                    <Text mr={2}>
                      {awb.FROM_AWB} → {awb.EMIRATES}
                    </Text>
                  )}
                  {provider === 'CLEVY' && (
                    <Text mr={2}>
                      {awb.FROM_AWB} → {awb.CLEVY_AWB}
                    </Text>
                  )}
                  {provider === 'ORANGEDS' && (
                    <Text mr={2}>
                      {awb.FROM_AWB} → {awb.ORANGEDS}
                    </Text>
                  )}
                  {provider === 'ASENDIA' && (
                    <Text mr={2}>
                      {awb.FROM_AWB} → {awb.ASENDIA_AWB}
                    </Text>
                  )}
                {/* added New Xindus provider */}
                  {provider === 'XINDUS' && (
                    <Text mr={2}>
                      {awb.LEXSHIP_AWB} → {awb.XINDUS_AWB}
                    </Text>
                  )}
                  {provider === 'RSA' && (
                    <Text mr={2}>
                      {awb.FROM_AWB} → {awb.RSA_AWB}
                    </Text>
                  )}
                </Flex>
              ))}
            </Grid>
          </GridItem>
        )}
        {failedAWBs.length > 0 && (
          <GridItem>
            <Heading size="md" mb={5} textAlign="center">
              Failed: {failedAWBs.length}
            </Heading>
            <Box>
              {failedAWBs.map((item, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={3}
                  borderRadius="md"
                  bg="red.600"
                  color="white"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text fontWeight="bold">{item.awb}</Text>
                  <Text fontSize="10pt" fontWeight="bold" mx={3}>
                    {item.message}
                  </Text>
                </Box>
              ))}
            </Box>
          </GridItem>
        )}
        {/* Copy All Button for both success and failure */}
        <Flex justifyContent="center" mt={4}>
          <Button
            size="sm"
            onClick={() => {
              const successText = successfulAWBs.map(awb => {
                switch (provider) {
                  case 'EMIRATES':
                    return `${awb.FROM_AWB} → ${awb.EMIRATES}`;
                  case 'CLEVY':
                    return `${awb.FROM_AWB} → ${awb.CLEVY_AWB}`;
                  case 'ORANGEDS':
                    return `${awb.FROM_AWB} → ${awb.ORANGEDS}`;
                  case 'ASENDIA':
                    return `${awb.FROM_AWB} → ${awb.ASENDIA_AWB}`;
                  case 'XINDUS':
                    return `${awb.LEXSHIP_AWB} → ${awb.XINDUS_AWB}`;
                  case 'RSA':
                    return `${awb.FROM_AWB} → ${awb.RSA_AWB}`;
                  default:
                    return `${awb.FROM_AWB} → Unknown`;
                }
              }).join('\n');

              const failureText = failedAWBs
                .map(item => `${item.awb}: ${item.message}`)
                .join('\n');

              const combinedText = [successText, failureText]
                .filter(Boolean)
                .join('\n\n');
              handleCopyToClipboard(combinedText);
            }}
          >
            Copy All
          </Button>
        </Flex>
      </GridItem>
    )}
  </Grid>
</Flex>


        <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Scan Barcode</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <BarcodeScanner tags={tags} setTags={setTags} onClose={() => setIsScannerOpen(false)} />
              {tags.length > 0 && (
                <GridItem backgroundColor='gray.700' p={5} borderRadius='10'>
                  <Heading size='md' mb={3} textAlign='center'>Input AWBs : {tags.length}</Heading>
                  <Grid templateColumns='repeat(2, 1fr)' gap={1}>
                    {tags.map((tag, index) => (
                      <Tag key={index} mr={2} mb={2} justifyContent='space-between' size="md" variant="solid" colorScheme="teal">
                        <TagLabel>{tag}</TagLabel>
                        <TagCloseButton onClick={() => handleTagRemove(tag)} />
                      </Tag>
                    ))}
                  </Grid>
                  <Divider />
                </GridItem>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={() => setIsScannerOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>
    </Flex>
  );
};

export default Relabel;
