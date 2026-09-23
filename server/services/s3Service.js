const { PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;

const generatePresignedUrl = async ({ key, action = 'upload' }) => {
    if (!BUCKET_NAME) {
        throw new Error('AWS_BUCKET_NAME is not configured.');
    }

    if (!key) {
        throw new Error('S3 key is required.');
    }

    const command = action === 'download'
        ? new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key })
        : new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: 'application/pdf'
        });

    return getSignedUrl(s3Client, command, { expiresIn: 300 });
};

const generateUploadUrl = async ({ key }) => generatePresignedUrl({ key, action: 'upload' });
const generateDownloadUrl = async ({ key }) => generatePresignedUrl({ key, action: 'download' });

const getObjectMetadata = async ({ key }) => {
    if (!BUCKET_NAME) {
        throw new Error('AWS_BUCKET_NAME is not configured.');
    }

    if (!key) {
        throw new Error('S3 key is required.');
    }

    const command = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    });
    return s3Client.send(command);
};

const getObject = async ({ key }) => {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    });
    return s3Client.send(command);
};

module.exports = {
    generatePresignedUrl,
    generateUploadUrl,
    generateDownloadUrl,
    getObjectMetadata,
    getObject
};