require("dotenv").config();
const sequelize = require("./config/database");
require("./models"); // важно: подтягивает ВСЕ модели

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    await sequelize.sync({ alter: true });
    console.log("Models synced");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
