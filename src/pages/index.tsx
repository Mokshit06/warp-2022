import { type NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

export default function Home() {
  const session = useSession();
  const journeys = trpc.journey.listJourneys.useQuery();
  const router = useRouter();

  if (session.status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (!session.data?.user) return null;

  return (
    <Flex
      flex={1}
      p="4"
      // justifyContent="center"
      // alignItems="center"
      position="relative"
    >
      <Box maxH="100%" bg="blackAlpha.300" p="4" rounded="lg">
        <Flex
          mb="4"
          py="3"
          px="5"
          rounded="lg"
          gap="6"
          align="center"
          border="1px solid var(--chakra-colors-gray-700)"
        >
          <Avatar
            size="xl"
            name={session.data.user.name ?? ''}
            src={session.data.user.image ?? undefined}
          />
          <Box>
            <Text fontSize="3xl" fontWeight="semibold">
              {session.data.user.name}
            </Text>
            <Text color="gray.400">
              <strong>Score</strong>: 300
            </Text>
          </Box>
        </Flex>
        <Tabs isFitted>
          <TabList>
            <Tab>Followers</Tab>
            <Tab>Following</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <p></p>
            </TabPanel>
            <TabPanel>
              <p></p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <Box mx="10" mt="4" flex={1}>
        <Flex mb="5" justify="space-between">
          <Heading>Journeys</Heading>
          <Button
            size="md"
            onClick={() => {
              router.push('/journeys/create');
            }}
          >
            Start a journey!
          </Button>
        </Flex>
        <SimpleGrid gridTemplateColumns="repeat(3, 1fr)" gap="3">
          {journeys.data?.map(journey => (
            <Box
              key={journey.id}
              p="3"
              cursor="pointer"
              // bg="gray.700"
              w="100%"
              rounded="lg"
              border="1px solid var(--chakra-colors-gray-700)"
              onClick={() => {
                router.push(`/journeys/${journey.id}`);
              }}
            >
              <Box
                as="img"
                // src={url('mountain treck')}
                src={journey.image}
                rounded="lg"
                w="100%"
                objectFit="cover"
                objectPosition="center"
                h="25vh"
              />
              <Box mt="4">
                <Text lineHeight={1} fontSize="xl" fontWeight="semibold">
                  {journey.name}
                </Text>
                <Text lineHeight={1} color="gray.300" as="span" fontSize="sm">
                  {journey.from} - {journey.to}
                </Text>
                <Flex mt={1}>
                  <Text flex={1} color="gray.500">
                    Climbers: {journey._count.climbers}
                  </Text>
                  <Text flex={1} color="gray.500">
                    Duration: 170min
                  </Text>
                </Flex>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Flex>
  );
}
