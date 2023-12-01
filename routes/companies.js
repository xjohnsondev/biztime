const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require('slugify');

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [
      code,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }
    return res.json({ company: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const slugCode = slugify(code);
    const results = await db.query(
      `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code,name,description`,
      [slugCode, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      `UPDATE companies SET name = $2, description = $3
            WHERE code = $1
            RETURNING code,name,description`,
      [code, name, description]
    );
    console.log(results)
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }
    return res.json({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
    try {
        const code  = req.params.code;
        const result = await db.query(`DELETE FROM companies WHERE code = $1 RETURNING code`, [code]);    
        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
          } else {
            return res.json({ status: "deleted" });
          }
    } catch (e) {
        next(e);
    }
})

module.exports = router;
