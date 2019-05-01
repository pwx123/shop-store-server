const Decimal = require("decimal.js");
const axios = require("axios");
const logger = require("../utils/log4j");
const resMsg = require("../utils/utils").resMsg;
const hasEmpty = require("../utils/utils").hasEmpty;
const getRefundOrderId = require("../utils/utils").getRefundOrderId;
const getOrderId = require("../utils/utils").getOrderId;
const shopOrderModel = require("../modules/shopOrderModel");
const bookListModel = require("../modules/bookListModel");
const cartListModel = require("../modules/cartListModel");
const MANAGEMENT_SERVER = require("../config/uploadConfig").MANAGEMENT_SERVER;

class shopOrderController {
  /**
   * 分页获取订单记录
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof shopOrderController
   */
  static async getOrderList(req, res, next) {
    try {
      if (hasEmpty(req.body.pageSize, req.body.pageNumber)) {
        res.json(resMsg(9001));
        return false;
      }
      let result = await shopOrderModel.getOrderList(req.body, req.session.loginId);
      res.json(resMsg(200, result));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 根据id获取详情
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof shopOrderController
   */
  static async getOrderDetailById(req, res, next) {
    try {
      if (hasEmpty(req.body.id)) {
        res.json(resMsg(9001));
        return false;
      }
      let result = await shopOrderModel.getOrderByOrderId(req.body.id, req.session.loginId);
      res.json(resMsg(200, result));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 退款订单
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof shopOrderController
   */
  static async submitRefundOrder(req, res, next) {
    try {
      if (hasEmpty(req.body.id, req.body.remark)) {
        res.json(resMsg(9001));
        return false;
      }
      let result = await shopOrderModel.submitRefundOrder({
        remark: req.body.remark,
        id: req.body.id,
        userId: req.session.loginId
      });
      if (result[0] === 1) {
        // 通知管理平台
        axios.post(MANAGEMENT_SERVER + "/api/orderNotify", {
          type: 6
        }).then(res => {
          logger.info("退款订单通知成功:" + req.body.id);
        }).catch(err => {
          logger.info("退款订单通知失败:" + req.body.id);
        });
        res.json(resMsg(200));
      } else {
        res.json(resMsg(2004));
      }
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 确认收货
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof shopOrderController
   */
  static async submitOrderComplete(req, res, next) {
    try {
      if (hasEmpty(req.body.id)) {
        res.json(resMsg(9001));
        return false;
      }
      let result = await shopOrderModel.submitOrderComplete({
        id: req.body.id,
        userId: req.session.loginId
      });
      if (result[0] === 1) {
        res.json(resMsg(200));
      } else {
        res.json(resMsg(2004));
      }
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 订单付款完成
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async setOrderPayment(req, res, next) {
    try {
      let {orderId} = req.body;
      if (hasEmpty(orderId)) {
        res.json(resMsg(9001));
        return false;
      }
      let data = await shopOrderModel.updateOrderPayment(orderId);
      if (data[0] === 1) {
        // 通知管理平台
        axios.post(MANAGEMENT_SERVER + "/api/orderNotify", {
          type: 1
        }).then(res => {
          logger.info("订单通知成功:" + orderId);
        }).catch(err => {
          logger.info("订单通知失败:" + orderId);
        });
        res.json(resMsg(200));
      } else {
        res.json(resMsg(2004));
      }
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 新增订单
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async createdOrder(req, res, next) {
    try {
      let {deliveryAddressId, ids, remark, type, count} = req.body;
      if (hasEmpty(deliveryAddressId, ids) || (type == 1 && (!count || count <= 0 || count > 10))) {
        res.json(resMsg(9001));
        return false;
      }
      let userId = req.session.loginId;
      let userName = req.session.loginUser;
      let idsArr = ids.split(",");
      let orderId = getOrderId(userId);
      let params = {
        orderId,
        userId,
        userName,
        status: 0,
        orderNum: idsArr.length,
        deliveryId: null,
        deliveryOrderId: null,
        deliveryAddressId,
        remark
      };
      let orderMoney = 0;
      let orders = [];
      let ordersRes = [];
      // 子订单信息
      if (type == 1) {
        let data = await bookListModel.getBookInfoById(idsArr[0]);
        data.count = count;
        ordersRes = [data];
      } else {
        ordersRes = await shopOrderModel.getSubOrderInfo(idsArr);
      }
      for (let i = 0, len = ordersRes.length; i < len; i++) {
        let {id, bookId, count, name, title, price, salePrice, imageUrl} = ordersRes[i];
        if (type == 1) {
          bookId = id;
        }
        let subOrder = {
          bookId,
          bookName: name,
          bookTitle: title,
          bookNum: count,
          bookPrice: price,
          bookSalePrice: salePrice,
          bookImageUrl: imageUrl
        };
        orderMoney = new Decimal(orderMoney).add(new Decimal(salePrice).mul(new Decimal(count))).toNumber();
        orders.push(subOrder);
      }
      // 库存校验
      let bookIdArr = orders.map(item => item.bookId);
      let bookInfo = await bookListModel.getBookInfoByIds(bookIdArr);
      for (let i = 0, iLen = orders.length; i < iLen; i++) {
        for (let j = 0, jLen = bookInfo.length; j < jLen; j++) {
          if (orders[i].bookId === bookInfo[j].id) {
            if (orders[i].bookNum > bookInfo[j].stock) {
              res.json({
                errorCode: 2003,
                errorMsg: bookInfo[j].name + " 库存不足",
                data: ""
              });
              return false;
            }
          }
        }
      }
      params.orderMoney = orderMoney;
      params.deliveryMoney = orderMoney >= 150 ? 0 : 6;
      params.totalMoney = new Decimal(orderMoney).add(new Decimal(params.deliveryMoney)).toNumber();
      let orderRes = await shopOrderModel.createOrder(params);
      for (let i = 0, len = orders.length; i < len; i++) {
        orders[i].mainOrderId = orderRes.id;
      }
      // 生成子订单
      await shopOrderModel.createSubOrder(orders);
      // 库存修改
      for (let i = 0, iLen = orders.length; i < iLen; i++) {
        await shopOrderModel.updateStock(orders[i].bookId, orders[i].bookNum);
      }
      // 从购物车删除
      if (type != 1) {
        await cartListModel.deleteCart(userId, idsArr.join(","));
      }
      res.json(resMsg(200, {orderId}));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }
}

module.exports = shopOrderController;
