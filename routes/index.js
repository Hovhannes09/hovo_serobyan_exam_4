import { Router } from 'express';

import usersRouter from './users.js';
import postsRouter from './posts.js';
import chatRouter from './chat.js';

const router = Router();

router.get('/', (req, res) => {
  res.render('feed');
});

router.use('/users', usersRouter);
router.use('/posts', postsRouter);
router.use('/api/chat', chatRouter);

export default router;