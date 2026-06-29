import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
	res.json({
		message: 'Welcome to the Post'
	});
});

router.post(
  '/', 
  authorization,                
  upload.single('image'),       
  validate(schemas.create),      
  createPost                    
);

router.post(
  '/:id/like',
  authorization,
  likePost,
);

router.post(
  '/:id/comment',
  authorization,
  validate(schema.comment),
  commentPost,
);

export default router;