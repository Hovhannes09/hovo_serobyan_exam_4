import jwt from 'jsonwebtoken';
import HttpErrors from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

import sendEmail from '../services/email.js';

const {
	TOKEN_SECRET,
	BACKEND_HOST,
} = process.env;

import Users from '../models/Users.js'

export default {
	async login(req, res, next) {
		try {
			const { email, password } = req.body;

			const user = await Users.findOne({
				where: {email},
			});

			if (!user || (user.password !== Users.hashPassword(password))) {
				throw new HttpErrors(401, {
					errors: {
						email: "Invalid email or password",
					}
				});
			}

			if (user.status !== 'active') {
				throw new HttpErrors(401, {
					errors: {
						email: "Please activate your email address",
					}
				});
			}

			const token = jwt.sign(
				{ userId: user.id },
				TOKEN_SECRET,
				{ expiresIn: "24h" },
			);

			delete user.password;

			res.json({
				token,
				user,
			});
		} catch (e) {
			next(e);
		}
	},

	  async register(req, res, next) {
    try {
      const { name, email, password, age } = req.body;

      if (await Users.findOne({ where: { email } })) {
        throw new HttpErrors(422, {
          errors: {
            email: 'Email is already in use!',
          },
        });
      }

      const activationToken = uuidv4();

      const user = await Users.create({
        name,
        email,
        password: Users.hashPassword(password),
        age,
        activationToken,
      });

      await sendEmail({
        to: email,
        subject: 'Please activate your new account!',
        template: 'register',
        data: {
          link: `${BACKEND_HOST}/users/activate/${activationToken}`,
        },
        attachments: [
          {
            filename: "kuku.png",
            href: `${BACKEND_HOST}/media/4.png`,
          },
        ]
      })

      delete user.password;

      res.json({
        message: 'User registered successfully, pls activate your email address!',
      });
    } catch (e) {
      next(e);
    }
  },

	async activateAccount(req, res, next) {
    try {
      const { activationToken } = req.params;

      const user = await Users.findOne({
        where: { activationToken },
      });

      if (user) {
        await user.update({
          status: 'active',
          activationToken: null,
        })
      } else {
        throw new HttpErrors(401, {
          errors: {
            activationToken: "Invalid activation token!",
          }
        });
      }

      res.json({
        message: 'Activation successfully activated!',
      });
    } catch (e) {
      next(e);
    }
  },

	  async profile(req, res, next) {
    try {
      const user = await Users.findByPk(
        req.userId,
      );

      delete user.password;
      res.json({
        user,
      });
    } catch (e) {
      next(e);
    }
  },
}

