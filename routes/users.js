var express = require("express");
const { Op } = require("sequelize");
var router = express.Router();
var { authorize } = require("../middleware/authorize");
const upload = require("../controllers/upload");
const Validator = require("fastest-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//untuk memanggil nama
const { User, role } = require("../models");
// const role = require("../models/role");

const v = new Validator();

encryptPassword = (password) => bcrypt.hashSync(password, 10);

verifyPassword = (password, encryptedPassword) =>
  bcrypt.compareSync(password, encryptedPassword);

function checkPassword(encryptedPassword, password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, encryptedPassword, (err, isPasswordCorrect) => {
      if (!!err) {
        reject(err);
        return;
      }

      resolve(isPasswordCorrect);
    });
  });
}

//endpoint Uploads
router.use("/uploads", upload.onUpload);

router.get("/", async (req, res) => {
  const users = await User.findAll();
  return res.json(users);
});

router.get(
  "/:id",
  authorize(["admin", "hr", "jobseeker"]),
  async (req, res) => {
    const id = req.params.id;
    const user = await User.findByPk(id);
    const Role = await role.findOne({ where: { user_id: user.id } });
    user.role = Role.role; //inject role ke user
    if (!user) {
      return res.json({ message: "user not found" });
    }
    return res.json(user || {});
  }
);

router.post("/", authorize(["admin", "hr"]), async (req, res) => {
  //   res.send("ini adalah post");
  const schema = {
    nama: "string",
    foto: "string|optional",
    username: "string",
    password: "string",
    email: "string",
    nohp: "string",
    tgl_lahir: "string",
    domisili: "string",
    document: "string|optional",
  };

  req.body.password = encryptPassword(req.body.password);
  const validate = v.validate(req.body, schema);

  if (validate.length) {
    return res.status(400).json(validate);
  }
  //   res.send("ok");
  const user = await User.create(req.body);
  const Role = await role.create({
    user_id: user.id,
    role: "hr",
  });

  res.json(user);
});

router.post("/register", async (req, res) => {
  //   res.send("ini adalah post");
  const schema = {
    nama: "string",
    foto: "string|optional",
    username: "string",
    password: "string",
    email: "string",
    nohp: "string",
    tgl_lahir: "string",
    domisili: "string",
    document: "string|optional",
  };

  req.body.password = encryptPassword(req.body.password);
  const validate = v.validate(req.body, schema);

  if (validate.length) {
    return res.status(400).json(validate);
  }

  const { email, username } = req.body;

  const validateEmail = await User.findOne({
    where: {
      [Op.or]: [{ username: username }, { email: email }],
    },
  });
  if (validateEmail) {
    return res.json({ message: "username/email already exsist!" });
  }

  //   res.send("ok");
  const user = await User.create(req.body);
  const Role = await role.create({
    user_id: user.id,
    role: "jobseeker",
  });

  res.json(user);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });

  // ambil role berdasarkan user id
  const Role = await role.findOne({ where: { user_id: user.id } });
  if (!user) {
    return res.status(422).json({ message: "password not found!" });
  }

  const isPasswordCorrect = await checkPassword(user.password, password);

  if (!isPasswordCorrect) {
    res.status(401).json({ message: "Password salah!" });
    return;
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: Role.role },
    "secret",
    {
      expiresIn: "10m",
    }
  );
  return res.status(200).json({
    message: "login successfully!",
    id: user.id,
    username: user.username,
    token,
  });
});

router.put(
  "/:id",
  authorize(["admin", "hr", "jobseeker"]),
  async (req, res) => {
    const id = req.params.id;
    //   res.send(id);
    //cek id di db
    let user = await User.findByPk(id);

    if (!user) {
      return res.json({ message: "user not found" });
    }
    //   res.send("ok");
    const schema = {
      nama: "string",
      foto: "string|optional",
      username: "string",
      password: "string",
      email: "string",
      nohp: "string",
      tgl_lahir: "string",
      domisili: "string",
      document: "string|optional",
    };

    const validate = v.validate(req.body, schema);

    if (validate.length) {
      return res.status(400).json(validate);
    }
    //   res.send("ok");
    user = await user.update(req.body);
    res.json(user);
  }
);

router.delete(
  "/:id",
  authorize(["admin", "hr", "jobseeker"]),
  async (req, res) => {
    const id = req.params.id;
    //   res.send(id);
    //cek id di db
    const user = await User.findByPk(id);

    if (!user) {
      return res.json({ message: "user not found" });
    }

    await user.destroy();

    res.json({
      message: "user deleted",
    });
  }
);

module.exports = router;
