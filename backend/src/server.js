const app = require("./app");
const { sequelize } = require("./models");

const PORT = 5000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // <-- создаёт таблицы
    console.log("DB connected");

    app.listen(PORT, () =>
      console.log(`Backend running on port ${PORT}`)
    );
  } catch (err) {
    console.error("DB error:", err);
  }
})();
