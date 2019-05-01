const express = require("express");
const router = express.Router();
const shopOrderController = require("../controllers/shopOrderController");

// 生成订单
router.post("/createdOrder", shopOrderController.createdOrder);
// 订单付款完成
router.post("/setOrderPayment", shopOrderController.setOrderPayment);
// 分页查询订单
router.post("/getOrderList", shopOrderController.getOrderList);
// 退款
router.post("/submitRefundOrder", shopOrderController.submitRefundOrder);
// 确认收货
router.post("/submitOrderComplete", shopOrderController.submitOrderComplete);
// 根据id获取详情
router.post("/getOrderDetailById", shopOrderController.getOrderDetailById);

module.exports = router;
