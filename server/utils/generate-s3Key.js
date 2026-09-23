const crypto = require('crypto');

const generateS3Key = (userId, fileName) => {
    const timestamp = Date.now();
    const id = crypto.randomUUID();
    const safeFileName = String(fileName || 'resume')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '')
        .replace(/\.pdf$/i, '');

    return `resumes/${userId}/${timestamp}-${id}-${safeFileName}.pdf`;
};

module.exports = generateS3Key;