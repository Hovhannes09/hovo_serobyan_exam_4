import { Router } from 'express';
import { validate } from 'uuid'

const router = Router();

router.post(
	'/send/message',
	validate(schema.message),
	sendMessage,
);

router.post(
	'messages/:formId',
	getMessages,
);

export default router;