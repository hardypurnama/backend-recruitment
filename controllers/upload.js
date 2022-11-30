const { cloudinaryConfig, uploader } = require("../config/cloudinary");
const { dataUri, uploadMiddleware } = require("../middleware/uploadMiddleware");

module.exports = {
  onUpload(req, res) {
    uploadMiddleware(req, res, (err) => {
      const file = dataUri(req);
      uploader
        .upload(file, (err, result) => {
          if (err) {
            // console.log(err)
            throw new Error("Gagal Upload!");
          }

          res.status(200).json({
            message: "image uploaded!",
            data: result.url,
          });
        })
        .catch((err) =>
          res.status(400).json({
            message: "someting went wrong while processing your request",
            data: {
              err,
            },
          })
        );
    });
  },
};
