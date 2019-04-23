const moment = require("moment");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define("shop_user_cart_list", {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    bookId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    count: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    author: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    press: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT(10, 2),
      allowNull: false
    },
    salePrice: {
      type: DataTypes.FLOAT(10, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue("createdAt")).format("YYYY-MM-DD HH:mm:ss");
      }
    }
  }, {
    timestamps: false,
    freezeTableName: true
  });
};
