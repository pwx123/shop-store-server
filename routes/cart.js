const express = require("express");
const router = express.Router();
const cartListController = require("../controllers/cartListController");

// 获取用户购物车信息
router.post("/getUserCartList", cartListController.getUserCartList);
// 添加到购物车
router.post("/addCart", cartListController.addCart);
// 从购物车删除
router.post("/deleteCart", cartListController.deleteCart);
// 根据id获取购物车信息
router.post("/getCartById", cartListController.getCartById);

module.exports = router;
