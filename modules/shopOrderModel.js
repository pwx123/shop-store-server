const db = require("../config/dbConnect");
const sequelize = db.sequelize;
const Op = sequelize.Op;
const shopOrderListSchema = sequelize.import("../schema/shopOrderListSchema");
const shopSubOrderListSchema = sequelize.import("../schema/shopSubOrderListSchema");
const shopUserCartListSchema = sequelize.import("../schema/shopUserCartListSchema");
const shopDeliveryCompanySchema = sequelize.import("../schema/shopDeliveryCompanySchema");
const shopUserDeliveryAddressSchema = sequelize.import("../schema/shopUserDeliveryAddressSchema");
const shopRefundRecordSchema = sequelize.import("../schema/shopRefundRecordSchema");
const bookListSchema = sequelize.import("../schema/bookListSchema");
const getUncertainSqlObj = require("./../utils/utils").getUncertainSqlObj;

class shopOrderModel {
  /**
   * 分页查询订单列表
   *
   * @static
   */
  static async getOrderList(parmas, userId) {
    let {
      pageSize,
      pageNumber,
      status
    } = parmas;
    let searchObj = getUncertainSqlObj({
      status
    });
    shopOrderListSchema.hasMany(shopSubOrderListSchema, {
      foreignKey: "mainOrderId",
      sourceKey: "id",
      as: {
        singular: "orders",
        plural: "orders"
      }
    });
    let result = await shopOrderListSchema.findAndCountAll({
      offset: pageSize * (pageNumber - 1),
      limit: pageSize,
      where: {
        userId,
        ...searchObj
      },
      include: [{
        model: shopSubOrderListSchema,
        as: "orders"
      }],
      order: [
        ["id", "DESC"]
      ],
      distinct: true
    });
    return {
      pageSize,
      pageNumber,
      rows: result.rows,
      total: result.count
    };
  }

  /**
   * 根据订单号查询订单
   * @param orderId
   * @returns {Promise<*>}
   */
  static async getOrderByOrderId(orderId) {
    shopOrderListSchema.hasMany(shopSubOrderListSchema, {
      foreignKey: "mainOrderId",
      sourceKey: "id",
      as: {
        singular: "orders",
        plural: "orders"
      }
    });
    return await shopOrderListSchema.findOne({
      where: {
        orderId
      },
      include: [{
        model: shopSubOrderListSchema,
        as: "orders"
      }],
      distinct: true
    });
  }

  /**
   * 生成退款订单记录
   * @param refundArr 退款订单数据
   * @returns {Promise<*>}
   */
  static async createRefundRecord(refundArr) {
    return await shopRefundRecordSchema.bulkCreate(refundArr);
  }

  /**
   * 分页获取退款订单记录
   * @param params
   * @returns {Promise<{total: *, pageNumber: *, pageSize: *, rows: *}>}
   */
  static async getRefundRecord(params) {
    let {
      pageSize,
      pageNumber,
      startTime,
      endTime,
      refundOrderId,
      orderNumId,
      userName,
      status
    } = params;
    let queryObj = getUncertainSqlObj({
      refundOrderId,
      orderNumId,
      userName,
      status
    });
    let result = await shopRefundRecordSchema.findAndCountAll({
      offset: pageSize * (pageNumber - 1),
      limit: pageSize,
      where: {
        createdAt: {
          [Op.gt]: startTime,
          [Op.lt]: endTime,
        },
        ...queryObj
      },
      order: [
        ["id", "DESC"]
      ]
    });
    return {
      pageSize,
      pageNumber,
      rows: result.rows,
      total: result.count
    };
  }


  /**
   * 获取子订单信息
   *
   * @static
   * @param {*} idsArr 子订单idsArr
   * @returns
   */
  static async getSubOrderInfo(idsArr) {
    return await shopUserCartListSchema.findAll({
      where: {
        id: {
          [Op.in]: idsArr
        }
      }
    });
  }

  /**
   * 生成订单
   *
   * @static
   * @param {*} param
   * @returns
   */
  static async createOrder(param) {
    return await shopOrderListSchema.create(param);
  }

  /**
   * 生成子订单
   *
   * @static
   * @param {*} paramsArr
   * @returns
   */
  static async createSubOrder(paramsArr) {
    return await shopSubOrderListSchema.bulkCreate(paramsArr);
  }

  /**
   * 更新库存
   *
   * @static
   * @returns
   * @param id 书籍id
   * @param reduceCount 减少的数量
   */
  static async updateStock(id, reduceCount) {
    let str = `-${reduceCount}`;
    return await bookListSchema.update({
      stock: sequelize.literal("`stock` " + str),
      updatedAt: new Date()
    }, {
      where: {
        id
      }
    });
  }

  /**
   * 订单付款完成
   *
   * @static
   * @returns
   * @param orderId
   */
  static async updateOrderPayment(orderId) {
    return await shopOrderListSchema.update({
      status: 1,
      updatedAt: new Date()
    }, {
      where: {
        orderId,
        status: 0
      }
    });
  }
}


module.exports = shopOrderModel;
