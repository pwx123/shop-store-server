const db = require("../config/dbConnect");
const sequelize = db.sequelize;
const Op = sequelize.Op;
const shopUserSchema = sequelize.import("../schema/shopUserSchema");
const provinceSchema = sequelize.import("../schema/provinceSchema");
const citySchema = sequelize.import("../schema/citySchema");
const countrySchema = sequelize.import("../schema/countrySchema");
const shopUserDeliveryAddressSchema = sequelize.import("../schema/shopUserDeliveryAddressSchema");
const hasEmpty = require("../utils/utils").hasEmpty;
const getUncertainSqlObj = require("./../utils/utils").getUncertainSqlObj;

class shopUserModel {
  /**
   *
   * 根据用户名查询信息
   * @static
   * @param {*} name 用户名
   * @returns {Promise<*>}
   */
  static async getUserInfo(name) {
    return await shopUserSchema.findOne({
      where: {
        name
      }
    });
  }

  /**
   * 插入数据
   *
   * @static
   * @param {*} name
   * @param {*} pwd
   * @returns
   */
  static async create(user) {
    return await shopUserSchema.create({
      ...user
    });
  }

  /**
   * 更新
   *
   * @static
   * @param {obj} id 用户id
   * @returns
   */
  static async update(parmas) {
    let {
      id,
      ...updateData
    } = parmas;
    return await shopUserSchema.update({
      ...updateData
    }, {
      where: {
        id
      }
    });
  }

  /**
   * 查询用户收货地址
   *
   * @static
   * @param {int} useId 用户id
   */
  static async getUserDeliveryAddress(userId) {
    shopUserDeliveryAddressSchema.belongsTo(provinceSchema, {
      foreignKey: "provinceId",
      targetKey: "provinceId"
    });
    shopUserDeliveryAddressSchema.belongsTo(citySchema, {
      foreignKey: "cityId",
      targetKey: "cityId"
    });
    shopUserDeliveryAddressSchema.belongsTo(countrySchema, {
      foreignKey: "countryId",
      targetKey: "countryId"
    });
    return await shopUserDeliveryAddressSchema.findAll({
      attributes: {
        include: [
          [sequelize.col("shop_delivery_province.name"), "provinceName"],
          [sequelize.col("shop_delivery_city.name"), "cityName"],
          [sequelize.col("shop_delivery_country.name"), "countryName"]
        ]
      },
      include: [{
        model: provinceSchema,
        attributes: []
      }, {
        model: citySchema,
        attributes: []
      }, {
        model: countrySchema,
        attributes: []
      }],
      where: {
        userId
      }
    });
  }

  /**
   * 根据id查询收货地址信息
   *
   * @static
   * @param {*} id
   */
  static async getOrderAddressById(id) {
    shopUserDeliveryAddressSchema.belongsTo(provinceSchema, {
      foreignKey: "provinceId",
      targetKey: "provinceId"
    });
    shopUserDeliveryAddressSchema.belongsTo(citySchema, {
      foreignKey: "cityId",
      targetKey: "cityId"
    });
    shopUserDeliveryAddressSchema.belongsTo(countrySchema, {
      foreignKey: "countryId",
      targetKey: "countryId"
    });
    return await shopUserDeliveryAddressSchema.findAll({
      attributes: {
        include: [
          [sequelize.col("shop_delivery_province.name"), "provinceName"],
          [sequelize.col("shop_delivery_city.name"), "cityName"],
          [sequelize.col("shop_delivery_country.name"), "countryName"]
        ]
      },
      include: [{
        model: provinceSchema,
        attributes: []
      }, {
        model: citySchema,
        attributes: []
      }, {
        model: countrySchema,
        attributes: []
      }],
      where: {
        id
      },
      raw: true
    });
  }
}

module.exports = shopUserModel;
