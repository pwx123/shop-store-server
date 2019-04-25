const express = require("express");
const router = express.Router();
const shopOrderController = require("../controllers/shopOrderController");

// 分页查询订单列表
router.post("/createdOrder", shopOrderController.createdOrder);

module.exports = router;
