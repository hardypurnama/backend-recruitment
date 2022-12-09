var express = require("express");
var router = express.Router();
var { authorize } = require("../middleware/authorize");
const Validator = require("fastest-validator");

//untuk memanggil nama
const { Kandidat, Product, User, Notifikasi } = require("../models");

Product.hasOne(Kandidat, { foreignKey: "id_lowongan" });
Kandidat.belongsTo(Product, { foreignKey: "id_lowongan" });

User.hasOne(Kandidat, { foreignKey: "id_user" });
Kandidat.belongsTo(User, { foreignKey: "id_user" });

//di FE ambil id product/id lowongan, id user
//user login sebagai hr ada update status yg akan isi otomatis id hr
const v = new Validator();

router.get("/", authorize(["admin", "hr"]), async (req, res) => {
  const kandidats = await Kandidat.findAll({
    include: [Product, User],
  });
  return res.json(kandidats);
});

router.get(
  "/:id",
  authorize(["admin", "hr", "jobseeker"]),
  async (req, res) => {
    const id = req.params.id;
    const kandidat = await Kandidat.findByPk(id);
    return res.json(kandidat || {});
  }
);

router.get(
  "/byuser/:id",
  authorize(["admin", "hr", "jobseeker"]),
  async (req, res) => {
    const id = req.params.id;
    const kandidat = await Kandidat.findAll({
      where: {
        id_user: id,
      },
      include: [Product],
    });
    return res.json(kandidat || {});
  }
);

router.get(
  "/byhr/:id",
  authorize(["admin", "hr", "jobseeker"]),
  async (req, res) => {
    const id = req.params.id;
    const kandidat = await Kandidat.findOne({
      where: {
        id_hr: id,
      },
    });
    return res.json(kandidat || {});
  }
);

router.post("/", authorize(["admin", "hr", "jobseeker"]), async (req, res) => {
  //   res.send("ini adalah post");
  const schema = {
    id_lowongan: "number",
    id_user: "number",
    id_hr: "number",
    status: "string",
  };

  const validate = v.validate(req.body, schema);

  if (validate.length) {
    return res.status(400).json(validate);
  }
  //   res.send("ok");
  const kandidat = await Kandidat.create(req.body);

  res.json(kandidat);
});

router.put("/:id", authorize(["admin", "hr"]), async (req, res) => {
  const id = req.params.id;
  //   res.send(id);
  //cek id di db
  let kandidat = await Kandidat.findByPk(id);

  if (!kandidat) {
    return res.json({ message: "kandidat not found" });
  }
  //   res.send("ok");
  const schema = {
    id_lowongan: "number",
    id_user: "number",
    id_hr: "number",
    status: "string",
  };

  const validate = v.validate(req.body, schema);

  if (validate.length) {
    return res.status(400).json(validate);
  }
  //   res.send("ok");
  const notifikasi = await Notifikasi.create({
    id_user: req.body.id_user,
    status_notif: false,
    deskripsi: "Lowongan anda sudah terupdate",
  });
  kandidat = await kandidat.update(req.body);
  res.json(kandidat);
});

router.delete("/:id", authorize(["admin", "hr"]), async (req, res) => {
  const id = req.params.id;
  //   res.send(id);
  //cek id di db
  const kandidat = await Kandidat.findByPk(id);

  if (!kandidat) {
    return res.json({ message: "kandidat not found" });
  }

  await kandidat.destroy();

  res.json({
    message: "kandidat deleted",
  });
});
module.exports = router;
