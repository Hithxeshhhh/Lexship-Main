import {
    Flex,
    Text,
    Icon,
    Link,
    Menu,
    MenuButton,
    Box,
    Tooltip
} from '@chakra-ui/react'

export default function NavItem({ icon, title, link, active, navSize }) {
    const destinationLink = '/' + link
    return (
        <Tooltip 
            label={title} 
            placement="right" 
            isDisabled={navSize !== "small"}
            hasArrow
            bg="gray.700"
            color="white"
        >
            <Flex
                mt={2}
                mb={2}
                flexDir="column"
                w="100%"
                alignItems={navSize == "small" ? "center" : "flex-start"}
            >
                <Menu placement="right">
                    <Link
                        backgroundColor={active ? "rgba(146, 109, 222, 0.2)" : "transparent"}
                        color={active ? "purple.300" : "gray.400"}
                        fontWeight={active ? "600" : "normal"}
                        p={3}
                        borderRadius="lg"
                        _hover={{ 
                            textDecor: 'none', 
                            backgroundColor: active ? "rgba(146, 109, 222, 0.3)" : "gray.800",
                            color: active ? "purple.200" : "gray.200"
                        }}
                        w={navSize == "large" && "100%"}
                        href={destinationLink}
                        transition="all 0.2s"
                    >
                        <MenuButton w="100%">
                            <Flex alignItems="center">
                                <Box
                                    borderRadius="md"
                                    p={1.5}
                                    bg={active ? "rgba(146, 109, 222, 0.25)" : "transparent"}
                                >
                                    <Icon 
                                        as={icon} 
                                        fontSize="md" 
                                        color={active ? "purple.300" : "gray.400"} 
                                    />
                                </Box>
                                <Text 
                                    ml={3} 
                                    display={navSize == "small" ? "none" : "flex"}
                                    fontSize="md"
                                >
                                    {title}
                                </Text>
                                {active && navSize == "large" && (
                                    <Box 
                                        w="4px" 
                                        h="24px" 
                                        bg="purple.400" 
                                        position="absolute"
                                        left={0}
                                        borderRadius="0 4px 4px 0"
                                    />
                                )}
                            </Flex>
                        </MenuButton>
                    </Link>
                </Menu>
            </Flex>
        </Tooltip>
    )
}