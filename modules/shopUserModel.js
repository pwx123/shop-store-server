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
   *
   * 根据用户id查询信息 排除密码
   * @static
   * @param {*} name 用户名
   * @returns {Promise<*>}
   */
  static async getUserInfoClient(id) {
    return await shopUserSchema.findOne({
      attributes: ["name", "nickname", "sex", "email", "avatarUrl"],
      where: {
        id
      }
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
   * 是否设置密码
   *
   * @static
   * @param {int} userId
   * @returns
   */
  static async getPayPwd(userId) {
    return await shopUserSchema.findOne({
      attributes: ["payPwd"],
      where: {
        id: userId
      }
    });
  }

  /**
   * 设置密码
   *
   * @static
   * @param {int} userId
   * @param {string} payPwd
   * @returns
   */
  static async setPayPwd(userId, payPwd) {
    return await shopUserSchema.update({
      payPwd
    }, {
      where: {
        id: userId
      }
    });
  }
}

module.exports = shopUserModel;
