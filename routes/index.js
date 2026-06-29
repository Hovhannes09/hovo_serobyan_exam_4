import { Router } from 'express';

import usersRouter from './users.js';
import postsRouter from './posts.js';
import chatRouter  from './chat.js';

const router = Router();

router.get('/', (req, res) => {
  res.render('feed', { title: 'Лента — Instagram' });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Войти — Instagram' });
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'Регистрация — Instagram' });
});

router.get('/chat', (req, res) => {
  res.render('chat', { title: 'Чат — Instagram' });
});

router.use('/users', usersRouter);
router.use('/posts', postsRouter);
router.use('/api/chat', chatRouter);

export default router;