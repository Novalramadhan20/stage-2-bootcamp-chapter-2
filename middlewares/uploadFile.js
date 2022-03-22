const multer = require('multer'); //memanggil patch multer
// mengarahkan destinasi penyimpanan yang akan dipakai
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); //mengganti nama file berdasarkan waktu upload
  },
});

const upload = multer({ storage: storage });

module.exports = upload;