import { asyncHandler } from "../utils/AsyncHandler.js";
import { Testimonial } from "../models/testimonial.models.js"; // Updated to Testimonial
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Fetch all testimonials
const allTestimonials = asyncHandler(async (req, res) => {
	const testimonials = await Testimonial.aggregate([
		{
			$sort: {
				updatedAt: -1,
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "name", // Referencing User in the 'name' field
				foreignField: "_id",
				as: "user",
			},
		},
		{
			$unwind: "$user",
		},
		{
			$project: {
				_id: 1,
				description: 1,
				profilePhoto: 1,
				displayed: 1,
				username: "$user.username",
				profilePhotoUrl: "$user.profilePhoto", // Assuming you have profile photo in the user model
			},
		},
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				testimonials,
				"All testimonials fetched successfully"
			)
		);
});

// Fetch testimonials for a user
const getTestimonialsForUser = asyncHandler(async (req, res) => {
	const userId = req.params?.userId;

	// Pagination parameters
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 2;
	const skip = (page - 1) * limit;

	const pipeline = [
		{
			$match: {
				name: new mongoose.Types.ObjectId(userId), // Match testimonials for this specific user
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "name",
				foreignField: "_id",
				as: "user",
			},
		},
		{
			$unwind: "$user",
		},
		{
			$project: {
				_id: 1,
				description: 1,
				profilePhoto: 1,
				displayed: 1,
				user: {
					_id: "$user._id",
					username: "$user.username",
					profilePhoto: "$user.profilePhoto", // Assuming user has a profile photo
				},
			},
		},
		{
			$sort: {
				createdAt: -1,
			},
		},
		{
			$skip: skip,
		},
		{
			$limit: limit,
		},
	];

	const testimonials = await Testimonial.aggregate(pipeline);

	// Get total count of testimonials for this user
	const totalTestimonials = await Testimonial.countDocuments({
		name: new mongoose.Types.ObjectId(userId),
	});

	const totalPages = Math.ceil(totalTestimonials / limit);

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				testimonials,
				currentPage: page,
				totalPages,
				totalTestimonials,
			},
			"Testimonials fetched successfully"
		)
	);
});

// Create a new testimonial
const createTestimonial = asyncHandler(async (req, res) => {
	const { description, userId, profilePhoto } = req.body;

	const testimonial = await Testimonial.create({
		name: userId, // Assuming the name field is the user who created the testimonial
		description,
		profilePhoto,
	});

	const createdTestimonial = await Testimonial.findById(testimonial?._id);

	if (!createdTestimonial) {
		throw new ApiError(
			500,
			"Something went wrong while creating the testimonial in the database"
		);
	}

	return res
		.status(201)
		.json(
			new ApiResponse(
				201,
				createdTestimonial,
				"Testimonial created Successfully"
			)
		);
});

// Delete a testimonial (user-specific)
const deleteTestimonial = asyncHandler(async (req, res) => {
	const testimonialId = req.params?.testimonialId;
	const userId = req.user._id;

	// Delete the testimonial in the database
	const deletedTestimonial = await Testimonial.findOneAndDelete({
		_id: testimonialId,
		name: userId, // Ensure the testimonial is deleted by the user who created it
	});

	if (!deletedTestimonial) {
		throw new ApiError(
			404,
			"Testimonial not found or not authorized to delete this testimonial"
		);
	}

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				deletedTestimonial,
				"Testimonial deleted successfully"
			)
		);
});

// Admin delete a testimonial (by admin)
const deleteTestimonialAdmin = asyncHandler(async (req, res) => {
	const testimonialId = req.params?.testimonialId;

	// Delete the testimonial in the database
	const deletedTestimonial = await Testimonial.findOneAndDelete({
		_id: testimonialId,
	});

	if (!deletedTestimonial) {
		throw new ApiError(404, "Testimonial not found");
	}

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				deletedTestimonial,
				"Testimonial deleted successfully"
			)
		);
});

export {
	getTestimonialsForUser,
	allTestimonials,
	createTestimonial,
	deleteTestimonial,
	deleteTestimonialAdmin,
};
