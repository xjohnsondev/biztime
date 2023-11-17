const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoice: results.rows });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await db.query(
        `SELECT i.id, 
                i.comp_code, 
                i.amt, 
                i.paid, 
                i.add_date, 
                i.paid_date, 
                c.name, 
                c.description 
         FROM invoices AS i
           INNER JOIN companies AS c ON (i.comp_code = c.code)  
         WHERE id = $1`,
      [id]);

  if (result.rows.length === 0) {
    throw new ExpressError(`No such invoice: ${id}`,404);
  }

  const data = result.rows[0];
  const invoice = {
    id: data.id,
    company: {
      code: data.comp_code,
      name: data.name,
      description: data.description,
    },
    amt: data.amt,
    paid: data.paid,
    add_date: data.add_date,
    paid_date: data.paid_date,
  };
  return res.json({"invoice": invoice});
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
    try{
        const { comp_code, amt } = req.body;
        const result = await db.query(`
        INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id,comp_code,amt,paid,add_date,paid_date`, [comp_code, amt])
        console.log(result)
        return res.json({ invoices: result.rows[0] }) 
    } catch(e) {
        next(e);
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const amt = req.body.amt;
        const result = await db.query(`
        UPDATE invoices SET amt=$1
        WHERE id=$2
        RETURNING id,comp_code,amt,paid,add_date,paid_date`, [amt,id])
        if (result.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`,404);
          }
        return res.json({ invoice: result.rows[0] })
    } catch(e) {
        next(e);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await db.query(`
        DELETE FROM invoices WHERE id=$1 RETURNING id`, [id])
        if (result.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`,404);
          }
        return res.json({ status: "deleted" })
    } catch(e) {
        next(e);
    }
})

// router.get('/:code', async (req, res, next) => {
//     try {
//         const code = req.params.code;
//         const result = await db.query(`
//             SELECT c.code, c.name, c.description, i.id as invoice_id
//             FROM companies AS c
//             LEFT JOIN invoices AS i ON c.code = i.comp_code
//             WHERE c.code = $1
//         `, [code]);

//         if (result.rows.length === 0) {
//             throw new ExpressError(`No such company: ${code}`, 404);
//         }

//         const data = result.rows[0];
//         const company = {
//             code: data.code,
//             name: data.name,
//             description: data.description,
//             invoices: result.rows.filter(row => row.invoice_id).map(row => row.invoice_id)
//         };

//         return res.json({ company });
//     } catch (e) {
//         next(e);
//     }
// });




module.exports = router;
