const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  allMessage,
} = require("../controllers/messageControllers");

const router = express.Router();

router.route("/:chatId").get(protect, allMessage);
router.route("/").post(protect, sendMessage);

module.exports = router;
