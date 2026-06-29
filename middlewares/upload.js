import mime from "mime";
import multer from "multer";
import { v7 as UUIDV7 } from "uuid";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/media/");
  },
  filename: function (req, file, cb) {
    cb(null, UUIDV7() + "." + mime.getExtension(file.mimetype));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

export default upload;
