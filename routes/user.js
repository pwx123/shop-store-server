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
// 更改性别
router.post("/updateSex", shopUserController.updateSex);
// 更改头像
router.post("/updateAvatar", shopUserController.updateAvatar);
// 获取用户信息
router.post("/getUserInfo", shopUserController.getUserInfo);
// 是否设置支付密码
router.post("/hasPayPwd", shopUserController.hasPayPwd);
// 设置支付密码
router.post("/setPayPwd", shopUserController.setPayPwd);
// 校验支付密码
router.post("/validPayPwd", shopUserController.validPayPwd);

module.exports = router;
