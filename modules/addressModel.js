const db = require("../config/dbConnect");
const sequelize = db.sequelize;
const provinceSchema = sequelize.import("../schema/provinceSchema");
const citySchema = sequelize.import("../schema/citySchema");
const countrySchema = sequelize.import("../schema/countrySchema");
const shopUserDeliveryAddressSchema = sequelize.import("../schema/shopUserDeliveryAddressSchema");

class addressModel {
  /**
   * 查询用户收货地址
   *
   * @static
   * @param userId
   */
  static async getDefaultAddress(userId) {
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
    return await shopUserDeliveryAddressSchema.findOne({
      attributes: [
        "id",
        "detailAddress",
        ["deliveryName", "name"],
        ["deliveryMobile", "tel"],
        [sequelize.col("shop_delivery_province.name"), "provinceName"],
        [sequelize.col("shop_delivery_city.name"), "cityName"],
        [sequelize.col("shop_delivery_country.name"), "countryName"]
      ],
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
        isDefault: 1,
        userId
      }
    });
  }

  /**
   * 获取用户收货地址列表
   *
   * @static
   * @param {*} userId
   */
  static async getAddressList(userId) {
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
      attributes: [
        "id",
        "detailAddress",
        "isDefault",
        ["deliveryName", "name"],
        ["deliveryMobile", "tel"],
        [sequelize.col("shop_delivery_province.name"), "provinceName"],
        [sequelize.col("shop_delivery_city.name"), "cityName"],
        [sequelize.col("shop_delivery_country.name"), "countryName"]
      ],
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
      },
      raw: true
    });
  }

  /**
   * 根据id查询收货地址信息
   *
   * @static
   * @param userId 用户id
   * @param {*} id 地址id
   */
  static async getAddressById(userId, id) {
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
    return await shopUserDeliveryAddressSchema.findOne({
      attributes: {
        exclude: ["userId"]
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
        userId,
        id
      },
      raw: true
    });
  }
}

module.exports = addressModel;
