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
	const outputFilePath = `${filePath}-compressed`; // Temporary file name for compressed image

	try {
		await sharp(filePath)
			.resize({ width: 800 }) // Resize the image to a width of 800px
			.jpeg({ quality: 70 }) // Compress the image to 70% quality if JPEG
			.toFile(outputFilePath); // Save to a temporary file

		// Replace the original file with the compressed one
		fs.renameSync(outputFilePath, filePath);

		return filePath;
	} catch (error) {
		// Clean up the temporary file in case of error
		if (fs.existsSync(outputFilePath)) {
			fs.unlinkSync(outputFilePath);
		}
		throw new ApiError(500, `Image compression error: ${error.message}`);
	}
};

const uploadOnCloudinary = async (localFilePath) => {
	try {
		if (!localFilePath) return null;

		// Compress the image before uploading
		await compressImage(localFilePath);

		// Upload the compressed file to Cloudinary
		const response = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "auto",
			asset_folder: 'mern-blog-users',
		});

		// File has been uploaded successfully
		fs.unlinkSync(localFilePath); // Delete the local file after upload
		return response;
	} catch (error) {
		fs.unlinkSync(localFilePath); // Remove the locally saved temporary file if upload fails
		throw new ApiError(500, `Cloudinary upload error: ${error.message}`);
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
