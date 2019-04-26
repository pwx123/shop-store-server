const logger = require("../utils/log4j");
const resMsg = require("../utils/utils").resMsg;
const hasEmpty = require("../utils/utils").hasEmpty;
const getRandomPwd = require("../utils/utils").getRandomPwd;
const shopUserModel = require("../modules/shopUserModel");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const rsaKey = require("../utils/rsa");
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
          req.session.loginId = result.id;
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
   * 用户注册
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
      }, req.session.loginId);
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
          pwd: decryptNewPwd,
          id: req.session.loginId
        });
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
   * 获取会员用户信息
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getUserInfo(req, res, next) {
    try {
      let result = await shopUserModel.getUserInfoClient(req.session.loginId);
      res.json(resMsg(200, result));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 是否设置支付密码
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async hasPayPwd(req, res, next) {
    try {
      let result = await shopUserModel.getPayPwd(req.session.loginId);
      res.json(resMsg(200, !!result.payPwd));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 设置支付密码
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async setPayPwd(req, res, next) {
    try {
      let payPwd = decodeURI(req.body.payPwd);
      let decryptPwd = rsaKey.decrypt(payPwd, "utf8");
      if (hasEmpty(decryptPwd)) {
        res.json(resMsg(9001));
        return false;
      }
      let result = await shopUserModel.getPayPwd(req.session.loginId);
      if (!!result.payPwd) {
        res.json(resMsg(1006));
        return false;
      }
      await shopUserModel.setPayPwd(req.session.loginId, decryptPwd);
      res.json(resMsg(200));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }

  /**
   * 校验支付密码
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async validPayPwd(req, res, next) {
    try {
      let payPwd = decodeURI(req.body.payPwd);
      let decryptPwd = rsaKey.decrypt(payPwd, "utf8");
      if (hasEmpty(decryptPwd)) {
        res.json(resMsg(9001));
        return false;
      }
      let result = await shopUserModel.getPayPwd(req.session.loginId);
      if (result.payPwd !== decryptPwd) {
        res.json(resMsg(1002));
        return false;
      }
      res.json(resMsg(200));
    } catch (error) {
      logger.error(error);
      res.json(resMsg());
    }
  }
}

module.exports = shopUserController;
