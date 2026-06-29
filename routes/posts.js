import { Router } from 'express';
import authorization from '../middlewares/authorization.js';
import upload from '../middlewares/upload.js';
import validation from '../middlewares/validation.js';
import schemas from '../middlewares/schemas/posts.schema.js';

import controller from '../controllers/posts.js'

const router = Router();

router.get('/', controller.feed);

router.post(
  '/',
  authorization,
  upload.single('image'),
  validation(schemas.create),
  controller.create
);

router.post(
  '/:id/like',
  authorization,
  controller.like
);

router.post(
  '/:id/comment',
  authorization,
  validation(schemas.comment),
  controller.comment
);

export default router;