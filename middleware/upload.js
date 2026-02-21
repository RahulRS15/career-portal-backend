const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// ─── Storage config ──────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination(_req, file, cb) {
    let folder = 'uploads/misc';
    if (file.fieldname === 'profilePhoto') folder = 'uploads/avatars';
    if (file.fieldname === 'resume')       folder = 'uploads/resumes';
    if (file.fieldname === 'logo')         folder = 'uploads/logos';
    ensureDir(folder);
    cb(null, folder);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only images, PDFs and Word documents are allowed'));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
