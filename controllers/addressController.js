const logger = require("../config/log4j");
const resMsg = require("../utils/utils").resMsg;
const addressModel = require("../modules/addressModel");
const hasEmpty = require("../utils/utils").hasEmpty;


class addressController {
  /**
   * 获取默认收货地址
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getDefaultAddress(req, res, next) {
    try {
      let result = await addressModel.getDefaultAddress(req.session.loginId);
      res.json(resMsg(200, result));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 获取收货地址列表
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAddressList(req, res, next) {
    try {
      let result = await addressModel.getAddressList(req.session.loginId);
      res.json(resMsg(200, result));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 获取收货地址列表
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAddressById(req, res, next) {
    try {
      if (hasEmpty(req.body.id)) {
        res.json(resMsg(9001));
        return false;
      }
      let result = await addressModel.getAddressById(req.session.loginId, req.body.id);
      res.json(resMsg(200, result));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }
}

module.exports = addressController;
