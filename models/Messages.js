import { DataTypes, Model } from "sequelize";

import db from "../clients/db.sequelize.js";
import Users from "./Users.js";

class Messages extends Model {}

Messages.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    from: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    to: {
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
    modelName: "messages",
    tableName: "messages",
    timestamps: true,
  },
);

Messages.belongsTo(Users, { foreignKey: "from", as: "sender" });
Messages.belongsTo(Users, { foreignKey: "to", as: "receiver" });

export default Messages;
