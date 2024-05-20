import { useState} from 'react';
import {
  Flex, Heading, Input, Button, InputGroup, InputRightElement, Text, Grid, GridItem, Tag, TagLabel, TagCloseButton, Divider, Spinner, Alert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Select
} from '@chakra-ui/react';
import { FaArrowRight, FaCamera } from 'react-icons/fa';
import SideNav from '../components/SideNav';
import { labelData } from '../utils/data.json';
import instance from '../utils/AxiosInstance';
import BarcodeScanner from '../components/BarcodeScanner';

const Relabel = () => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);


  const handleResetAll = () => {
    setTags([]);
    setError('');
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log(provider)
      const selectedProvider = labelData.find(data => data.name === provider);
      console.log((selectedProvider))
      if (selectedProvider) {
        console.log(selectedProvider.api)
        // console.log(tags)
        const res = await instance.post(selectedProvider.api, {
          AWB: tags
        });
        console.log(res.data)
        if(res.data.Success.length===tags.length)
            setSuccess(true);
        setError('');
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
        <Heading size='lg' textAlign='center' color='gray.400'>Relabel</Heading>
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
              <InputRightElement > <Button onClick={handleEnter} >
                <FaArrowRight />
              </Button>
              </InputRightElement>
            }
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
                  <Heading size='sm' fontWeight={400} whiteSpace={'nowrap'}>Choose Provider:</Heading>
                  <Select placeholder='Select Type' onChange={handleProvider}>
                    {labelData.map((data, index) => (
                      <option key={index}>{data.name}</option>
                    ))}
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

        <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Scan Barcode</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <BarcodeScanner tags={tags}
                setTags={setTags}
                onClose={() => setIsScannerOpen(false)} />
              {tags.length > 0 && (

                <GridItem backgroundColor='gray.700' p={5} borderRadius='10'>
                  <Heading size='md' mb={3} textAlign='center'>Input AWBs : {tags.length}</Heading>
                  <Grid templateColumns='repeat(2, 1fr)' gap={1}  >
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
