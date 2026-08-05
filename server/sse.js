import { Router } from 'express';

const router = Router();
let clients = [];

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Add this client to the list
  clients.push(res);

  // When connection closes, remove client
  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

export const broadcast = (type, data) => {
  clients.forEach(client => {
    client.write(`event: data_updated\ndata: ${JSON.stringify({ type, ...data })}\n\n`);
  });
};

export default router;
