import { DataTypes, Model } from "sequelize";

import db from "../clients/db.sequelize.js";
import Users from "./Users.js";
import Posts from "./Posts.js";

class Likes extends Model {}

Likes.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    postId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "posts",
        key: "id",
      },
    },
  },
  {
    sequelize: db,
    modelName: "likes",
    tableName: "likes",
    timestamps: true,
  },
);

Users.belongsToMany(Posts, {
  through: Likes,
  as: "likedPosts",
  foreignKey: "userId",
  otherKey: "postId",
});

Posts.belongsToMany(Users, {
  through: Likes,
  as: "likedBy",
  foreignKey: "postId",
  otherKey: "userId",
});

export default Likes;
