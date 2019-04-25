const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

// 获取默认收货地址
router.post("/getDefaultAddress", addressController.getDefaultAddress);
// 获取收货地址列表
router.post("/getAddressList", addressController.getAddressList);
// 根据id获取收货地址
router.post("/getAddressById", addressController.getAddressById);
// 新增收货地址
router.post("/addAddress", addressController.addAddress);
// 修改收货地址
router.post("/updateAddress", addressController.updateAddress);
// 删除收货地址
router.post("/deleteAddress", addressController.deleteAddress);

module.exports = router;
