const multer = require("multer"); //modul untuk handle upload
const storage = multer.memoryStorage(); // menyimpan file upload sementara di system

const uploadMiddleware = multer({ storage }).single("image"); //config middleware untuk handle upload 1 image
const dataUri = (req) => {
  // mengambil file dari url buffer, karena file bisa di convert ke sebuah url dengan tipe base64
  const fileBase64 = req.file.buffer.toString("base64");
  return `data:${req.file.mimetype};base64,${fileBase64}`;
};

module.exports = {
  uploadMiddleware,
  dataUri,
};
