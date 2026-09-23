const Resume = require('../models/resume');
const s3Service = require('./s3Service');
const generateS3Key = require('../utils/generate-s3Key');

const createUploadUrl = async ({ userId, fileName, fileSize }) => {
    const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || Number(process.env.MAX_RESUME_SIZE) || 5 * 1024 * 1024;

    if (!fileName || !fileName.toLowerCase().endsWith('.pdf')) {
        throw new Error('Invalid file type. Only PDF files are allowed.');
    }

    if (!fileSize || Number(fileSize) <= 0) {
        throw new Error('Invalid file size. File size must be greater than 0.');
    }

    if (!userId) {
        throw new Error('Invalid user ID. User ID is required.');
    }

    const parsedSize = Number(fileSize);
    if (parsedSize > MAX_FILE_SIZE) {
        throw new Error('File size exceeds the maximum limit of 5MB.');
    }

    const s3Key = generateS3Key(userId, fileName);
    const uploadUrl = await s3Service.generatePresignedUrl({ key: s3Key, action: 'upload' });

    const newResume = await Resume.create({
        userId,
        originalName: fileName,
        s3Key,
        status: 'PENDING',
        contentType: 'application/pdf',
        size: parsedSize
    });

    return {
        resumeId: newResume._id,
        uploadUrl,
    };
};

const confirmUpload = async ({ userId, resumeId }) => {
    const resumeRecord = await Resume.findOne({ _id: resumeId, userId });
    if (!resumeRecord) {
        throw new Error('Resume not found or access denied.');
    }

    if (resumeRecord.status !== 'PENDING') {
        throw new Error('Resume is not in a pending state. Cannot confirm upload.');
    }

    //verify that object exists in S3
    const metadata = await s3Service.getObjectMetadata({ key: resumeRecord.s3Key });
    if (!metadata) {
        throw new Error('Uploaded file not found in S3. Please try uploading again.');
    }

    // const parsedSize = Number(fileSize);
    // if (parsedSize > (Number(process.env.MAX_FILE_SIZE) || Number(process.env.MAX_RESUME_SIZE) || 5 * 1024 * 1024)) {
    //     throw new Error('File size exceeds the maximum limit of 5MB.');
    // }
    
    resumeRecord.status = 'UPLOADED';
    
    await resumeRecord.save();

    return resumeRecord;
};

const getResumDownloadUrl = async ({ userId, resumeId }) => {
    const resumeRecord = await Resume.findOne({ _id: resumeId, userId });
    if (!resumeRecord) {
        throw new Error('Resume not found or access denied.');
    }

    if (resumeRecord.status !== 'UPLOADED') {
        throw new Error('Resume is not yet uploaded. Please wait for the upload to complete.');
    }

    if (resumeRecord.size > (Number(process.env.MAX_FILE_SIZE) || Number(process.env.MAX_RESUME_SIZE) || 5 * 1024 * 1024)) {
        throw new Error('File size exceeds the maximum limit of 5MB.');
    }

    const downLoadUrl = await s3Service.generatePresignedUrl({ key: resumeRecord.s3Key, action: 'download' });

    return {
        downloadUrl: downLoadUrl,
        originalFileName: resumeRecord.originalName,
    };
};

module.exports = {
    createUploadUrl,
    confirmUpload,
    getResumDownloadUrl
};