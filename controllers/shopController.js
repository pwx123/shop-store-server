const logger = require("../utils/log4j");
const resMsg = require("../utils/utils").resMsg;
const hasEmpty = require("../utils/utils").hasEmpty;
const shopModel = require("../modules/shopModel");
const adminUserModel = require("../modules/adminUserModel");

class shopController {
  /**
   * 获取店铺信息
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof shopController
   */
  static async getShopInfo(req, res, next) {
    try {
      let result = await shopModel.getUserInfo();
      res.json(resMsg(200, result));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }
}

module.exports = shopController;
