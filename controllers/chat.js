import { Op } from "sequelize";

import Socket from "../services/Socket.js";

import { Users, Messages } from "../models/index.js";

export default {
  async sendMessage(req, res, next) {
    try {
      const { to, message } = req.body;

      const messageData = await Messages.create({
        to,
        from: req.userId,
        message,
      });

      Socket.emit(`user_${to}`, messageData);

      res.json({
        status: 'ok',
      })
    } catch (e) {
      next(e)
    }
  },

	  async getMessages(req, res, next) {
    try {
      let { fromId } = req.params;

      fromId = fromId || req.userId;

      res.json({
        messages: await Messages.findAll({
          where: {
            [Op.or]: [
              { to: fromId, from: req.userId },
              { to: req.userId, from: fromId },
            ]
          },
          limit: 500,
          order: [['createdAt', 'DESC']]
        }),
      })
    } catch (e) {
      next(e)
    }
  },
}