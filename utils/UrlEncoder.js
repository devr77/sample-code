const crypto = require("crypto");
const algo = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const text = "Encrypted Messaged";
exports.Encoder = async function () {
  let cipher = crypto.createCipheriv(algo, key, iv);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  console.log("Encrypted message : " + encrypted);
  const decipher = crypto.createDecipheriv(algo, key, iv);
  let decryptedData = decipher.update(encrypted, "hex", "utf-8");
  decryptedData += decipher.final("utf8");
  console.log("Decrypted message: " + decryptedData);
};
