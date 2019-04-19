const express = require("express");
const router = express.Router();
const shopUserController = require("../controllers/shopUserController");

// 登录
router.post("/login", shopUserController.login);
// 注册
router.post("/register", shopUserController.register);
// 退出登陆
router.post("/logout", shopUserController.logout);
// 更改昵称
router.post("/updateNickname", shopUserController.updateNickname);
// 更改密码
router.post("/updatePassword", shopUserController.updatePassword);
// 更改头像
router.post("/updateAvatar", shopUserController.updateAvatar);
// 获取用户信息
router.post("/getShopUserInfo", shopUserController.getShopUserInfo);
// 获取用户收货地址
router.post("/getUserDeliveryAddress", shopUserController.getUserDeliveryAddress);
// 根据id查询收货地址
router.post("/getOrderAddressById", shopUserController.getOrderAddressById);
// 更新用户账号状态
router.post("/changeUserStatus", shopUserController.changeUserStatus);
// 重置用户密码 返回随机生成的密码
router.post("/resetUserPwd", shopUserController.resetUserPwd);

module.exports = router;
