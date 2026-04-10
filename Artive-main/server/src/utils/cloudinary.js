import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { ApiError } from "./ApiError.js";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to compress the image before uploading
const compressImage = async (filePath) => {
	const outputFilePath = `${filePath}-compressed`;

	try {
		await sharp(filePath)
			.resize({ width: 800 })
			.jpeg({ quality: 70 })
			.toFile(outputFilePath);

		fs.renameSync(outputFilePath, filePath);
		return filePath;
	} catch (error) {
		if (fs.existsSync(outputFilePath)) {
			fs.unlinkSync(outputFilePath);
		}
		throw new ApiError(500, `Image compression error: ${error.message}`);
	}
};

const uploadOnCloudinary = async (localFilePath) => {
	try {
		if (!localFilePath) return null;

		await compressImage(localFilePath);

		const response = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "auto",
			asset_folder: "mern-blog-users",
		});

		fs.unlinkSync(localFilePath);
		return response;
	} catch (error) {
		if (fs.existsSync(localFilePath)) {
			fs.unlinkSync(localFilePath);
		}
		throw new ApiError(500, `Cloudinary upload error: ${error.message}`);
	}
};

/**
 * FIX: Correctly extract Cloudinary public ID including asset_folder prefix.
 *
 * Cloudinary URL format:
 *   https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{name}.{ext}
 *
 * Old (broken) code:  imageUrl.split("/").slice(-1)[0].split(".")[0]
 *   → Returns only "name", ignores folder prefix → destroy() always gets "not found"
 *
 * Correct approach: extract everything between /upload/v{version}/ and the file extension.
 */
export const extractPublicId = (imageUrl) => {
	if (!imageUrl) return null;
	try {
		// Split on "/upload/" to isolate the path after the upload marker
		const afterUpload = imageUrl.split("/upload/")[1];
		if (!afterUpload) return null;

		// Strip leading version segment like "v1234567890/"
		const withoutVersion = afterUpload.replace(/^v\d+\//, "");

		// Strip the file extension (.jpg, .png, .webp, etc.)
		const publicId = withoutVersion.replace(/\.[^/.]+$/, "");

		return publicId; // e.g. "mern-blog-users/photo_abc123"
	} catch {
		return null;
	}
};

const deleteFromCloudinary = async (publicId) => {
	try {
		if (!publicId) return null;
		const result = await cloudinary.uploader.destroy(publicId);
		return result;
	} catch (error) {
		throw new ApiError(500, `Cloudinary delete error: ${error.message}`);
	}
};

export { uploadOnCloudinary, deleteFromCloudinary };
