import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Spacer,
} from '@chakra-ui/react';
import { signOut } from 'next-auth/react';
import React from 'react';
import { trpc } from '../utils/trpc';
import { NextChakraLink } from './link';

function MenuItem({
  children,
  href,
}: React.PropsWithChildren<{ href: string }>) {
  return (
    <NextChakraLink href={href} mx={[0, 0, 6]} my={[2, 2, 0]} display="block">
      {children}
    </NextChakraLink>
  );
}

function Header() {
  const session = trpc.auth.getSession.useQuery();

  return (
    <Flex
      as="nav"
      align="center"
      wrap="wrap"
      padding="0rem 1.5rem"
      zIndex={1000}
      boxShadow="md"
    >
      <Flex align="center" mr={5}>
        <Box as="img" src="/summit-logo.png" height="70px" width="70px" />
        <Heading mb={{ base: 3, sm: 0 }} as="h1" size="md">
          Summit
        </Heading>
      </Flex>

      <Spacer />

      <Box
        display="flex"
        width={{ md: 'auto', base: 'full' }}
        alignItems="center"
      >
        <MenuItem href="/">Home</MenuItem>
        {session.data?.user ? (
          <Button onClick={() => signOut()}>Logout</Button>
        ) : (
          <MenuItem href="/login">Login</MenuItem>
        )}
      </Box>
    </Flex>
  );
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <Flex minH="100vh" flexDirection="column">
      <Header />
      {children}
    </Flex>
  );
}
