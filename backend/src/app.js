const express = require("express");
const app = express();

app.use(express.json());

// роуты
app.use("/auth", require("./routes/auth.routes"));
app.use("/esxi", require("./routes/esxi.routes"));
app.use("/vm", require("./routes/vm.routes"));
app.use("/metrics", require("./routes/metrics.routes"));

module.exports = app;
