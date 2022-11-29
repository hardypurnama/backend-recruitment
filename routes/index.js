var express = require("express");
const { route } = require("./users");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/v1", (req, res) => {
  res.json({
    message: "hai nama saya hardy",
  });
});
module.exports = router;
