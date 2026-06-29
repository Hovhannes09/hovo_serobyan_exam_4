import express from 'express';
import usersRouter from './users.js';
import postsRouter from './posts.js';
import chatRouter from './chat.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('feed');
});

export default app;