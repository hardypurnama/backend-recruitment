var express = require("express");
const { Op } = require("sequelize");
var router = express.Router();
var { authorize } = require("../middleware/authorize");
const upload = require("../controllers/upload");
const Validator = require("fastest-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "postmessage"
);
//untuk memanggil nama
const { User, role } = require("../models");
const user = require("../models/user");
// const role = require("../models/role");

const v = new Validator();
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
console.log(process.env.EMAIL_PASSWORD, process.env.EMAIL_USER);
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

  const { email, username, url } = req.body;

  const validateEmail = await User.findOne({
    where: {
      [Op.or]: [{ username: username }, { email: email }],
    },
  });
  if (validateEmail) {
    return res.json({ message: "username/email already exsist!" });
  }

  const token = jwt.sign({ email: email }, "secret", {
    expiresIn: "1h",
  });

  // send the user an email with the new password
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    text: `Click this link to verify your email: https://${url + token}`,
  };
  transport.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });

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

router.post("/reset-password", async (req, res) => {
  // check for validation errors

  // find the user with the provided email
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user) {
    return res.status(400).json({ errors: [{ msg: "User not found" }] });
  }

  // generate a new password and hash it
  const newPassword = Math.random().toString(36).slice(-8);
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // update the user's password
  await user.update({ password: passwordHash });

  // generate a JWT with the user's id and email
  const payload = {
    user: {
      id: user.id,
      email: user.email,
    },
  };
  const token = jwt.sign(payload, "secrets", {
    expiresIn: "1h",
  });

  // send the user an email with the new password
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Password reset",
    text: `Your new password is ${newPassword}. You can use this password to log in to your account.`,
  };
  transport.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });

  res.json({ msg: "Password reset successful" });
});

router.post("/google", async (req, res) => {
  const userProfile = await oAuth2Client
    .verifyIdToken({
      idToken: req.body.credentials,
      audience: req.body.clientId,
    })
    .getPayload();

  const user = await User.create({
    nama: userProfile.name,
    foto: userProfile.picture,
    username: userProfile.sub,
    password: userProfile.sub,
    email: userProfile.email,
    nohp: "0",
    tgl_lahir: "2000-01-01",
    domisili: "-",
    document: "",
  });
  const Role = await role.create({
    user_id: user.id,
    role: "jobseeker",
  });

  res.json(user);
});

router.post("/verify/:token", async (req, res) => {
  // check for validation errors
  const email = jwt.verify(req.params.token, "secret");
  // find the user with the provided email
  const user = await User.findOne({ where: { email: email.email } });
  const verified = await user.update({ verified: true });
  if (!user) {
    return res.status(400).json({ errors: [{ msg: "User not found" }] });
  }
  if (!verified) {
    return res.status(400).json({ errors: [{ msg: "Email not verified!" }] });
  }
  res.json({ msg: "email verified!" });
});

module.exports = router;
