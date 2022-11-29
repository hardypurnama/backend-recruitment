var express = require("express");
var router = express.Router();
var { authorize } = require("../middleware/authorize");
const Validator = require("fastest-validator");

//untuk memanggil nama
const { Product } = require("../models");

const v = new Validator();

router.get("/", async (req, res) => {
  const products = await Product.findAll();
  return res.json(products);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const product = await Product.findByPk(id);
  return res.json(product || {});
});

router.post("/", authorize(["admin", "hr"]), async (req, res) => {
  //   res.send("ini adalah post");
  const schema = {
    poster: "string|optional",
    nama_perusahaan: "string",
    posisi: "string",
    lokasi: "string",
    description: "string|optional",
  };

  const validate = v.validate(req.body, schema);

  if (validate.length) {
    return res.status(400).json(validate);
  }
  //   res.send("ok");
  const product = await Product.create(req.body);

  res.json(product);
});

router.put("/:id", authorize(["admin", "hr"]), async (req, res) => {
  const id = req.params.id;
  //   res.send(id);
  //cek id di db
  let product = await Product.findByPk(id);

  if (!product) {
    return res.json({ message: "product not found" });
  }
  //   res.send("ok");
  const schema = {
    poster: "string|optional",
    nama_perusahaan: "string",
    posisi: "string",
    lokasi: "string",
    description: "string|optional",
  };

  const validate = v.validate(req.body, schema);

  if (validate.length) {
    return res.status(400).json(validate);
  }
  //   res.send("ok");
  product = await product.update(req.body);
  res.json(product);
});

router.delete("/:id", authorize(["admin", "hr"]), async (req, res) => {
  const id = req.params.id;
  //   res.send(id);
  //cek id di db
  const product = await Product.findByPk(id);

  if (!product) {
    return res.json({ message: "product not found" });
  }

  await product.destroy();

  res.json({
    message: "product deleted",
  });
});
module.exports = router;
