import { useState } from 'react';
import { Alert, AlertIcon, Button, Flex, Heading, Input, InputGroup, InputRightElement, Spinner, Tag, TagCloseButton, TagLabel, Text, Tooltip } from '@chakra-ui/react';
import SideNav from '../components/SideNav';
import { FaArrowRight, FaBan } from 'react-icons/fa';
import axios from 'axios'

const PDFtotifPage = () => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);


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
      const res = await axios.post('http://localhost:5000/api/v1/upload-convert', { awbNumbers: tags }, { responseType: 'arraybuffer' });
      console.log('Response:', res);

      // Check if response is valid
      if (!res.data) {
        console.error('Empty response received.');
        return;
      }

      // Create a Blob object from the array buffer data
      const blob = new Blob([res.data], { type: 'application/zip' });

      // Create a Blob URL
      const url = window.URL.createObjectURL(blob);
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      const timestamp = `TIFF_${day}${month}${year}_${hours}${minutes}${seconds}`;
      console.log(timestamp);
      const filename = `${timestamp}.zip`;
      console.log(filename)
      // Create a temporary link and initiate the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Set desired filename here
      document.body.appendChild(link);
      link.click();
      // Clean up
      window.URL.revokeObjectURL(url);
      setTags([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false); // Set loading state back to false
    }
  };

  return (
    <Flex flexDir='row'>
      <SideNav />
      <Flex w='100%' align='center' flexDir='column' p='1%' ml='30vh'>
        {success && (
          <Alert status="success" w="50vh" mt={2}>
            <AlertIcon />
            File downloaded successfully.
          </Alert>
        )}
        <Heading size='lg' color='gray.400'>PDF to TIF</Heading>
        <Flex flexWrap="wrap" w='50vh' mt='2vh'>
          <Heading fontSize='18px' fontWeight='500' color='gray.300' mr={3}>AWB numbers:</Heading>
          {tags.map((tag, index) => (
            <Tag key={index} mr={2} mb={2} size="md" variant="solid" colorScheme="teal">
              <TagLabel>{tag}</TagLabel>
              <TagCloseButton onClick={() => handleTagRemove(tag)} />
            </Tag>
          ))}
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
          <Flex flexDir='row' justifyContent='flex-end' gap={2} mt={1} w='50vh'>
            <Button onClick={handleResetAll}>Reset All</Button>
            {tags.length === 0 ?
              (<Tooltip label='Please enter one or more AWB'>
                <Button colorScheme='teal' isDisabled='true'><FaBan color='red' /></Button>
              </Tooltip>) :
              (<Button colorScheme='teal' isLoading={loading} onClick={handleSubmit}>{loading ? <Spinner size='sm' color='white' /> : 'Convert'}</Button>)}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default PDFtotifPage;
