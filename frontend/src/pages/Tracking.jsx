import React, { useEffect, useState } from "react";
import SideNav from "../components/SideNav";
import instance from "../utils/AxiosInstance";
import { FaArrowRight } from "react-icons/fa";

import { 
  Box,
  Flex,
  Heading,
  Input,
  Button,
  InputGroup,
  InputRightElement,
  Text,
  Grid,
  GridItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Select,
  useToast
} from '@chakra-ui/react';

const Tracking = () => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trackingIds, setTrackingIds] = useState([]);
  const toast = useToast();

  const handleResetAll = () => {
    setTags([]);
    setError('');
    setTrackingIds([]);
  };

  const handleProvider = (e) => {
    setProvider(e.target.value);
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
        setTags([...tags, ...uniqueNewTags]);
  } else {
        setError('Invalid AWB format.');
      }
      setInputValue('');
    }
  };

  const handleSubmit = async () => {
    let url_lex = import.meta.env.VITE_ENV === 'prod' 
      ? import.meta.env.VITE_LEX_INITIAL_PROD 
      : import.meta.env.VITE_LEX_INITIAL_DEV;
  
    const bearerToken = import.meta.env.VITE_BEARER_TOKEN;
  
    try {
      setLoading(true);
      setError("");
      setTrackingIds([]);
  
      if (!provider) {
        setError('Please select a provider.');
        return;
      }
  
      if (provider !== 'EMIRATES' && provider !== 'ASENDIA' && provider !== 'RSA') {
        setError('Invalid provider selected. Please choose EMIRATES, ASENDIA, or RSA.');
        return;
      }
  
      if (tags.length === 0) {
        setError('Please enter at least one AWB number.');
        return;
      }
  
      const url = `${url_lex}/api/lex/tracking/emirates/individual`;
      const payload = { VENDOR: provider, AWB: tags };
  
      const res = await instance.post(url, payload, {
        headers: { 'Authorization': `Bearer ${bearerToken}` }
      });
  
      let responseData = res.data;
  
      // Handle RSA response
      if (provider === 'RSA') {
        try {
          const responseString = typeof responseData === 'string' 
            ? responseData 
            : JSON.stringify(responseData);
      
          const matches = responseString.split('RAS VENDOR FINAL STATUS Before update Customer Table');
          const lastPart = matches[matches.length - 1];
          
          const awbMatch = lastPart.match(/\[(.*?)\](?=[^[]*$)/);
          
          if (awbMatch) {
            const awbArray = JSON.parse(awbMatch[0]);
            // Map the tracking numbers with their input tags
            const trackingNumbers = awbArray
              .filter(item => item && item.full_awb_number)
              .map((item, index) => ({
                tag: tags[index] || 'RSA', // Use input tag or default to 'RSA'
                trackingId: item.full_awb_number
              }));
      
            if (trackingNumbers.length > 0) {
              setTrackingIds(trackingNumbers);
              
              toast({
                title: "AWBs tracked successfully",
                description: `Tracked ${trackingNumbers.length} AWB(s)`,
                status: "success",
                duration: 5000,
                isClosable: true,
              });
              
              setSuccess(true);
              setTimeout(() => setSuccess(false), 5000);
            } else {
              setError("No valid tracking numbers found in the response");
              return;
            }
          } else {
            setError("Could not find tracking numbers in the response");
            return;
          }
        } catch (parseError) {
          console.error("Error processing RSA response:", parseError);
          setError("Failed to process tracking numbers");
          return;
        }
      } else {
        // Handle EMIRATES and ASENDIA
        try {
          const parsedData = Array.isArray(responseData) 
            ? responseData 
            : typeof responseData === 'string' 
              ? JSON.parse(responseData)
              : null;
  
          if (!parsedData) {
            throw new Error("Invalid response format");
          }
  
          const trackingNumbers = parsedData
            .filter(item => item && item.full_awb_number)
            .map((item, index) => ({
              tag: tags[index] || provider,
              trackingId: item.full_awb_number
            }));
  
          if (trackingNumbers.length > 0) {
            setTrackingIds(trackingNumbers);
            toast({
              title: "AWBs tracked successfully",
              description: `Tracked ${trackingNumbers.length} AWB(s)`,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
          } else {
            setError("No tracking numbers found in response");
            return;
          }
        } catch (parseError) {
          console.error("JSON Parsing Error:", parseError);
          setError("Failed to parse server response");
          return;
        }
      }
  
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An error occurred while processing your request");
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }; 
  
  return (
    <Flex flexDir='row' className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <SideNav />
      <Flex w='100%' align='center' flexDir='column' p='1%' ml='30vh'>
      {/* {success && (
  <Alert status="success" w="50vh" mt={2} onClose={() => setSuccess(false)}>
    <AlertIcon />
    AWBs tracked successfully
  </Alert>
)} */}
        {error && (
          <Alert status="error" w="50vh" mt={2}>
            <AlertIcon />
            {error}
          </Alert>
        )}
        <Heading className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">Tracking</Heading>
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
            <InputRightElement>
              <Button onClick={handleEnter}>
                <FaArrowRight />
              </Button>
            </InputRightElement>
          </InputGroup>
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
                    <option value="EMIRATES">EMIRATES</option>
                    <option value="ASENDIA">ASENDIA</option>
                    <option value="RSA">RSA</option>
                  </Select>
                </Flex>
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
          {trackingIds.length > 0 && (
  <Box mt={5} color="white">
    <Heading size="md" mb={3}>Tracking IDs:</Heading>
    <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={2}>
      {trackingIds.map((data, index) => (
        <Tag key={index} size="md" variant="solid" colorScheme="teal">
          <TagLabel>{data.tag} → {data.trackingId}</TagLabel>
        </Tag>
      ))}
    </Grid>
  </Box>
)}
      </Flex>
    </Flex>
 );
};

export default Tracking;