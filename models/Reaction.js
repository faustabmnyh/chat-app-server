"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Reaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Message }) {
      // define association here
      // one to many, meaning that user can have multiple reactions , but reactions only belongs to one user
      this.belongsTo(Message, { foreignKey: "messageId" });
      this.belongsTo(User, { foreignKey: "userId" }); // this by default is actually will add , fetching the userId fields base on the value
    }
  }
  Reaction.init(
    {
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      messageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Reaction",
      tableName: "reactions",
    }
  );
  return Reaction;
};
