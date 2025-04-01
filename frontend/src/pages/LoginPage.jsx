import lexshipLogo from "../assets/lexship.png";
import logo from "../assets/lexship.png";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Text,
  Box,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
  useColorModeValue,
  HStack,
  Image,
  Icon,
  Heading,
  Center,
} from "@chakra-ui/react";
import { 
  BiShow, 
  BiHide, 
  BiLogoGoogle, 
  BiLogoApple, 
  BiLogoFacebook 
} from "react-icons/bi";

const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  let url = '';
  if (import.meta.env.VITE_ENV === 'prod') url = import.meta.env.VITE_BACKEND_PROD
  else if (import.meta.env.VITE_ENV === 'dev') url = import.meta.env.VITE_BACKEND_DEV
  else url = import.meta.env.VITE_BACKEND_LOCAL

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const username = event.target.username.value;
    const password = event.target.password.value;

    try {
      const response = await fetch(`${url}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  // Color schemes
  const bgColor = "#111111";
  const formBgColor = "#222222";
  const textColor = "#FFFFFF";
  const purpleAccent = "#BA8CFF";
  const inputBgColor = "rgba(255, 255, 255, 0.05)";
  
  // Social login button
  const SocialButton = ({ icon, color }) => (
    <Center
      w="40px"
      h="40px"
      borderRadius="full"
      bg="transparent"
      cursor="pointer"
      _hover={{ opacity: 0.8 }}
    >
      <Icon as={icon} fontSize="24px" color={color} />
    </Center>
  );

  return (

    // Redesigned the login page for more flexibility and customization
    // Added a purple gradient background and a logo at the top
    // Added a blur effect to the background gradient
    // Added a custom error message box
    // Added social login buttons
    <Box 
      minH="100vh" 
      bg={bgColor}
      py={0}
      px={0}
      color={textColor}
      position="relative"
      overflow="hidden"
    >
      {/* Purple gradient left */}
      <Box
        position="absolute"
        left="10%"
        bottom="0"
        width="40%"
        height="50%"
        background="radial-gradient(circle, rgba(186,140,255,0.4) 0%, rgba(186,140,255,0) 70%)"
        filter="blur(60px)"
        zIndex="0"
      />
      
      {/* Purple gradient right */}
      <Box
        position="absolute"
        right="10%"
        bottom="0"
        width="40%"
        height="50%"
        background="radial-gradient(circle, rgba(186,140,255,0.4) 0%, rgba(186,140,255,0) 70%)"
        filter="blur(60px)"
        zIndex="0"
      />

      {/* Logo text at top */}
      <Box pt={8} pb={4} textAlign="center">
        <Heading fontSize="2xl" fontWeight="bold">
        </Heading>
      </Box>

      {/* Login Form Card */}
      <Center zIndex="1" position="relative">
        <Box
          bg={formBgColor}
          borderRadius="xl"
          maxW="450px"
          w="full"
          mx={4}
          p={10}
          boxShadow="lg"
        >
          <Box textAlign="center" mb={8}>
            <Image 
              src={logo} 
              alt='Lexship' 
              height='40px' 
              display="flex" 
              transition='all ease 0.4s' 
              objectFit="contain"
              my={6}
              mx="auto"
            />
          </Box>

          {/* Error message */}
          {error && (
            <Box 
              bg="rgba(255, 59, 48, 0.2)"
              color="red.300" 
              px={4} 
              py={3} 
              rounded="md" 
              fontSize="sm"
              fontWeight="medium"
              mb={6}
              borderLeft="3px solid red.500"
              animation="fadeIn 0.3s ease"
              sx={{
                "@keyframes fadeIn": {
                  "0%": { opacity: 0, transform: "translateY(-10px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" }
                }
              }}
            >
              {error}
            </Box>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin}>
            <FormControl mb={6}>
              <FormLabel fontSize="sm" color="gray.400">
                Username
              </FormLabel>
              <Input 
                name="username" 
                placeholder="Enter Username" 
                _placeholder={{ color: "gray.500" }}
                focusBorderColor={purpleAccent}
                borderWidth="1px"
                borderColor="transparent"
                bg={inputBgColor}
                size="lg"
                height="52px"
                fontSize="md"
                borderRadius="lg"
                _hover={{
                  borderColor: "gray.700",
                }}
                required
              />
            </FormControl>

            <FormControl mb={2}>
              <FormLabel fontSize="sm" color="gray.400">
                Password
              </FormLabel>
              <InputGroup size="lg">
                <Input 
                  name="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  _placeholder={{ color: "gray.500" }}
                  focusBorderColor={purpleAccent}
                  borderWidth="1px"
                  borderColor="transparent"
                  bg={inputBgColor}
                  size="lg"
                  height="52px"
                  fontSize="md"
                  borderRadius="lg"
                  color={"white"}
                  _hover={{
                    borderColor: "gray.700",
                  }}
                  required
                />
                <InputRightElement h="full" pr={2}>
                  <Box 
                    cursor="pointer" 
                    color="gray.400"
                    onClick={() => setShowPassword(!showPassword)}
                    _hover={{ color: "gray.200" }}
                    transition="all 0.2s"
                  >
                    {showPassword ? <BiHide size="20px" /> : <BiShow size="20px" />}
                  </Box>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {/* Forgot password */}
            <Flex justify="flex-end" mb={6}>
              <Link>
                <Text 
                  color={purpleAccent}
                  fontSize="sm" 
                  fontWeight="medium"
                  _hover={{ opacity: 0.8 }}
                >
                  Forgot password?
                </Text>
              </Link>
            </Flex>

            {/* Sign in button */}
            <Button
              bg={purpleAccent}
              color="black"
              size="lg"
              w="full"
              type="submit"
              isLoading={isLoading}
              loadingText="Signing in"
              spinner={<Spinner size="sm" />}
              disabled={isLoading}
              height="52px"
              borderRadius="full"
              fontWeight="medium"
              _hover={{ 
                opacity: 0.9
              }}
              mb={6}
            >
              Login
            </Button>
          </form>

          {/* Social login options */}
          {/* Implement this in the future if necessary */}
          <Flex justify="center" gap={20} mb={6}>
            <SocialButton icon={BiLogoFacebook} color="#1877F2" />
            <SocialButton icon={BiLogoApple} color="#FFFFFF" />
            <SocialButton icon={BiLogoGoogle} color="#DB4437" />
          </Flex>

          {/* Register link */}
          <Box textAlign="center">
            <Text color="gray.400" fontSize="sm" display="inline">
              Don't have an account? {" "}
            </Text>
            <Link>
              <Text 
                color={purpleAccent} 
                fontWeight="medium"
                fontSize="sm"
                display="inline"
                _hover={{ opacity: 0.8 }}
              >
                Sign up
              </Text>
            </Link>
          </Box>
        </Box>
      </Center>
    </Box>
  );
};

export default LoginPage;