const express = require("express");
const router = express.Router();
const pool = require("./db");
const uuid = require("uuid").v4;
const { verifyToken } = require("./authRoutes");

router.get("/", async (req, res) => {
  try {
    const searchTerm = req.query.product_name;

    let query, countQueryParams, result, totalCount;

    if (searchTerm) {
      query = "SELECT * FROM products WHERE product_name LIKE $1";
      countQueryParams = ["%" + searchTerm + "%"];
    } else {
      query = "SELECT * FROM products";
      countQueryParams = [];
    }

    countQuery = "SELECT COUNT(*) FROM products";
    if (searchTerm) {
      countQuery += " WHERE product_name LIKE $1";
    }
    totalCount = await pool.query(countQuery, countQueryParams);

    result = await pool.query(
      query,
      searchTerm ? ["%" + searchTerm + "%"] : []
    );

    res.json({
      products: result.rows,
      totalItems: totalCount.rows[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const id = uuid();
    const { product_name, description, price, quantity } = req.body;

    const result = await pool.query(
      "INSERT INTO products (id, product_name, description, price, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, product_name, description, price, quantity]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { product_name, description, price, quantity } = req.body;
    const result = await pool.query(
      "UPDATE products SET product_name = $1, description = $2, price = $3, quantity = $4 WHERE id = $5 RETURNING *",
      [product_name, description, price, quantity, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query("DELETE FROM products WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json({ message: "Product deleted successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
