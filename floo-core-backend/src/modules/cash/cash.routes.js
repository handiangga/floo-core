const router = require("express").Router();
const controller = require("./cash.controller");

router.get("/", controller.getCash);

module.exports = router;
