import { asyncHandler } from "../utils/AsyncHandler.js";
import { Event } from "../models/Event.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
	deleteFromCloudinary,
	uploadOnCloudinary,
} from "../utils/cloudinary.js";
import slugify from "slugify";
import mongoose from "mongoose";

const allEvents = asyncHandler(async (req, res) => {
	const pagination = req.query.pagination === "true";
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 9;
	const skip = (page - 1) * limit;

	const totalEvents = await Event.countDocuments();

	let pipeline = [{ $sort: { createdAt: -1, _id: -1 } }];

	if (pagination) {
		pipeline.push({ $skip: skip });
		pipeline.push({ $limit: limit });
	}

	const events = await Event.aggregate(pipeline);

	const response = {
		events,
		totalEvents,
	};

	if (pagination) {
		response.currentPage = page;
		response.totalPages = Math.ceil(totalEvents / limit);
	}

	return res
		.status(200)
		.json(new ApiResponse(200, response, "Events returned successfully"));
});

const getEvent = asyncHandler(async (req, res) => {
	const slug = req.params?.slug;
	const userId = req.user?._id || null;

	const pipeline = [
		{ $match: { slug } },
		{
			$lookup: {
				from: "likes",
				localField: "_id",
				foreignField: "event",
				as: "eventLikes",
			},
		},
		{
			$addFields: {
				likesCount: { $size: "$eventLikes" },
				isLiked: {
					$in: [
						new mongoose.Types.ObjectId(userId),
						"$eventLikes.userId",
					],
				},
			},
		},
		{
			$project: {
				_id: 1,
				name: 1,
				slug: 1,
				description: 1,
				rules: 1,
				teamSize: 1,
				venue: 1,
				dateOfEvent: 1,
				photos: 1,
				createdAt: 1,
				updatedAt: 1,
				likesCount: 1,
				isLiked: 1,
			},
		},
	];

	const result = await Event.aggregate(pipeline);

	if (result.length === 0) {
		throw new ApiError(404, "Event not found");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, result[0], "Fetched event successfully"));
});

const createEvent = asyncHandler(async (req, res) => {
	const { name, description, rules, teamSize, venue, dateOfEvent } = req.body;
	const imageLocalPaths = req.files.map((file) => file.path);

	if (!imageLocalPaths.length) {
		throw new ApiError(400, "At least one photo is required");
	}

	const imageCloudObjects = await Promise.all(
		imageLocalPaths.map((path) => uploadOnCloudinary(path))
	);
	const photos = imageCloudObjects.map((obj) => obj.url);

	if (!photos.length) {
		throw new ApiError(
			500,
			"Something went wrong while uploading images to Cloudinary"
		);
	}

	let slug = slugify(name, { lower: true, strict: true });

	let slugExists = await Event.findOne({ slug });
	let counter = 1;
	while (slugExists) {
		slug = `${slug}-${Date.now()}-${counter}`;
		slugExists = await Event.findOne({ slug });
		counter++;
	}

	const existingEvent = await Event.findOne({ name });

	if (existingEvent) {
		throw new ApiError(400, "Event with the same name already exists");
	}

	const event = await Event.create({
		name,
		slug,
		description,
		rules,
		teamSize,
		venue,
		dateOfEvent,
		photos,
	});

	return res
		.status(201)
		.json(new ApiResponse(201, event, "Event created successfully"));
});

const deleteEvent = asyncHandler(async (req, res) => {
	const eventId = req.params?.eventId;

	const deletedEvent = await Event.findByIdAndDelete(eventId);

	if (!deletedEvent) {
		throw new ApiError(404, "Event not found or already deleted");
	}

	const photos = deletedEvent.photos;
	await Promise.all(
		photos.map((photoUrl) => {
			const publicId = photoUrl.split("/").slice(-1)[0].split(".")[0];
			return deleteFromCloudinary(publicId);
		})
	);

	return res
		.status(200)
		.json(new ApiResponse(200, deletedEvent, "Event deleted successfully"));
});

const searchEvent = asyncHandler(async (req, res) => {
	const { searchString, startDate, endDate } = req.query;
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const skip = (page - 1) * limit;

	let pipeline = [{ $sort: { createdAt: -1, _id: -1 } }];

	if (searchString && searchString.trim().length > 0) {
		pipeline.push({
			$match: {
				$or: [
					{ name: { $regex: searchString, $options: "i" } },
					{ description: { $regex: searchString, $options: "i" } },
					{ slug: { $regex: searchString, $options: "i" } },
				],
			},
		});
	}

	if (startDate || endDate) {
		pipeline.push({
			$match: {
				dateOfEvent: {
					...(startDate && { $gte: new Date(startDate) }),
					...(endDate && { $lte: new Date(endDate) }),
				},
			},
		});
	}

	const totalEvents = await Event.aggregate([
		...pipeline,
		{ $count: "total" },
	]);
	pipeline.push({ $skip: skip });
	pipeline.push({ $limit: limit });

	const events = await Event.aggregate(pipeline);

	const response = {
		events,
		totalEvents: totalEvents[0]?.total || 0,
		currentPage: page,
		totalPages: Math.ceil((totalEvents[0]?.total || 0) / limit),
	};

	return res
		.status(200)
		.json(new ApiResponse(200, response, "Events returned successfully"));
});

export { allEvents, getEvent, createEvent, deleteEvent, searchEvent };
