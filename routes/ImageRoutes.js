const express = require("express");
const ImageController = require("../controllers/ImageController");
const router = express.Router();

router.post("/userImage", ImageController.uploadUserImage);
router.delete("/deleteUserImage/:filename", ImageController.deleteUserImage);

module.exports = router;
