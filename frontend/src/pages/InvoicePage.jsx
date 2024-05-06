// import SideNav from '../components/SideNav
import { Flex, Heading } from '@chakra-ui/react'
import SideNav from '../components/SideNav'
const InvoicePage = () => {
  return (
     <Flex flexDir='row'>
      <SideNav/>
      <Flex  w='100%' align='center' flexDir='column' p='1%' ml='30vh'>
      <Heading size='lg' color='gray.400'>Invoices</Heading>
      </Flex>
     </Flex>
    
  )
}

export default InvoicePage