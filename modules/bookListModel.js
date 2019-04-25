const db = require("../config/dbConnect");
const sequelize = db.sequelize;
const Op = sequelize.Op;
const bookListSchema = sequelize.import("../schema/bookListSchema");
const classifySchema = sequelize.import("../schema/classifySchema");
const shopSubOrderListSchema = sequelize.import("../schema/shopSubOrderListSchema");
const getUncertainLikeSqlObj = require("../utils/utils").getUncertainLikeSqlObj;

class bookListModel {
  /**
   *
   * 查询所有图书分类
   * @static
   * @returns {Promise<*>}
   * @memberof bookListModel
   */
  static async getAllClassify() {
    return await classifySchema.findAll();
  }

  /**
   *
   * 获取随机图书分类
   * @static
   * @returns {Promise<*>}
   * @memberof bookListModel
   */
  static async getRandClassify() {
    return classifySchema.findAll({
      order: [
        [[sequelize.literal("RAND()"), "DESC"]]
      ],
      limit: 5
    });
  }


  /**
   *
   * 根据分类获取图书
   * @static
   * @returns {Promise<*>}
   * @memberof bookListModel
   */
  static async getGoodByClassifyId(id) {
    return await sequelize.query("SELECT * FROM `shop_book_list` WHERE FIND_IN_SET(" + id + ", classify) AND status=0 AND isSell=1 limit 8", {type: sequelize.QueryTypes.SELECT});
  }

  /**
   *
   * 查询热销图书
   * @static
   * @returns {Promise<*>}
   * @memberof bookListModel
   */
  static async getHotGood(all) {
    let time = new Date(new Date(new Date().toLocaleDateString()).getTime());
    time.setDate(1);
    let obj = {};
    if (!all) {
      obj.limit = 3;
    }
    return shopSubOrderListSchema.findAll({
      attributes: [[sequelize.fn("COUNT", sequelize.col("id")), "bookCount"],
        ["bookId", "id"],
        ["bookName", "name"],
        ["bookImageUrl", "imageUrl"],
        ["bookPrice", "price"],
        ["bookSalePrice", "salePrice"]
      ],
      where: {
        createdAt: {
          [Op.gt]: time,
        }
      },
      group: "bookId",
      order: [
        [[sequelize.literal("bookCount"), "DESC"]]
      ],
      ...obj
    });
  }

  /**
   *
   * 查询折扣图书
   * @static
   * @returns {Promise<*>}
   * @memberof bookListModel
   */
  static async getSaleGood(all) {
    let obj = {};
    if (!all) {
      obj.limit = 3;
    }
    return bookListSchema.findAll({
      attributes: [[sequelize.literal("price-salePrice"), "deltaPrice"], "id", "name", "imageUrl", "price", "salePrice"],
      order: [
        [[sequelize.literal("deltaPrice"), "DESC"]]
      ],
      where: {
        status: 0,
        isSell: 1
      },
      ...obj
    });
  }

  /**
   *
   * 查询发现图书
   * @static
   * @returns {Promise<*>}
   * @memberof bookListModel
   */
  static async getDiscoverGood() {
    return bookListSchema.findAll({
      attributes: ["id", "name", "imageUrl", "price", "salePrice", "description"],
      order: [
        [[sequelize.literal("RAND()"), "DESC"]]
      ],
      where: {
        status: 0,
        isSell: 1
      },
      limit: 5
    });
  }


  /**
   * 根据id获取详情
   * @param id
   * @returns {Promise<*>}
   */
  static async getBookInfoById(id) {
    return bookListSchema.findOne({
      attributes: {exclude: ["status", "stockPrice", "createdAt", "updatedAt"]},
      where: {
        id
      }
    });
  }

  /**
   * 搜索图书
   * @param id
   * @returns {Promise<*>}
   */
  static async searchBook(search) {

    let likeArr = [
      {
        name: {
          [Op.like]: `%${search}%`
        }
      },
      {
        author: {
          [Op.like]: `%${search}%`
        }
      },
      {
        title: {
          [Op.like]: `%${search}%`
        }
      },
    ];
    return bookListSchema.findAll({
      attributes: ["id", "name", "imageUrl", "price", "salePrice"],
      where: {
        [Op.or]: likeArr,
        status: 0,
        isSell: 1
      }
    });
  }
}

module.exports = bookListModel;
