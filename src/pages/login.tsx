import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { FaGoogle } from 'react-icons/fa';
import Head from 'next/head';

export default function Login() {
  return (
    <Flex flex={1} width="full" alignItems="center" justifyContent="center">
      <Head>Login | Summit</Head>
      <Box
        borderWidth={1}
        p={8}
        width="full"
        maxWidth={['380px', null, null, '430px', null]}
        borderRadius={4}
        textAlign="center"
        boxShadow="lg"
      >
        <Box my={2} textAlign="center">
          <Heading>Sign up</Heading>
          <Text mt={5}>
            Climb up your summit while getting help and building connections
            with fellow mountain treckers/climbers.
          </Text>
        </Box>
        <Box mt={6} textAlign="left">
          <Stack justifyContent="space-between">
            <Button
              leftIcon={<FaGoogle />}
              my={2}
              py={6}
              onClick={() => signIn('google', { callbackUrl: '/' })}
            >
              Login with Google
            </Button>
          </Stack>
        </Box>
      </Box>
    </Flex>
  );
}
