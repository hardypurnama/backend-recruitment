var express = require("express");
var router = express.Router();
// var { authorize } = require("../middleware/authorize");
const Validator = require("fastest-validator");
// const upload = require("../controllers/upload");

//untuk memanggil nama
const { Notifikasi } = require("../models");

const v = new Validator();

router.get("/", async (req, res) => {
  const notifikasis = await Notifikasi.findAll();
  return res.json(notifikasis);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const notifikasi = await Notifikasi.findByPk(id);
  return res.json(notifikasi || {});
});

router.post("/", async (req, res) => {
  //   res.send("ini adalah post");
  const schema = {
    id_user: "number",
    status_notif: "boolean",
    deskripsi: "string",
  };

  const validate = v.validate(req.body, schema);

  if (validate.length) {
    return res.status(400).json(validate);
  }
  //   res.send("ok");
  const notifikasi = await Notifikasi.create(req.body);

  res.json(notifikasi);
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  //   res.send(id);
  //cek id di db
  let notifikasi = await Notifikasi.findByPk(id);

  if (!notifikasi) {
    return res.json({ message: "notif not found" });
  }
  //   res.send("ok");
  const schema = {
    id_user: "number",
    status_notif: "boolean",
    deskripsi: "string",
  };

  const validate = v.validate(req.body, schema);

  if (validate.length) {
    return res.status(400).json(validate);
  }
  //   res.send("ok");
  notifikasi = await Notifikasi.update(req.body);
  res.json(notifikasi);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  //   res.send(id);
  //cek id di db
  const notifikasi = await Notifikasi.findByPk(id);

  if (!notifikasi) {
    return res.json({ message: "notif not found" });
  }

  await notifikasi.destroy();

  res.json({
    message: "notif deleted",
  });
});

module.exports = router;
