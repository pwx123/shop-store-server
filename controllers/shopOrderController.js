const Decimal = require("decimal.js");
const logger = require("../utils/log4j");
const resMsg = require("../utils/utils").resMsg;
const hasEmpty = require("../utils/utils").hasEmpty;
const getRefundOrderId = require("../utils/utils").getRefundOrderId;
const getOrderId = require("../utils/utils").getOrderId;
const shopOrderModel = require("../modules/shopOrderModel");

class shopOrderController {
  /**
   * 新增物流公司
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async createdOrder(req, res, next) {
    try {
      let {deliveryAddressId, ids, remark} = req.body;

      if (hasEmpty(deliveryAddressId, ids)) {
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
      let ordersRes = await shopOrderModel.getSubOrderInfo(idsArr);
      for (let i = 0, len = ordersRes.length; i < len; i++) {
        let {bookId, count, name, title, price, salePrice, imageUrl} = ordersRes[i];
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
      params.orderMoney = orderMoney;
      params.deliveryMoney = orderMoney >= 150 ? 0 : 6;
      params.totalMoney = new Decimal(orderMoney).add(new Decimal(params.deliveryMoney)).toNumber();
      let orderRes = await shopOrderModel.createOrder(params);
      for (let i = 0, len = orders.length; i < len; i++) {
        orders[i].mainOrderId = orderRes.id;
      }
      await shopOrderModel.createSubOrder(orders);
      res.json(resMsg(200));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }
}

module.exports = shopOrderController;
