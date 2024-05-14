import  { useState } from 'react';
import { Alert, AlertIcon, Button, Flex, Grid, GridItem, Heading, Input, InputGroup, InputRightElement, Spinner, Tag, TagCloseButton, TagLabel, Text, Tooltip } from '@chakra-ui/react';
import SideNav from '../components/SideNav';
import { FaArrowRight, FaBan } from 'react-icons/fa';
import axios from 'axios'
const PDFtotifPage = () => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successfulAWBs, setSuccessfulAWBs] = useState([]);
  const [failedAWBs, setFailedAWBs] = useState([]);
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
  }
  const handleTagRemove = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
  };
  const handleResetAll = () => {
    setTags([]);
    setError('');
  };
  const handleSubmit = async () => {
    try {
      setLoading(true)
      const res = await axios.post(`http://localhost:5000/api/v1/upload-convert`,{ awbNumbers: tags }, { responseType: 'arraybuffer' });
      const successful = res.headers['successful'] || [];
      const failed = res.headers['failed'] || [];
      setSuccessfulAWBs(JSON.parse(successful).map(item => item.replace(/["']/g, "")));
      setFailedAWBs(JSON.parse(failed).map(item => item.replace(/["']/g, "")));
      if (!res.data) {
        console.error('Empty response received.');
        return;
      }
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
      setTimeout(() => setSuccess(false), 6000);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Flex flexDir='row'>
      <SideNav />
      <Flex w='100%' align='center' flexDir='column' p='1%' ml='30vh'>
        {success && (
          <Alert status="success" w="50vh" mt={2}>
            <AlertIcon />
            {successfulAWBs.length}/{tags.length} Files downloaded successfully.
          </Alert>
        )}
        <Heading size='lg' color='gray.400'>PDF to TIF</Heading>
        <Flex flexWrap="wrap" w='80vh' mt='2vh'>
          <Heading fontSize='18px' fontWeight='500' color='gray.300' mr={3}>AWB numbers:</Heading>
          <InputGroup size='md' mt={2}
            mb={2}>
            <Input
              placeholder="Enter AWB numbers separated by commas"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              variant={error ? "filled" : "outline"}
              size="md"
              borderColor={error ? "red.300" : "gray.200"}
            />
            <InputRightElement>
              <Button onClick={handleEnter}>
                <FaArrowRight />
              </Button>
            </InputRightElement>
          </InputGroup>
          {error && <Text color="red.500" fontSize="sm" mt={1}>{error}</Text>}
          <Flex flexDir='row' justifyContent='flex-end' gap={2} mt={1} w='80vh'>
            <Button onClick={handleResetAll}>Reset All</Button>
            {tags.length === 0 && successfulAWBs.length===0 && failedAWBs.length===0 ?
              (<Tooltip label='Please enter one or more AWB'>
                <Button colorScheme='teal' isDisabled={true}><FaBan color='red' /></Button>
              </Tooltip>) :
              (<Button colorScheme='teal' isLoading={loading} onClick={handleSubmit}>{loading ? <Spinner size='sm' color='white' /> : 'Convert'}</Button>)}
          </Flex>
        </Flex>
        <Flex w='100%' flexDir='col' p={3} justifyContent='space-around' alignItems='center' mt={5}>
          <Grid templateColumns='repeat(2,1fr)' gap={9}>
            {tags.length !== 0 &&
              <GridItem backgroundColor='gray.700' p={4} borderRadius='10'>
                <Heading size='md' mb={3} textAlign='center'>Input AWBs</Heading>
                <Grid templateColumns='repeat(4, 1fr)' gap={1}  >
                  {tags.map((tag, index) => (
                    <Tag key={index} mr={2} mb={2} justifyContent='space-between' size="md" variant="solid" colorScheme="teal">
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleTagRemove(tag)} />
                    </Tag>
                  ))}
                </Grid>
              </GridItem>
            }{(successfulAWBs.length>0 || failedAWBs.length>0) &&<GridItem backgroundColor='gray.700' p={4} borderRadius='10'>
            {successfulAWBs.length > 0 && (
              <GridItem>
                <Heading size='md' mb={3} textAlign='center'>Successfully converted</Heading>
                <Grid templateColumns='repeat(4, 1fr)' gap={1}>
                  {successfulAWBs.map((awb, index) => (
                    <Tag key={index} mr={2} mb={2} justifyContent='space-between' size="md" variant="solid" colorScheme="green">
                      <TagLabel>{awb}</TagLabel>
                    </Tag>
                  ))}
                </Grid>
              </GridItem>
            )}{failedAWBs.length > 0 && (
              <GridItem>
                <Heading size='md' mb={3} textAlign='center'>Conversion Failed</Heading>
                <Grid templateColumns='repeat(4, 1fr)' gap={1}>
                  {failedAWBs.map((awb, index) => (
                    <Tag key={index} mr={2} mb={2} justifyContent='space-between' size="md" variant="solid" colorScheme="red">
                      <TagLabel>{awb}</TagLabel>
                    </Tag>
                  ))}
                </Grid>
              </GridItem>
            )}
            </GridItem>}
          </Grid>
        </Flex>
        {/* Reset button */}
        {successfulAWBs.length > 0 || failedAWBs.length > 0 ? (
          <Button mt={4} colorScheme="teal" onClick={() => {setSuccessfulAWBs([]); setFailedAWBs([]); setTags([]);}}>
            Convert New
          </Button>
        ) : null}
      </Flex>
    </Flex>
  );
};
export default PDFtotifPage;
