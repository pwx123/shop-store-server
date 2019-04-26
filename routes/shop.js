const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");

// 获取店铺信息
router.post("/getShopInfo", shopController.getShopInfo);

module.exports = router;
