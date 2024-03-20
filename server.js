const express = require("express");
const bodyParser = require("body-parser");
const productRoutes = require("./productRoutes");
const registeredRoutes = require("./registerRoutes");
const { router: authRoutes, verifyToken } = require("./authRoutes");

const app = express();
app.use(bodyParser.json());

const port = 3000;

app.use("/login", authRoutes);

app.use("/products", verifyToken, productRoutes);
app.use("/register", registeredRoutes);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
