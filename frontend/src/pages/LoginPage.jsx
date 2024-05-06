import {  Input, FormControl, FormLabel,  Button, Grid, GridItem, Center, Tabs, TabList, Tab, TabPanels, TabPanel, ListItem, ListIcon, List, Flex } from '@chakra-ui/react';
import { Image } from '@chakra-ui/react'
import { BiHourglass, BiLabel, BiMessageSquareDots } from 'react-icons/bi';
import lexshipLogo from '../assets/lexship.png'
import { Link } from 'react-router-dom';
const LoginPage = () => {
    return (
        <Center>

            <Grid templateColumns='repeat(2, 1fr)'  mt='10'>
                <GridItem w='80vh' h='90vh' bgGradient='linear(to-l, blue.900, purple.800)' borderLeftRadius="10" p='10vh'>
                    <Flex direction='column' align='center'>

                        <Image src={lexshipLogo} alt='Lexship' height='12vh' />


                        <List spacing={20} mt='10vh' fontSize='20px'>
                            <ListItem>
                                <ListIcon as={BiHourglass} color='purple.500' fontSize='50px' />
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit
                            </ListItem>

                            <ListItem>
                                <ListIcon as={BiLabel} color='purple.600' fontSize='50px' />
                                Quidem, ipsam illum quis sed voluptatum quae eum fugit earum Quidem,
                            </ListItem>
                            <ListItem>
                                <ListIcon as={BiMessageSquareDots} color='purple.600' fontSize='50px' />
                                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempore excepturi hic
                            </ListItem>
                        </List>
                    </Flex>
                </GridItem>
                <GridItem w='80vh' h='90vh' bg='blue.900' borderRightRadius="10" pt='10vh'>
                    <Center>
                        <Tabs variant='soft-rounded' colorScheme='blue' w='70%' size='lg'>
                            <TabList >
                                <Tab>Login</Tab>
                                <Tab>Signup</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel pt='10vh'>
                                    <FormControl>
                                        <FormLabel>Email address</FormLabel>
                                        <Input placeholder='Email' type='email' />
                                        <FormLabel mt='2vh'>Password</FormLabel>
                                        <Input placeholder='Password' type='password' />
                                        <FormLabel mt='1vh'><Link href='#   ' isExternal>
                                            Forgot Password?
                                        </Link></FormLabel>
                                        <Button bg='blue.500' mt='6vh'>Submit</Button>
                                    </FormControl>
                                </TabPanel>
                                <TabPanel pt='10vh'>
                                    <FormControl>
                                        <FormLabel>Name</FormLabel>
                                        <Input placeholder='Full Name' type='text' />
                                        <FormLabel mt='2vh'>Email address</FormLabel>
                                        <Input placeholder='Email' type='email' />
                                        <FormLabel mt='2vh'>Password</FormLabel>
                                        <Input placeholder='Password' type='password' />
                                        <Button bg='blue.500' mt='6vh'>Submit</Button>
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
