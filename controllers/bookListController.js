const logger = require("../config/log4j");
const resMsg = require("../utils/utils").resMsg;
const hasEmpty = require("../utils/utils").hasEmpty;
const bookListModel = require("../modules/bookListModel");

class bookListController {
  /**
   * 获取所有分类信息
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async getAllClassify(req, res, next) {
    try {
      let result = await bookListModel.getAllClassify();
      res.json(resMsg(200, result));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 获取随机图书分类
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async getRandClassify(req, res, next) {
    try {
      let data = await bookListModel.getRandClassify();
      let resData = [];
      for (let i = 0, len = data.length; i < len; i++) {
        let obj = {
          id: data[i].id,
          title: data[i].name,
          data: []
        };
        obj.data = await bookListModel.getGoodByClassifyId(data[i].id);
        resData.push(obj);
      }
      console.log(resData);
      res.json(resMsg(200, resData));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 获取热销商品
   * @param req
   * @param res
   * @param next
   * @returns {Promise<void>}
   */
  static async getHotGood(req, res, next) {
    try {
      let result = await bookListModel.getHotGood();
      res.json(resMsg(200, result));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 获取折扣商品
   * @param req
   * @param res
   * @param next
   * @returns {Promise<void>}
   */
  static async getSaleGood(req, res, next) {
    try {
      let result = await bookListModel.getSaleGood();
      res.json(resMsg(200, result));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 获取发现商品
   * @param req
   * @param res
   * @param next
   * @returns {Promise<void>}
   */
  static async getDiscoverGood(req, res, next) {
    try {
      let result = await bookListModel.getDiscoverGood();
      res.json(resMsg(200, result));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }
}

module.exports = bookListController;
