import { Router } from "express"
import upload from "../middlewares/upload.js"

import controller from '../controllers/users.js'

import authorization from "../middlewares/authorization.js"
import schema from "../middlewares/schemas/users.schema.js"
import validation from "../middlewares/validation.js"

const router = Router();

router.post(
  "/register",
  validation(schema.register, "body"),
  controller.register,
);

router.post(
  '/login',
  validation(schema.login, 'body'),
  controller.login,
);

router.get(
  '/activate/:activationToken',
  controller.activateAccount,
);

router.get(
	'/profile',
	authorization,
	controller.profile,	
);

router.post('/avater', upload.single('file'), function (req, res, next) {
  try {
    console.log(req.file)
    console.log(req.body)
    res.json({
      status: 'ok',
    })
  } catch (e) {
    next(e);
  }
});

export default router;