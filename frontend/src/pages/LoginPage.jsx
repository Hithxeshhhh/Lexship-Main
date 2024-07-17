import { useState } from 'react';
import { Input, FormControl, FormLabel, Button, Grid, GridItem, Center, Tabs, TabList, Tab, TabPanels, TabPanel, ListItem, ListIcon, List, Flex } from '@chakra-ui/react';
import { Image } from '@chakra-ui/react';
import { BiHourglass, BiLabel, BiMessageSquareDots } from 'react-icons/bi';
import lexshipLogo from '../assets/lexship.png';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    let url = '';
    if (import.meta.env.VITE_ENV === 'prod') url = import.meta.env.VITE_BACKEND_PROD
    else if (import.meta.env.VITE_ENV === 'dev') url = import.meta.env.VITE_BACKEND_DEV
    else url = import.meta.env.VITE_BACKEND_LOCAL
    const handleLogin = async (event) => {
        event.preventDefault();

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
            localStorage.setItem('token', data.token); // Store token in local storage
            navigate('/dashboard'); // Redirect to a protected route
        } catch (error) {
            setError('Invalid username or password');
        }
    };
    return (
        <Center>
            <Grid templateColumns="repeat(2, 1fr)" mt="10">
                <GridItem w="80vh" h="90vh" bgGradient="linear(to-l, blue.900, purple.800)" borderLeftRadius="10" p="10vh">
                    <Flex direction="column" align="center">
                        <Image src={lexshipLogo} alt="Lexship" height="12vh" />
                        <List spacing={20} mt="10vh" fontSize="20px">
                            <ListItem>
                                <ListIcon as={BiHourglass} color="purple.500" fontSize="50px" />
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit
                            </ListItem>
                            <ListItem>
                                <ListIcon as={BiLabel} color="purple.600" fontSize="50px" />
                                Quidem, ipsam illum quis sed voluptatum quae eum fugit earum Quidem,
                            </ListItem>
                            <ListItem>
                                <ListIcon as={BiMessageSquareDots} color="purple.600" fontSize="50px" />
                                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempore excepturi hic
                            </ListItem>
                        </List>
                    </Flex>
                </GridItem>
                <GridItem w="80vh" h="90vh" bg="blue.900" borderRightRadius="10" pt="10vh">
                    <Center>
                        <Tabs variant="soft-rounded" colorScheme="blue" w="70%" size="lg">
                            <TabList>
                                <Tab>Login</Tab>
                                <Tab>Signup</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel pt="10vh">
                                    <form onSubmit={handleLogin}>
                                        <FormControl>
                                            <FormLabel>Username</FormLabel>
                                            <Input name="username" placeholder="Username" type="text" required />
                                            <FormLabel mt="2vh">Password</FormLabel>
                                            <Input name="password" placeholder="Password" type="password" required />
                                            {error && <p style={{ color: 'red' }}>{error}</p>}
                                            <FormLabel mt="1vh"><Link to="#">Forgot Password?</Link></FormLabel>
                                            <Button bg="blue.500" mt="6vh" type="submit">Submit</Button>
                                        </FormControl>
                                    </form>
                                </TabPanel>
                                <TabPanel pt="10vh">
                                    <FormControl>
                                        <FormLabel>Name</FormLabel>
                                        <Input placeholder="Full Name" type="text" />
                                        <FormLabel mt="2vh">Email address</FormLabel>
                                        <Input placeholder="Email" type="email" />
                                        <FormLabel mt="2vh">Password</FormLabel>
                                        <Input placeholder="Password" type="password" />
                                        <Button bg="blue.500" mt="6vh">Submit</Button>
                                    </FormControl>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </Center>
                </GridItem>
            </Grid>
        </Center>
    );
}

export default LoginPage;
