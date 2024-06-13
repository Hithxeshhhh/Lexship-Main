import { useState } from 'react';
import { Flex, Heading, Input, Button, InputGroup, InputRightElement, Text, Select, Grid, GridItem, Tag, TagLabel, TagCloseButton, Divider, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import SideNav from '../components/SideNav';
import { FaArrowRight } from 'react-icons/fa';
import { statusData } from '../utils/data.json'
import instance from '../utils/AxiosInstance'
const StatusUpdatePage = () => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [status, sethandleStatus] = useState('')
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false);
  const handleResetAll =()=>{
    setTags([]);
    setError('')
  }
  const handleStatus = (e) => {
    sethandleStatus(e.target.value);
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
  const handleSubmit = async () => {
    if (!status) {
      setError('Please select status');
      return;
    }
    if (!date) {
      setError('Please enter date')
      return;
    }
    if (!time) {
      setError('Please enter time')
      return;
    }
    try {
      setLoading(true);
      const data = statusData.find(item => item.value === status);
      console.log(data.code, date, time)
      console.log(`${import.meta.env.VITE_LEX_API_BASE}/api/awb/status/update?statusCode=${data.code}&CreatedDate=${date}&CreatedTime=${time}`)
      const res = await instance.post(
        `${import.meta.env.VITE_LEX_API_BASE}/api/awb/status/update?statusCode=${data.code}&CreatedDate=${date}&CreatedTime=${time}`,
        {
          AWBs: tags,
        }
      );
      console.log(res.data)
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 6000)
      // console.log(res.data)  
    }
    catch (err) { console.error('Error:', err); }
    finally { setLoading(false); }
  };
  const currentDate = new Date().toISOString().split('T')[0];
  return (

    <Flex flexDir='row'>
      <SideNav />
      <Flex w='100%' align='center' flexDir='column' p='1%' ml='30vh'>
        {success && (
          <Alert status="success" w="50vh" mt={2}>
            <AlertIcon />
            Status updated successfully.
          </Alert>
        )}
        <Heading size='lg' textAlign='center' color='gray.400'>Status Update</Heading>
        <Flex flexWrap='wrap' w='70vh' mt='2vh'>
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
              border={'1px'}
              borderColor={error ? "red.300" : "gray.600"}
            />
            <InputRightElement>
              <Button onClick={handleEnter}>
                <FaArrowRight />
              </Button>
            </InputRightElement>
          </InputGroup>
          {error && <Text color="red.500" fontSize="sm">{error}</Text>}
        </Flex>
        <Flex w='100%' flexDir='col' p={3} justifyContent='center' alignItems='center' mt={5}>
          <Grid templateColumns='repeat(1,1fr)' gap={9} w='100%' >
            {(tags.length !== 0) &&
              <GridItem backgroundColor='gray.700' p={5} borderRadius='10'>
                <Heading size='md' mb={3} textAlign='center'>Input AWBs : {tags.length}</Heading>
                <Grid templateColumns='repeat(6, 1fr)' gap={1}  >
                  {tags.map((tag, index) => (
                    <Tag key={index} mr={2} mb={2} justifyContent='space-between' size="md" variant="solid" colorScheme="teal">
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleTagRemove(tag)} />
                    </Tag>
                  ))}
                </Grid>
                <Divider />
                <Flex flexDir='row' mt={5} gap={5} alignItems={'center'} >
                  <Heading size='sm' fontWeight={400}>Status:</Heading>
                  <Select placeholder='Select Type' onChange={handleStatus}>
                    {statusData.map((data, index) => (
                      <option key={index}>{data.value}</option>
                    ))}
                  </Select>
                </Flex>
                <Flex flexDir='row' mt={5} gap={5} alignItems={'center'}>
                  <Heading size='sm' fontWeight={400} mr={2}>Date:</Heading>
                  <Input
                    placeholder='Select Date'
                    type='date'
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={currentDate}
                  />
                  <Heading size='sm' fontWeight={400}>Time:</Heading>
                  <Input
                    placeholder='Select Time'
                    type='time'
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </Flex>
                <Flex alignItems={'center'} justifyContent={'center'} mt={10} gap={5}>
                <Button onClick={handleResetAll}>Reset All</Button>
                  {(<Button colorScheme='teal' isLoading={loading} onClick={handleSubmit}>{loading ? <Spinner size='sm' color='white' /> : 'Submit Status'}</Button>)}
                </Flex>
              </GridItem>
            }
          </Grid>
        </Flex>
      </Flex>
    </Flex>
  );
};
export default StatusUpdatePage;
