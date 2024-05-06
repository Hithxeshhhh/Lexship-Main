// import SideNav from '../components/SideNav
import { Flex, Heading } from '@chakra-ui/react'
import SideNav from '../components/SideNav'
const RelabelPage = () => {
  return (
     <Flex flexDir='row'>
      <SideNav/>
      <Flex  w='100%' align='center' flexDir='column' p='1%' ml='30vh'>
      <Heading size='lg' color='gray.400'>Relabel</Heading>
      </Flex>
     </Flex>
    
  )
}

export default RelabelPage