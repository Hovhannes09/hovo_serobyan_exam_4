import HttpErrors from 'http-errors';

import Posts from '../models/Posts.js';
import Users from '../models/Users.js';
import Comments from '../models/Comments.js';
import '../models/Likes.js';

export default {
  async create(req, res, next) {
    try {
      if (!req.file) {
        throw new HttpErrors(400, {
          errors: {
            image: 'Image is required',
          },
        });
      }

      const post = await Posts.create({
        image: `/media/${req.file.filename}`,
        caption: req.body.caption,
        userId: req.userId,
      });

      res.json(post);
    } catch (e) {
      next(e);
    }
  },

  async feed(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const posts = await Posts.findAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Users,
            as: 'author',
            attributes: ['id', 'username', 'avatar'],
          },
          {
            model: Comments,
            as: 'comments',
          },
          {
            model: Users,
            as: 'likedBy',
            attributes: ['id'],
            through: {
              attributes: [],
            },
          },
        ],
      });

      const result = posts.map((post) => {
        const json = post.toJSON();

        json.likesCount = json.likedBy.length;
        delete json.likedBy;

        return json;
      });

      res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async like(req, res, next) {
    try {
      const post = await Posts.findByPk(req.params.id, {
        include: [
          {
            model: Users,
            as: 'likedBy',
            attributes: ['id'],
          },
        ],
      });

      if (!post) {
        throw new HttpErrors(404, {
          errors: {
            post: 'Post not found',
          },
        });
      }

      const alreadyLiked = post.likedBy.some(
        (user) => user.id === req.userId
      );

      if (alreadyLiked) {
        await post.removeLikedBy(req.userId);
      } else {
        await post.addLikedBy(req.userId);
      }

      const updatedPost = await Posts.findByPk(req.params.id, {
        include: [
          {
            model: Users,
            as: 'likedBy',
            attributes: ['id'],
          },
        ],
      });

      res.json({
        likesCount: updatedPost.likedBy.length,
      });
    } catch (e) {
      next(e);
    }
  },

  async comment(req, res, next) {
    try {
      const { text } = req.body;

      if (!text || !text.trim()) {
        throw new HttpErrors(422, {
          errors: {
            text: 'Text is required',
          },
        });
      }

      const post = await Posts.findByPk(req.params.id);

      if (!post) {
        throw new HttpErrors(404, {
          errors: {
            post: 'Post not found',
          },
        });
      }

      const comment = await Comments.create({
        text,
        userId: req.userId,
        postId: req.params.id,
      });

      res.json(comment);
    } catch (e) {
      next(e);
    }
  },
};