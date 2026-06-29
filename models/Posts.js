import { DataTypes, Model } from "sequelize";
import db from "../clients/db.sequelize.js";
import Users from "./Users.js";

class Posts extends Model {
  static async createDefault() {}
}

Posts.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    image: {
      type: DataTypes.STRING,
    },
    caption: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize: db,
    modelName: "posts",
    tableName: "posts",
    timestamps: true,
  },
);

Users.hasMany(Posts, { foreignKey: "userId", as: "posts" });
Posts.belongsTo(Users, { foreignKey: "userId", as: "author" });

export default Posts;
