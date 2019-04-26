const express = require("express");
const router = express.Router();
const shopOrderController = require("../controllers/shopOrderController");

// 生成订单
router.post("/createdOrder", shopOrderController.createdOrder);
// 订单付款完成
router.post("/setOrderPayment", shopOrderController.setOrderPayment);
// 分页查询订单
router.post("/getOrderList", shopOrderController.getOrderList);

module.exports = router;
