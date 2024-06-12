import { useState, useEffect } from 'react';
import { Alert, AlertIcon, Button, Center, Divider, Flex, Grid, GridItem, Heading, Input, InputGroup, InputRightElement, Select, Spinner, Tag, TagCloseButton, TagLabel, Text, Tooltip, Progress } from '@chakra-ui/react';
import SideNav from '../components/SideNav';
import { FaArrowRight, FaBan } from 'react-icons/fa';
import axios from 'axios';
import { io } from 'socket.io-client';

const PDFtotifPage = () => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successfulAWBs, setSuccessfulAWBs] = useState([]);
  const [failedAWBs, setFailedAWBs] = useState([]);
  const [conversionType, setConversionType] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const socket = io('http://localhost:5000'); // replace with your backend URL

    socket.on('progress', (data) => {
      console.log('Progress event received:', data);
      const calculatedProgress = (data.completed / data.total) * 100;
      console.log('Calculated Progress:', calculatedProgress);
      setProgress(calculatedProgress);
      
    });
    socket.on('connect', () => {
      console.log('Socket.IO connected successfully!');
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected.');
    });

    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
    return () => { 
      socket.disconnect();
    };
  }, []);


  const handleConversionTypeChange = (e) => {
    setConversionType(e.target.value);
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

  const handleEnter = (e) => {
    if (e && inputValue.trim() !== '') {
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

  const handleTagRemove = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
  };

  const handleResetAll = () => {
    if (successfulAWBs.length) {
      setSuccessfulAWBs([]);
    }
    if (failedAWBs.length) {
      setFailedAWBs([]);
    }
    setTags([]);
    setError('');
  };

  const handleSubmit = async () => {
    if (!conversionType) {
      setError('Please select a conversion type.');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`http://localhost:5000/api/v1/upload-convert`, { awbNumbers: tags, conversionType }, { responseType: 'arraybuffer' });
      const successful = res.headers['successful'] || [];
      const failed = res.headers['failed'] || [];
      setSuccessfulAWBs(JSON.parse(successful).map(item => item.replace(/["']/g, "")));
      setFailedAWBs(JSON.parse(failed).map(item => item.replace(/["']/g, "")));
      console.log(res.data);
      if (res.data.byteLength !== 0) {
        const blob = new Blob([res.data], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const timestamp = `TIFF_${day}${month}${year}_${hours}${minutes}${seconds}`;
        const filename = `${timestamp}.zip`;
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        setSuccess(true);
        setError('');
        setTimeout(() => setSuccess(false), 6000);
      } else {
        setError('Type mismatch');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex flexDir="row">
      <SideNav />
      <Flex w="100%" align="center" flexDir="column" p="1%" ml="30vh">
        {success && (
          <Alert status="success" w="50vh" mt={2}>
            <AlertIcon />
            {successfulAWBs.length}/{tags.length} Files downloaded successfully.
          </Alert>
        )}
        <Heading size="lg" color="gray.400">PDF to TIF</Heading>
        <Flex flexWrap="wrap" w="70vh" mt="2vh">
          <Heading fontSize="18px" fontWeight="500" color="gray.300" mr={3}>AWB numbers:</Heading>
          <InputGroup size="md" mt={2} mb={2}>
            <Input
              placeholder="Enter AWB numbers separated by commas"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              variant={error ? "filled" : "outline"}
              size="md"
              border="1px"
              borderColor={error ? "red.300" : "gray.600"}
            />
            <InputRightElement>
              <Button onClick={handleEnter}>
                <FaArrowRight />
              </Button>
            </InputRightElement>
          </InputGroup>
          {error && <Text color="red.500" fontSize="sm" mt={1}>{error}</Text>}
        </Flex>
        <Flex w="100%" flexDir="col" p={3} justifyContent="center" alignItems="center" mt={5}>
          <Grid templateColumns="repeat(1,1fr)" gap={9} w="100%">
            {tags.length !== 0 && (
              <GridItem backgroundColor="gray.700" p={5} borderRadius="10">
                <Heading size="md" mb={3} textAlign="center">Input AWBs : {tags.length}</Heading>
                <Grid templateColumns="repeat(6, 1fr)" gap={1}>
                  {tags.map((tag, index) => (
                    <Tag key={index} mr={2} mb={2} justifyContent="space-between" size="md" variant="solid" colorScheme="teal">
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleTagRemove(tag)} />
                    </Tag>
                  ))}
                </Grid>
                <Divider />
                <Center>
                  <Select placeholder="Select Type" mt={5} w="40%" onChange={handleConversionTypeChange}>
                    <option value="Commercial Invoice">Commercial Invoice</option>
                    <option value="CI & Label">CI & Label</option>
                    <option value="Clevy Label">Clevy Label</option>
                    <option value="Orange Label">Orange Label</option>
                  </Select>
                </Center>
                <Flex flexDir="row" justify="center" gap={2} mt={5}>
                  <Button onClick={handleResetAll}>Reset All</Button>
                  {tags.length === 0 && successfulAWBs.length === 0 && failedAWBs.length === 0 ? (
                    <Tooltip label="Please enter one or more AWB">
                      <Button colorScheme="teal" isDisabled={true}>
                        <FaBan color="red" />
                      </Button>
                    </Tooltip>
                  ) : (
                    <Button colorScheme="teal" isLoading={loading} onClick={handleSubmit}>
                      {loading ? <Spinner size="sm" color="white" /> : 'Convert'}
                    </Button>
                  )}
                </Flex>
              </GridItem>
            )}
          </Grid>
        </Flex>
        <Flex w="100%" p={3} flexDir="col" justifyContent="space-around" alignItems="center" mt={5}>
          <Grid templateColumns="repeat(1,1fr)" gap={9} w="100%">
            {(successfulAWBs.length > 0 || failedAWBs.length > 0) && (
              <GridItem backgroundColor="gray.700" p={4} borderRadius="10">
                {successfulAWBs.length > 0 && (
                  <GridItem>
                    <Heading size="md" mb={5} textAlign="center">Successfully converted : {successfulAWBs.length}</Heading>
                    <Grid templateColumns="repeat(6, 1fr)" gap={1}>
                      {successfulAWBs.map((awb, index) => (
                        <Tag key={index} mr={2} mb={2} justifyContent="space-between" size="md" variant="solid" colorScheme="green">
                          <TagLabel>{awb}</TagLabel>
                        </Tag>
                      ))}
                    </Grid>
                  </GridItem>
                )}
                {failedAWBs.length > 0 && (
                  <GridItem>
                    <Heading size="md" mt={10} mb={5} textAlign="center">Conversion Failed : {failedAWBs.length}</Heading>
                    <Grid templateColumns="repeat(6, 1fr)" gap={1}>
                      {failedAWBs.map((awb, index) => (
                        <Tag key={index} mr={2} mb={2} justifyContent="space-between" size="md" variant="solid" colorScheme="red">
                          <TagLabel>{awb}</TagLabel>
                        </Tag>
                      ))}
                    </Grid>
                  </GridItem>
                )}
              </GridItem>
            )}
          </Grid>
        </Flex>
        {loading && (
          <Flex w="fit-conten%" alignItems="center" justifyContent="center" flexDir="column" mt={5}>
            <Text>Progress: {Math.round(progress)}%</Text>
            <Progress value={progress} size="md" colorScheme="teal" w={1000}  hasStripe isAnimated borderRadius={10}  />
            <Text>Conversion in progress.... (ETC : {Math.ceil(tags.length/ 80) * 3} minutes)</Text>
          </Flex>
         )} 
      </Flex>
    </Flex>
  );
};

export default PDFtotifPage;
