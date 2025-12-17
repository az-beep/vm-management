const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Backend работает");
});

app.listen(8000, () => {
  console.log("Backend on 8000");
});
