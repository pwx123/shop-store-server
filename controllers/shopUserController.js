const logger = require("../config/log4j");
const resMsg = require("../utils/utils").resMsg;
const hasEmpty = require("../utils/utils").hasEmpty;
const getRandomPwd = require("../utils/utils").getRandomPwd;
const shopUserModel = require("../modules/shopUserModel");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const rsaKey = require("../config/rsa");
const mobileReg = require("../utils/utils").mobileReg;
const uploadConfig = require("./../config/uploadConfig");

class shopUserController {

  /**
   * 用户登录
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async login(req, res, next) {
    try {
      let name = req.body.name;
      let pwd = decodeURI(req.body.pwd);
      let decryptPwd = rsaKey.decrypt(pwd, "utf8");
      if (hasEmpty(name, decryptPwd)) {
        res.json(resMsg(9001));
        return false;
      } else {
        let result = await shopUserModel.getUserInfo(name);
        if (result === null) {
          res.json(resMsg(1001));
          return false;
        }
        if (decryptPwd === result.pwd) {
          req.session.loginUser = result.name;
          res.json(resMsg(200));
        } else {
          res.json(resMsg(1002));
        }
      }
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 管理员注册
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async register(req, res, next) {
    try {
      let name = req.body.name;
      let nickname = name;
      let pwd = decodeURI(req.body.pwd);
      let repPwd = decodeURI(req.body.repPwd);
      let decryptPwd = rsaKey.decrypt(pwd, "utf8");
      let decryptRepPwd = rsaKey.decrypt(repPwd, "utf8");
      if (hasEmpty(name, decryptPwd, decryptRepPwd) || !mobileReg.test(name)) {
        res.json(resMsg(9001));
        return false;
      } else {
        if (decryptRepPwd !== decryptPwd) {
          res.json(resMsg(1004));
          return false;
        }
        let result = await shopUserModel.getUserInfo(name);
        if (result !== null) {
          res.json(resMsg(1003));
          return false;
        }
        await shopUserModel.create({
          nickname: nickname,
          name: name,
          pwd: decryptPwd
        });
        res.json(resMsg(200));
      }
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 退出登录
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof adminUserController
   */
  static async logout(req, res, next) {
    req.session.destroy();
    res.json(resMsg(200));
  }

  /**
   * 更新昵称
   *
   * @static
   * @param req
   * @param {*} res
   * @param {*} res
   * @param {*} next
   * @memberof adminUserController
   */
  static async updateNickname(req, res, next) {
    try {
      let {
        nickname
      } = req.body;
      if (hasEmpty(nickname) || nickname.length > 20) {
        nickname = "";
      }
      await shopUserModel.update({
        nickname
      }, req.session.loginUser);
      res.json(resMsg(200));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 更改密码
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof adminUserController
   */
  static async updatePassword(req, res, next) {
    try {
      let pwd = decodeURI(req.body.pwd);
      let newPwd = decodeURI(req.body.newPwd);
      let repNewPwd = decodeURI(req.body.repNewPwd);
      let decryptPwd = rsaKey.decrypt(pwd, "utf8");
      let decryptNewPwd = rsaKey.decrypt(newPwd, "utf8");
      let decryptRepNewPwd = rsaKey.decrypt(repNewPwd, "utf8");
      if (hasEmpty(decryptPwd, decryptNewPwd, decryptRepNewPwd)) {
        res.json(resMsg(9001));
        return false;
      }
      if (decryptNewPwd !== decryptRepNewPwd) {
        res.json(resMsg(1004));
        return false;
      }
      let result = await shopUserModel.getUserInfo(req.session.loginUser);
      if (result.pwd === decryptPwd) {
        await shopUserModel.update({
          pwd: decryptNewPwd
        }, req.session.loginUser);
        req.session.destroy();
        res.json(resMsg(200));
      } else {
        logger.error("原密码错误");
        res.json(resMsg(1005));
      }
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   * 更新头像
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof adminUserController
   */
  static async updateAvatar(req, res, next) {
    let form = new formidable.IncomingForm();
    form.encoding = uploadConfig.ENCODING;
    form.uploadDir = uploadConfig.SERVER_DIR + uploadConfig.ADMIN_AVATAR_URL;
    form.keepExtensions = uploadConfig.KEEP_EXTENSIONS;
    form.maxFileSize = uploadConfig.MAX_FILESIZE;
    form.parse(req, async (error, fields, files) => {
      if (error) {
        logger.error(error);
        res.json(resMsg());
        return false;
      }
      let avatarUrl = "";
      if (files.avatar) {
        let extname = path.extname(files.avatar.name);
        let newPath = uploadConfig.SERVER_DIR + uploadConfig.ADMIN_AVATAR_URL + req.session.loginUser + extname.toLocaleLowerCase();
        fs.renameSync(files.avatar.path, newPath);
        avatarUrl = uploadConfig.SERVER_URL + uploadConfig.ADMIN_AVATAR_URL + req.session.loginUser + extname.toLocaleLowerCase();
      } else {
        res.json(resMsg(9001));
        return false;
      }
      await shopUserModel.update({
        avatarUrl
      }, req.session.loginUser);
      res.json(resMsg(200));
    });
    form.on("error", function (error) {
      logger.error(error);
      res.json(resMsg());
      return false;
    });
  }

  /**
   * 获取店铺用户信息
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof shopUserController
   */
  static async getShopUserInfo(req, res, next) {
    try {
      if (hasEmpty(req.body.pageSize, req.body.pageNumber)) {
        res.json(resMsg(9001));
        return false;
      }
      let result = await shopUserModel.getShopUserInfo(req.body);
      res.json(resMsg(200, result));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 查询用户收货地址
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   * @memberof shopUserController
   */
  static async getUserDeliveryAddress(req, res, next) {
    try {
      if (hasEmpty(req.body.userId)) {
        res.json(resMsg(9001));
        return false;
      }
      let result = await shopUserModel.getUserDeliveryAddress(req.body.userId);
      res.json(resMsg(200, result));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 根据id获取收货地址信息
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof shopUserController
   */
  static async getOrderAddressById(req, res, next) {
    try {
      if (hasEmpty(req.body.id)) {
        res.json(resMsg(9001));
        return false;
      }
      let result = await shopUserModel.getOrderAddressById(req.body.id);
      res.json(resMsg(200, result[0]));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 更新账号状态
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof shopUserController
   */
  static async changeUserStatus(req, res, next) {
    try {
      if (hasEmpty(req.body.id, req.body.status) || (req.body.status != 0 && req.body.status != 1)) {
        res.json(resMsg(9001));
        return false;
      }
      await shopUserModel.update({
        id: req.body.id,
        status: req.body.status
      });
      res.json(resMsg(200));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 重置用户密码 返回随机生成的密码
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @memberof shopUserController
   */
  static async resetUserPwd(req, res, next) {
    try {
      if (hasEmpty(req.body.id)) {
        res.json(resMsg(9001));
        return false;
      }
      let ranPwd = getRandomPwd();
      let hash = crypto.createHash("md5");
      hash.update(ranPwd);
      let hashPwd = hash.digest("hex");
      await shopUserModel.update({
        id: req.body.id,
        pwd: hashPwd
      });
      let buffer = new Buffer.from(ranPwd);
      res.json(resMsg(200, {
        newPwd: buffer.toString("base64")
      }));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }
}

module.exports = shopUserController;
