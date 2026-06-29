import { DataTypes, Model } from "sequelize";

import db from "../clients/db.sequelize.js";
import Users from "./Users.js";
import Posts from "./Posts.js";

class Comments extends Model {}

Comments.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: "comments",
    tableName: "comments",
    timestamps: true,
  },
);

Posts.hasMany(Comments, { foreignKey: "postId", as: "comments" });
Comments.belongsTo(Posts, { foreignKey: "postId" });
Comments.belongsTo(Users, { foreignKey: "userId", as: "author" });

export default Comments;
