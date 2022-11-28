import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const prisma = new PrismaClient({
  log: ['error'],
});

const app = next({ dev, hostname, port, dir: process.cwd() });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const parsedUrl = parse(req.url!, true);
      const { pathname, query } = parsedUrl;

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, () => {
    // if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  const io = new Server(server);

  io.on('connection', async socket => {
    const id = socket.handshake.query.id as string;

    socket.on('join', (joinInput: { journeyId: string }) => {
      socket.join(joinInput.journeyId);
      console.log('JOINING');

      socket.on('send-message', async (messageInput: { message: string }) => {
        const message = await prisma.message.create({
          data: {
            content: messageInput.message,
            createdAt: new Date(),
            journeyId: joinInput.journeyId,
            userId: id,
          },
          include: {
            sentBy: true,
          },
        });

        console.log('RECEIVED EVENT');

        io.to(joinInput.journeyId).emit('receive-message', message);
      });
    });
  });
});
