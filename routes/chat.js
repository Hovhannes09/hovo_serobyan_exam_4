import { Router } from 'express';
import validation from '../middlewares/validation.js';
import authorization from '../middlewares/authorization.js';

import controller from '../controllers/chat.js';

const router = Router();

router.post(
  '/send/message',
  authorization,
  controller.sendMessage,
);

router.get(
  '/messages/:fromId',
  authorization,
  controller.getMessages,
);

export default router;