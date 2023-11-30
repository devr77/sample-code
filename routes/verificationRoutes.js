const express = require("express");
const Verification = require("../controllers/VerificationController");

const router = express.Router();

router.post("/send-verify-token", Verification.SendVerifyToken);
router.post("/send-token", Verification.VerifyToken);

module.exports = router;
