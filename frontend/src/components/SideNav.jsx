import  { useState } from 'react'
import {
    Flex,
    Text,
    IconButton,
    Divider,
    Avatar,
    Heading,
    Image
} from '@chakra-ui/react'
import {
    FiMenu,
    FiHome,
    FiBriefcase,
    FiSettings
} from 'react-icons/fi'
import NavItem from '../components/NavItem'
import avatar from '../assets/avatar1.png'
import logo from '../assets/lexship.png'
import { FaHistory } from 'react-icons/fa'
import { SiConvertio } from 'react-icons/si'
import { MdLabelOutline } from 'react-icons/md'
import { GrStatusGood } from 'react-icons/gr'
export default function Sidebar() {
  const  currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const lastPart = pathParts.filter(part => part !== '').pop();
    const [navSize, changeNavSize] = useState("large")
    return (
        <Flex
            pos="fixed"
            h='100vh'
            boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
            background='gray.700'
            w={navSize == "small" ? "10vh" : "30vh"}
            transition='all ease 0.4s'
            flexDir="column"
            justifyContent="space-between"
        >
            <Flex
                p="5%"
                flexDir="column"
                w="100%"
                alignItems={navSize == "small" ? "center" : "flex-start"}
                transition='all ease 0.4s'
                as="nav"
            >
              <Flex flexDir='row' justify={navSize==='small'?'center':'space-between'} transition='all ease 0.4s' w='100%' align='center ' mt='2'>
              <Image src={logo} alt='Lexship' height='4vh' display={navSize == "small" ? "none" : "flex"} transition='all ease 0.4s'/>
                <IconButton
                    background="none"
                    _hover={{ background: 'none' }}
                    icon={<FiMenu />}
                    onClick={() => {
                      if (navSize == "small")
                        changeNavSize("large")
                      else
                      changeNavSize("small")
                  }}
                  transition='all ease 0.4s'
                  />
                  </Flex>
                <Flex mt={10} align="center">
                    <Avatar size={navSize==='small'?'sm':'lg'} src={avatar} transition='all ease 0.1s'/>
                    <Flex flexDir="column" ml={4} display={navSize == "small" ? "none" : "flex"} transition='all ease 0.4s'>
                        <Heading as="h1" size='sm' transition='all ease 0.4s'>Sarthak Bindal</Heading>
                        <Text color="gray" transition='all ease 0.4s'>Admin</Text>
                    </Flex>
                </Flex>
            <Divider display={navSize == "small" ? "none" : "flex"} mt='2vh' transition='all ease 0.4s'/>
                <NavItem navSize={navSize} icon={FiHome} title="Dashboard" link='dashboard' active={lastPart==='dashboard'?true:false}/>
                <NavItem navSize={navSize} icon={SiConvertio} title="PDF to TIF" link="pdftotif" active={lastPart==='pdftotif'?true:false}/>
                <NavItem navSize={navSize} icon={MdLabelOutline} title="Relabel" link='relabel' active={lastPart==='relabel'?true:false}/>
                <NavItem navSize={navSize} icon={GrStatusGood} title="Status Update" link='statusupdate'active={lastPart==='statusupdate'?true:false}/>
                <NavItem navSize={navSize} icon={FaHistory} title="History" />
                <NavItem navSize={navSize} icon={FiBriefcase} title="Reports" />
                <NavItem navSize={navSize} icon={FiSettings} title="Settings" />
            </Flex>
            <Flex
                p="5%"
                flexDir="column"
                w="100%"
                alignItems={navSize == "small" ? "center" : "flex-start"}
                transition='all ease 0.4s'
                mb={4}
            >
            </Flex>
        </Flex>
    )
}