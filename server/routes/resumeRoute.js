const express = require('express');

const router = express.Router();
const { getUploadUrl, downLoadResume, confirmUploadHandler } = require('../controller/resumeController');
const { authenticate } = require('../middleware/auth');

router.post('/upload', authenticate, getUploadUrl);
router.get('/download/:resumeId', authenticate, downLoadResume);
router.post('/confirm-upload/:resumeId', authenticate, confirmUploadHandler);

module.exports = router;