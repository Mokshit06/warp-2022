import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { trpc } from '../../../utils/trpc';
import { io, type Socket } from 'socket.io-client';
import type { Message } from '@prisma/client';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Text,
} from '@chakra-ui/react';

export default function ChatPage() {
  const router = useRouter();
  const journeyId = router.query.id as string;
  const journey = trpc.journey.getJourney.useQuery(
    { id: journeyId },
    { enabled: !!journeyId }
  );

  const session = trpc.auth.getSession.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const trpcContext = trpc.useContext();
  const socketRef = useRef<Socket>();
  const messages = trpc.journey.getMessages.useQuery(
    { journey: journeyId },
    { enabled: !!journeyId, refetchOnMount: false, refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (!session.data || !session.data.user) return;

    const socket = io('/', {
      query: { id: session.data.user.id },
    });

    socketRef.current = socket;

    socket.emit('join', { journeyId });

    const handleReceiveMessage = (message: Message) => {
      trpcContext.journey.getMessages.setData(
        { journey: journeyId },
        messages => {
          return [...(messages ?? []), message];
        }
      );
    };

    socket.on('receive-message', handleReceiveMessage);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
    };
  }, [session]);

  return (
    <Flex flex={1} width="full" h="full">
      <Flex
        flexDir="column"
        flex={1}
        h="90vh"
        position="relative"
        overflowY="scroll"
        p="6"
      >
        <Box
          // bottom="0"
          // position="absolute"
          display="flex"
          w="100%"
          as="form"
          gap="2"
          onSubmit={e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const message = formData.get('message') as string;

            socketRef.current!.emit('send-message', { message });

            e.currentTarget.reset();
          }}
        >
          <Input name="message" placeholder="Type something..." size="lg" />
          <Button size="lg">Send</Button>
        </Box>
        <Box display="flex" w="full" mt="5" flexDir="column" gap="3">
          {messages.data?.map(message => (
            <Flex
              alignSelf={
                message.sentBy.id === session.data?.user?.id
                  ? 'flex-end'
                  : 'flex-start'
              }
              key={message.id}
              align="center"
              gap="3"
            >
              <Avatar
                name={message.sentBy.name ?? ''}
                src={message.sentBy.image ?? undefined}
                size="sm"
              />
              <Box px="5" rounded="md" py="3" bg="gray.700">
                <p>{message.content}</p>
              </Box>
            </Flex>
          ))}
        </Box>
      </Flex>
      <Box
        height="90vh"
        borderLeft="1px solid var(--chakra-colors-gray-700)"
        // h="full"
        py="3"
        px="6"
        minW="300px"
      >
        <Text my="2" fontSize="2xl" fontWeight="bold">
          Climbers
        </Text>
        <Flex flexDir="column" gap="4">
          {journey.data?.climbers?.map(climber => (
            <Flex
              gap="4"
              key={climber.id}
              p="3"
              border="1px solid var(--chakra-colors-gray-700)"
              rounded="md"
            >
              <Avatar
                name={climber.name ?? ''}
                src={climber.image ?? undefined}
                size="sm"
              />
              <Text fontSize="lg">{climber.name}</Text>
            </Flex>
          ))}
        </Flex>
      </Box>
    </Flex>
  );

  return (
    <div>
      {messages.data?.map(message => (
        <div key={message.id}>
          <p>{message.content}</p>
        </div>
      ))}
      <form
        onSubmit={e => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const message = formData.get('message') as string;

          socketRef.current!.emit('send-message', { message });

          e.currentTarget.reset();
        }}
      >
        <input name="message" />
      </form>
    </div>
  );
}
