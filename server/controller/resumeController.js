const {
    createUploadUrl,
    getResumDownloadUrl,
    confirmUpload: confirmResumeUpload
} = require('../services/resumeService');



const getUploadUrl = async (req, res, next) => {
    try {
        const body = req.body || {};
        const { fileName, fileSize } = body;
        const userId = req.user?.userId || req.user?.id;

        if (!userId || !fileName || !fileSize) {
            return res.status(400).json({ error: 'Missing required parameters: fileName, fileSize, and valid auth token' });
        }

        const uploadData = await createUploadUrl({ userId, fileName, fileSize });
        return res.status(200).json(uploadData);
    } catch (error) {
        console.error('Upload URL error:', error);
        return res.status(400).json({ error: error.message });
    }
};


//confirm upload and save resume metadata
const confirmUploadHandler = async (req, res, next) => {
    try {
        // const body = req.body || {};
        // const { fileName, fileSize } = body;
        const { resumeId } = req.params;
        const userId = req.user?.userId || req.user?.id;

        if (!userId || !resumeId) {
            return res.status(400).json({ error: 'Missing required parameters: resumeId and valid auth token' });
        }

        const resume = await confirmResumeUpload({ userId, resumeId });
        return res.status(200).json({
            success: true,
            message: "Upload confirmed successfully.",
            resume: {
                id: resume._id,
                fileName: resume.originalName,
                size: resume.size,
                status: resume.status
            }
        });
    } catch (error) {
        console.error('Confirm upload error:', error);
        next(error); // Pass the error to the next middleware for centralized error handling
    }
};

//download a resume

const downLoadResume = async (req, res, next) => {
    try {
        const { resumeId } = req.params;
        const userId = req.user?.userId || req.user?.id;

        if (!resumeId) {
            return res.status(400).json({ error: 'Missing required parameter: resumeId' });
        }
        if (!userId) {
            return res.status(400).json({ error: 'Missing required parameter: userId from auth token' });
        }

        const downLoadData = await getResumDownloadUrl({ userId, resumeId });
        return res.status(200).json(downLoadData);
    } catch (error) {
        console.error('Download URL error:', error);
        return res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getUploadUrl,
    downLoadResume,
    confirmUploadHandler
};