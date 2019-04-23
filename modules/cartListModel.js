const db = require("../config/dbConnect");
const sequelize = db.sequelize;
const Op = sequelize.Op;
const shopUserCartListSchema = sequelize.import("../schema/shopUserCartListSchema");

class cartListModel {

  /**
   *
   * 添加购物车
   * @static
   * @param {*} obj 信息
   * @returns {Promise<*>}
   */
  static create(obj) {
    return shopUserCartListSchema.create(obj);
  }

  /**
   *
   * 获取用户购物车信息
   * @static
   * @param {*} name 用户名
   * @returns {Promise<*>}
   */
  static async getUserCartList(userId) {
    return await shopUserCartListSchema.findAll({
      where: {
        userId
      }
    });
  }

  /**
   *
   * 从购物车删除
   * @static
   * @param {*} userId 用户id
   * @param {*} id 购物车id
   * @returns {Promise<*>}
   */
  static async deleteCart(userId, ids) {
    return await shopUserCartListSchema.destroy({
      where: {
        userId,
        id: {
          [Op.in]: ids.split(",")
        }
      }
    });
  }
}

module.exports = cartListModel;
