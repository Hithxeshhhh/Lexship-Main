import NavItem from "../components/NavItem";
import avatar from "../assets/avatar1.png";
import logo from "../assets/lexship.png";
import { useState } from "react";
import { FaBox, FaBoxOpen, FaBoxTissue, FaCheckCircle, FaCloudUploadAlt, FaCreativeCommonsZero, FaDatabase, FaDropbox, FaHistory, FaLocationArrow, FaParachuteBox, FaProjectDiagram, FaSync, FaTimes, FaToggleOn, FaToolbox, FaUpload, FaUserPlus } from "react-icons/fa";
import { GrStatusGood } from "react-icons/gr";
import { MdLabelOutline } from "react-icons/md";
import { RiShutDownLine } from "react-icons/ri";
import { SiConvertio } from "react-icons/si";

import {
    Flex,
    Text,
    IconButton,
    Divider,
    Avatar,
    Heading,
    Image,
    Icon,
    Link,
    Box
} from '@chakra-ui/react';
import {
    FiMenu,
    FiHome,
    FiBriefcase,
    FiSettings,
    FiEdit,
} from 'react-icons/fi';

export default function Sidebar() {
    const logout = (event) => {
        event.preventDefault(); // Prevent the default link behavior
        localStorage.removeItem('token'); // Clear the token from local storage
        window.location.href = ''; // Redirect to login page
    };

    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const lastPart = pathParts.filter(part => part !== '').pop();
    const [navSize, changeNavSize] = useState("large");

    return (

        // redesigned sidebar with icons and links to different pages
        // the sidebar is collapsible and has a hover effecton the links
        // the sidebar also has a logout button at the bottom
        // the sidebar is designed to be responsive

        <Flex 
            pos="fixed"
            h='100vh'
            boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.3)"
            w={navSize === "small" ? "10vh" : "30vh"}
            transition='all ease 0.4s'
            flexDir="column"
            justifyContent="space-between"
            className="bg-gradient-to-b from-gray-800 to-black"
            borderRight="1px"
            borderColor="gray.800"
            overflow="auto"
            css={{
                "&::-webkit-scrollbar": {
                    display: "none", // Hide the scrollbar
                },
                "-ms-overflow-style": "none", // Hide scrollbar for IE and Edge
                "scrollbar-width": "none", // Hide scrollbar for Firefox
            }}
        >
            <Flex
                p="5%"
                flexDir="column"
                w="100%"
                alignItems={navSize === "small" ? "center" : "flex-start"}
                transition='all ease 0.4s'
                as="nav"
            >
                <Flex flexDir='row' justify={navSize === 'small' ? 'center' : 'space-between'} transition='all ease 0.4s' w='100%' align='center' mt='2'>
                    <Image src={logo} alt='Lexship' height='4vh' display={navSize === "small" ? "none" : "flex"} transition='all ease 0.4s' filter="brightness(0) invert(1)"/>
                    <IconButton
                        background="none"
                        color="gray.400"
                        _hover={{ background: 'gray.800', color: 'purple.400' }}
                        icon={<FiMenu />}
                        onClick={() => {
                            changeNavSize(navSize === "small" ? "large" : "small");
                        }}
                        transition='all ease 0.4s'
                        borderRadius="full"
                    />
                </Flex>
                
                <Box 
                    mt={8} 
                    p={4} 
                    borderRadius="xl" 
                    bg="gray.600" 
                    w={navSize === "small" ? "auto" : "100%"}
                    display="flex"
                    alignItems="center"
                    justifyContent={navSize === "small" ? "center" : "flex-start"}
                >
                    <Avatar 
                        size={navSize === 'small' ? 'sm' : 'md'} 
                        src={avatar} 
                        transition='all ease 0.1s' 
                        border="2px solid" 
                        borderColor="purple.400"
                    />
                    <Flex flexDir="column" ml={4} display={navSize === "small" ? "none" : "flex"} transition='all ease 0.4s'>
                        <Heading as="h1" size='sm' color="white">Hithesh</Heading>
                        <Text color="purple.300" fontSize="sm" fontWeight="medium">Admin</Text>
                    </Flex>
                </Box>
                
                <Box mt={6} w="100%">
                    <Text 
                        fontSize="xs" 
                        fontWeight="bold" 
                        textTransform="uppercase" 
                        color="gray.500" 
                        mb={2} 
                        pl={3}
                        display={navSize === "small" ? "none" : "block"}
                    >
                        Main Menu
                    </Text>
                    <NavItem navSize={navSize} icon={FiEdit} title="KYC Update" link='dashboard' active={lastPart === 'dashboard'} />
                    <NavItem navSize={navSize} icon={SiConvertio} title="PDF to TIF" link="pdftotif" active={lastPart === 'pdftotif'} />
                    <NavItem navSize={navSize} icon={MdLabelOutline} title="Relabel" link='relabel' active={lastPart === 'relabel'} />
                    <NavItem navSize={navSize} icon={GrStatusGood} title="Status Update" link='statusupdate' active={lastPart === 'statusupdate'} />
                    <NavItem navSize={navSize} icon={FaProjectDiagram} title="Lex Zoho Sync" link='lex-zoho-sync' active={lastPart === 'lex-zoho-sync'} />
                    <NavItem navSize={navSize} icon={FaLocationArrow} title="Tracking" link='tracking' active={lastPart === 'tracking'} />
                </Box>
                
                <Box mt={6} w="100%">
                    <Text 
                        fontSize="xs" 
                        fontWeight="bold" 
                        textTransform="uppercase" 
                        color="gray.500" 
                        mb={2} 
                        pl={3}
                        display={navSize === "small" ? "none" : "block"}
                    >
                        System
                    </Text>
                    <NavItem navSize={navSize} icon={FiSettings} title="Settings" link='settings' active={lastPart === 'settings'}/>
                    <NavItem navSize={navSize} icon={FiBriefcase} title="Reports"  link='sample' active={lastPart === 'sample'}/>
                    
                </Box>
                
                <Flex 
                    mt="auto" 
                    mb={4} 
                    w="100%" 
                    alignItems={navSize === "small" ? "center" : "flex-start"}
                >
                    <Link
                        borderRadius="lg"
                        onClick={logout}
                        color="red.200"
                        bg="rgba(254, 178, 178, 0.12)"
                        textDecor={'none'}
                        _hover={{textDecor:'none', bg: 'rgba(254, 178, 178, 0.2)'}}
                        fontWeight="500"
                        p={3}
                        w={navSize === "large" ? "100%" : "auto"}
                        display="flex"
                        alignItems="center"
                        justifyContent={navSize === "small" ? "center" : "flex-start"}
                    >
                        <Icon as={RiShutDownLine} fontSize="lg" />
                        <Text ml={3} display={navSize === "small" ? "none" : "flex"}>Logout</Text>
                    </Link>
                </Flex>
            </Flex>
        </Flex>
    );
}