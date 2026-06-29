import joi from "joi";

export default {
  register: joi.object({
    username: joi.string().alphanum().required(),
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).max(32).required(),
  }),

  login: joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(4).max(32).required(),
  }),
};
