import { asyncHandler } from "../utils/AsyncHandler.js";
import { Testimonial } from "../models/testimonial.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
	deleteFromCloudinary,
	uploadOnCloudinary,
	extractPublicId,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

// Fetch all testimonials (admin only)
const allTestimonials = asyncHandler(async (req, res) => {
	const testimonials = await Testimonial.aggregate([
		{ $sort: { updatedAt: -1 } },
		{
			$lookup: {
				from: "users",
				localField: "name",
				foreignField: "_id",
				as: "user",
			},
		},
		{ $unwind: "$user" },
		{
			$project: {
				_id: 1,
				description: 1,
				profilePhoto: 1,
				displayed: 1,
				username: "$user.username",
			},
		},
	]);

	return res
		.status(200)
		.json(new ApiResponse(200, testimonials, "All testimonials fetched successfully"));
});

// Fetch testimonials for a specific user
// FIX: Route was /post/:postId but controller read req.params?.userId → always undefined
//      Route is now /user/:userId so this correctly resolves
const getTestimonialsForUser = asyncHandler(async (req, res) => {
	const userId = req.params?.userId; // FIX: was req.params?.userId on wrong param name

	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 2;
	const skip = (page - 1) * limit;

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		throw new ApiError(400, "Invalid user ID");
	}

	const pipeline = [
		{ $match: { name: new mongoose.Types.ObjectId(userId) } },
		{
			$lookup: {
				from: "users",
				localField: "name",
				foreignField: "_id",
				as: "user",
			},
		},
		{ $unwind: "$user" },
		{
			$project: {
				_id: 1,
				description: 1,
				profilePhoto: 1,
				displayed: 1,
				user: { _id: "$user._id", username: "$user.username" },
			},
		},
		{ $sort: { createdAt: -1 } },
		{ $skip: skip },
		{ $limit: limit },
	];

	const testimonials = await Testimonial.aggregate(pipeline);
	const totalTestimonials = await Testimonial.countDocuments({
		name: new mongoose.Types.ObjectId(userId),
	});

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				testimonials,
				currentPage: page,
				totalPages: Math.ceil(totalTestimonials / limit),
				totalTestimonials,
			},
			"Testimonials fetched successfully",
		),
	);
});

// Create a new testimonial
const createTestimonial = asyncHandler(async (req, res) => {
	const userId = req.user?._id;
	const { description } = req.body;

	const imageLocalPath = req?.file?.path;
	if (!imageLocalPath) {
		throw new ApiError(400, "Profile photo is required");
	}

	const imageCloudObject = await uploadOnCloudinary(imageLocalPath);
	const imageCloudUrl = imageCloudObject?.url;
	if (!imageCloudUrl) {
		throw new ApiError(500, "Failed to upload image on Cloudinary");
	}

	const testimonial = await Testimonial.create({
		name: userId,
		description,
		profilePhoto: imageCloudUrl,
	});

	const createdTestimonial = await Testimonial.findById(testimonial._id).populate(
		"name",
		"username email",
	);

	if (!createdTestimonial) {
		throw new ApiError(500, "Something went wrong while saving the testimonial");
	}

	return res
		.status(201)
		.json(new ApiResponse(201, createdTestimonial, "Testimonial created successfully"));
});

// Delete own testimonial
// FIX: Route param was :TestimonialId (capital T) but controller read req.params?.testimonialId
//      → param was always undefined → findOneAndDelete never matched → always 404
//      Route is now /delete/:testimonialId so this correctly resolves
const deleteTestimonial = asyncHandler(async (req, res) => {
	const testimonialId = req.params?.testimonialId; // FIX: now matches route param
	const userId = req.user._id;

	const deletedTestimonial = await Testimonial.findOneAndDelete({
		_id: testimonialId,
		name: userId,
	});

	if (!deletedTestimonial) {
		throw new ApiError(404, "Testimonial not found or not authorized to delete");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, deletedTestimonial, "Testimonial deleted successfully"));
});

// Admin delete testimonial
// FIX: consistent lowercase param name now
const deleteTestimonialAdmin = asyncHandler(async (req, res) => {
	const testimonialId = req.params?.testimonialId; // FIX: lowercase, matches updated route

	const deletedTestimonial = await Testimonial.findOneAndDelete({ _id: testimonialId });

	if (!deletedTestimonial) {
		throw new ApiError(404, "Testimonial not found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, deletedTestimonial, "Testimonial deleted successfully"));
});

export {
	getTestimonialsForUser,
	allTestimonials,
	createTestimonial,
	deleteTestimonial,
	deleteTestimonialAdmin,
};
