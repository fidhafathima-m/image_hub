import multer from "multer";
import path from "path";
import fs from  "fs";

// create directory named "uploads" if not there
const uploadDir = "uploads";
if(!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {recursive: true});
}

const storate = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const suffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + "-" + suffix + path.extname(file.originalname));
    }
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|png|jpg|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if(mimeType && extname) {
        return cb(null, true)
    } else {
        cb(new Error("Only image files are allowed"));
    }
}

export const upload = multer({
    storage: storate,
    limits: {fileSize: 5 * 1024 * 1024}, //5 mb
    fileFilter: fileFilter
})