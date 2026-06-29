import { DataTypes, Model } from "sequelize";
import md5 from "md5";

import db from "../clients/db.sequelize.js";

class Users extends Model {
  static async createDefaults() {}

  static hashPassword(password) {
    return md5(md5(password) + "hello");
  }
}

Users.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "This username is already taken.",
      },
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    avatar: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    activationToken: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: db,
    modelName: "users",
    tableName: "users",
    timestamps: true,
  },
);

export default Users;
