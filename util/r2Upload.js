const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const sharp = require('sharp');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  return `${timestamp}-${randomString}${ext}`;
};

const compressImage = async (fileBuffer, mimetype) => {
  try {
    const image = sharp(fileBuffer);
    const metadata = await image.metadata();

    let compressed = image;

    if (metadata.width > 1920) {
      compressed = compressed.resize(1920, null, { withoutEnlargement: true });
    }

    if (mimetype === 'image/png') {
      compressed = compressed.png({ quality: 80, compressionLevel: 9 });
    } else if (mimetype === 'image/webp') {
      compressed = compressed.webp({ quality: 80 });
    } else {
      compressed = compressed.jpeg({ quality: 80, progressive: true });
    }

    return await compressed.toBuffer();
  } catch (error) {
    console.error('Image compression error:', error);
    return fileBuffer;
  }
};

const uploadToR2 = async (file, folder = 'uploads') => {
  try {
    const fileName = generateFileName(file.originalname);
    const key = `${folder}/${fileName}`;

    let fileBuffer = file.buffer || fs.readFileSync(file.path);

    if (file.mimetype && file.mimetype.startsWith('image/')) {
      fileBuffer = await compressImage(fileBuffer, file.mimetype);
    }

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: file.mimetype,
      },
    });

    await upload.done();

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    
    return {
      success: true,
      url: publicUrl,
      key: key,
      fileName: fileName,
    };
  } catch (error) {
    console.error('R2 Upload Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const uploadMultipleToR2 = async (files, folder = 'uploads') => {
  try {
    const uploadPromises = files.map(file => uploadToR2(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('R2 Multiple Upload Error:', error);
    return [];
  }
};

const deleteFromR2 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return {
      success: true,
      message: 'File deleted successfully',
    };
  } catch (error) {
    console.error('R2 Delete Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const deleteMultipleFromR2 = async (keys) => {
  try {
    const deletePromises = keys.map(key => deleteFromR2(key));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('R2 Multiple Delete Error:', error);
    return [];
  }
};

const extractKeyFromUrl = (url) => {
  if (!url) return null;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (url.startsWith(publicUrl)) {
    return url.replace(`${publicUrl}/`, '');
  }
  return null;
};

module.exports = {
  uploadToR2,
  uploadMultipleToR2,
  deleteFromR2,
  deleteMultipleFromR2,
  extractKeyFromUrl,
  s3Client,
};