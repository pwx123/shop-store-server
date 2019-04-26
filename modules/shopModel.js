const db = require("../config/dbConnect");
const sequelize = db.sequelize;
const Op = sequelize.Op;
const shopSchema = sequelize.import("../schema/shopSchema");

class shopModel {
  /**
   *
   * 查询店铺信息
   * @static
   * @returns {Promise<*>}
   * @memberof shopModel
   */
  static async getUserInfo() {
    return await shopSchema.findOne({
      attributes: ["shopName", "description"]
    });
  }
}

module.exports = shopModel;
