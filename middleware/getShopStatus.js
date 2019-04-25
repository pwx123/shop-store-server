const db = require("../config/dbConnect");
const sequelize = db.sequelize;
const shopSchema = sequelize.import("../schema/shopSchema");

let getShopStatus = async () => {
  return await shopSchema.findAll();
};

module.exports = getShopStatus;
