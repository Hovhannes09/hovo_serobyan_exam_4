import express from 'express';
import usersRouter from './routes/users.js';
import postsRouter from './routes/posts.js';
import chatRouter from './routes/chat.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('feed');
});

export default app;