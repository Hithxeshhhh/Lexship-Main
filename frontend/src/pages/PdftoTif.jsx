import { useState, useRef } from 'react';
import { Flex, Heading, Image, IconButton } from '@chakra-ui/react';
import SideNav from '../components/SideNav';
import { Button } from '@chakra-ui/react';
import { MdOutlineFileUpload, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import pdfLogo from '../assets/pdf-logo.png'; // Import PDF logo image
import axios from 'axios';

const PDFtotifPage = () => {
  const [files, setFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploaded, setUploaded] = useState(false)
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const fileList = event.target.files;
    setFiles([...files, ...fileList]);
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    // Handle file upload logic here (e.g., send files to server)
    if (files.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('pdfs', files[i]);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/v1/upload', formData);

      console.log('Files uploaded successfully:', response.data);
      alert('Files uploaded successfully!');
      setUploaded(true)

    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? files.length - 1 : prevIndex - 1));
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === files.length - 1 ? 0 : prevIndex + 1));
  };

  const handleConvert = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/v1/convert');
      console.log('Conversion successful:', response.data);
      alert('Conversion successful!');
    } catch (error) {
      console.error('Error converting file:', error);
    }
    setFiles([]);
  };

  return (
    <Flex flexDir='row'>
      <SideNav />
      <Flex w='100%' align='center' flexDir='column' p='1%' ml='30vh' >
        <Heading size='lg' color='gray.400'>
          PDF to TIF
        </Heading>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          multiple
        />
        <Button onClick={handleUploadButtonClick} colorScheme='teal' mt='3vh'>
          <MdOutlineFileUpload />
          Upload
        </Button>
        {/* Display uploaded files */}
        {files.length > 0 &&
          <Flex mt="3vh" alignItems="center" border='2px solid black' padding='2%' background='gray.700' >
            <IconButton
              icon={<MdChevronLeft />}
              onClick={handlePrevClick}
              aria-label="Previous"
              disabled={files.length <= 1}
              mr="2"
            />
            {files.slice(currentIndex, currentIndex + 8).map((file, index) => (
              <Flex flexDir='column' key={index} mr="2" mb="2" justify='center' align='center'>
                <Image
                  src={file.type === 'application/pdf' ? pdfLogo : URL.createObjectURL(file)}
                  boxSize="80px"
                  objectFit="contain"
                />
                {files.length > 0 && (
                  <span
                    style={{
                      maxWidth: '100px', // Adjust the maximum width as needed
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {files[currentIndex].name}
                  </span>
                )}
              </Flex>
            ))}

            <IconButton
              icon={<MdChevronRight />}
              onClick={handleNextClick}
              aria-label="Next"
              disabled={files.length <= 1}
              ml="2"
            />
          </Flex>}
        {files.length > 0 &&
          <Button onClick={handleUpload} colorScheme='teal' mt='3vh' disabled={files.length === 0}>
            Upload {files.length} files
          </Button>
        }
        {
          uploaded && (
            <Button onClick={handleConvert} colorScheme='teal' mt='3vh' disabled={files.length === 0}>
              Convert {files.length} files
            </Button>
          )
        }
      </Flex>

    </Flex>

  );
};

export default PDFtotifPage;
