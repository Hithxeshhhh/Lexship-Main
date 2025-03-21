import NavItem from "../components/NavItem";
import avatar from "../assets/avatar1.png";
import logo from "../assets/lexship.png";
import { useState } from "react";
import { FaHistory, FaLocationArrow } from "react-icons/fa";
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
    Link
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
        <Flex
            pos="fixed"
            h='100vh'
            boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
            background='black'
            w={navSize === "small" ? "10vh" : "30vh"}
            transition='all ease 0.4s'
            flexDir="column"
            justifyContent="space-between"
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
                    <Image src={logo} alt='Lexship' height='4vh' display={navSize === "small" ? "none" : "flex"} transition='all ease 0.4s' />
                    <IconButton
                        background="none"
                        _hover={{ background: 'none' }}
                        icon={<FiMenu />}
                        onClick={() => {
                            changeNavSize(navSize === "small" ? "large" : "small");
                        }}
                        transition='all ease 0.4s'
                    />
                </Flex>
                <Flex mt={10} align="center">
                    <Avatar size={navSize === 'small' ? 'sm' : 'lg'} src={avatar} transition='all ease 0.1s' />
                    <Flex flexDir="column" ml={4} display={navSize === "small" ? "none" : "flex"} transition='all ease 0.4s'>
                        <Heading as="h1" size='sm' transition='all ease 0.4s'>Hithesh</Heading>
                        <Text color="gray" transition='all ease 0.4s'>Admin</Text>
                    </Flex>
                </Flex>
                <Divider display={navSize === "small" ? "none" : "flex"} mt='2vh' transition='all ease 0.4s' />
                <NavItem navSize={navSize} icon={FiEdit} title="KYC Update" link='dashboard' active={lastPart === 'dashboard'} />
                <NavItem navSize={navSize} icon={SiConvertio} title="PDF to TIF" link="pdftotif" active={lastPart === 'pdftotif'} />
                <NavItem navSize={navSize} icon={MdLabelOutline} title="Relabel" link='relabel' active={lastPart === 'relabel'} />
                <NavItem navSize={navSize} icon={GrStatusGood} title="Status Update" link='statusupdate' active={lastPart === 'statusupdate'} />
                <NavItem navSize={navSize} icon={FaLocationArrow} title="Tracking" link='tracking' active={lastPart === 'tracking'} />
                <NavItem navSize={navSize} icon={FaHistory} title="History" />
                <NavItem navSize={navSize} icon={FiBriefcase} title="Reports" />
                <NavItem navSize={navSize} icon={FiSettings} title="Settings" />
                {/* Directly calling logout function */}
                <Divider display={navSize === "small" ? "none" : "flex"} mt='2vh' transition='all ease 0.4s' />
                <Flex mt={30} flexDir="column" w="100%" alignItems={navSize === "small" ? "center" : "flex-start"} >
                    <Link
                        backgroundColor="#F56565"
                        borderRadius={8}
                        onClick={logout}
                        color="white"
                        textDecor={'none'}
                        _hover={{textDecor:'none'}}
                        fontWeight="500"
                        p={3}
                        w={navSize === "large" ? "100%" : "auto"}
                    >
                        <Flex>
                            <Icon as={RiShutDownLine } fontSize="xl" color="white" />
                            <Text ml={5} display={navSize === "small" ? "none" : "flex"}>Logout</Text>
                        </Flex>
                    </Link>
                </Flex>
            </Flex>
        </Flex>
    );
}
