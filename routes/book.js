const express = require("express");
const router = express.Router();
const bookListController = require("../controllers/bookListController");

// 获取所有图书分类
router.post("/getAllClassify", bookListController.getAllClassify);
// 获取随机图书分类
router.post("/getRandClassify", bookListController.getRandClassify);
// 获取热销商品
router.post("/getHotGood", bookListController.getHotGood);
// 获取折扣商品
router.post("/getSaleGood", bookListController.getSaleGood);
// 获取发现商品
router.post("/getDiscoverGood", bookListController.getDiscoverGood);
// 根据id获取详情
router.post("/getBookInfoById", bookListController.getBookInfoById);
// 搜索图书
router.post("/searchBook", bookListController.searchBook);

module.exports = router;
