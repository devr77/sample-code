const express = require("express");
const MiddleWare = require("../utils/LoginMiddleware");
const video = require("../controllers/VideoController");

const router = express.Router();

router.get("/create-token", video.createToken);
router.post("/create-meeting", video.createMeeting);
router.post("/validate-meeting", video.validateMeeting);

module.exports = router;
