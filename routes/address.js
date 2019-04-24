const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

// 获取默认收货地址
router.post("/getDefaultAddress", addressController.getDefaultAddress);
// 获取收货地址列表
router.post("/getAddressList", addressController.getAddressList);
// 根据id获取收货地址
router.post("/getAddressById", addressController.getAddressById);

module.exports = router;
