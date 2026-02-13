import api from './api';

/**
 * Handles the 3-step upload process:
 * 1. Get Presigned PUT URL
 * 2. Upload File to Cloud
 * 3. Get Public/Presigned GET URL
 * * @param {File | Blob} file - The file object to upload
 * @param file
 * @param {string} category - Folder name (e.g., "PO_1002" or "Louis_Signature")
 * @param {string} ownerId - ID of the user or entity owning the file
 * @param {string} customFileName - Optional specific filename
 */
export const uploadFile = async (file, category, ownerId, customFileName = null) => {
    try {
        // 1. Generate Filename
        const fileExtension = file.type.split('/')[1] || 'jpg';
        const fileName = customFileName || `upload_${Date.now()}.${fileExtension}`;

        // 2. Request Upload URL (Presigned PUT)
        const presignRes = await api.post('/api/storage/presign-put', {
            fileName: fileName,
            contentType: file.type,
            category: category,
            ownerId: ownerId
        });

        const uploadUrl = presignRes.data.putUrl || presignRes.data.uploadUrl;
        const objectKey = presignRes.data.objectKey || presignRes.data.key;

        if (!uploadUrl) throw new Error("Backend did not return an upload URL");

        // 3. Upload to Storage (Direct to Backblaze/S3)
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type
            }
        });

        if (!uploadRes.ok) throw new Error('Cloud storage rejected the upload');

        // 4. Get Viewable URL (Presigned GET)
        const getRes = await api.get('/api/storage/presign-get', {
            params: { objectKey }
        });

        // Handle inconsistent return formats (string vs object)
        const publicUrl = typeof getRes.data === 'string' ? getRes.data : Object.values(getRes.data)[0];

        return {
            url: publicUrl,
            key: objectKey
        };

    } catch (error) {
        console.error("StorageService Error:", error);
        throw error;
    }
};

export default { uploadFile };