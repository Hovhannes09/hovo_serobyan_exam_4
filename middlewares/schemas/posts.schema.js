import joi from "joi";

export default {
  create: joi.object({
    caption: joi.string().max(2000).allow("").optional(),
  }),

  comment: joi.object({
    text: joi.string().min(1).max(1000).required(),
  }),

  message: joi.object({
    to: joi.number().integer().required(),
    message: joi.string().min(1).max(2000).required(),
    postId: joi.number().integer().optional(),
  }),
};
