import { asyncHandler } from "../utils/AsyncHandler";
import { Like } from "../models/likes.model";
import { Photo } from "../models/photo.model";
import { Event } from "../models/event.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const likePhoto = asyncHandler(async (req, res) => {
	const photoId = req.params?.photoId; // Consistent parameter naming
	const userId = req.user._id; // Assuming user ID is attached to req.user

	const photo = await Photo.findById(photoId);
	if (!photo) {
		throw new ApiError(404, "Photo not found");
	}

	const existingLike = await Like.findOne({ photoId, userId });
	if (existingLike) {
		throw new ApiError(400, "You have already liked the photo");
	}

	const like = await Like.create({ photoId, userId });

	return res.status(201).json(new ApiResponse(201, like, "Like created"));
});

const likeEvent = asyncHandler(async (req, res) => {
	const eventId = req.params?.eventId; // Consistent parameter naming
	const userId = req.user._id;

	const event = await Event.findById(eventId);
	if (!event) {
		throw new ApiError(404, "Event not found");
	}

	const existingLike = await Like.findOne({ eventId, userId });
	if (existingLike) {
		throw new ApiError(400, "You have already liked the event");
	}

	const like = await Like.create({ eventId, userId });

	return res.status(201).json(new ApiResponse(201, like, "Like created"));
});

const unlikePhoto = asyncHandler(async (req, res) => {
	const photoId = req.params?.photoId; // Consistent parameter naming
	const userId = req.user._id;

	const like = await Like.findOneAndDelete({ photoId, userId });
	if (!like) {
		throw new ApiError(404, "Like not found or not authorized");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, like, "Like on photo deleted successfully"));
});

const unlikeEvent = asyncHandler(async (req, res) => {
	const eventId = req.params?.eventId; // Consistent parameter naming
	const userId = req.user._id;

	const like = await Like.findOneAndDelete({ eventId, userId });
	if (!like) {
		throw new ApiError(404, "Like not found or not authorized");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, like, "Like on event deleted successfully"));
});

export { likePhoto, unlikePhoto, likeEvent, unlikeEvent };
