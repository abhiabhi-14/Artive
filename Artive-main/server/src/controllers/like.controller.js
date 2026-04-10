import { asyncHandler } from "../utils/AsyncHandler.js";
import { Likes } from "../models/likes.model.js";
import { Photo } from "../models/photo.model.js";
import { Event } from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ─────────────────────────────────────────────────────────
// BUG FIXES in this file:
//
// ORIGINAL likePhoto():
//   findOne({ userId, photoId })        ← fields don't exist in Likes schema
//   Schema fields are: user, photo, event  (NOT userId / photoId / eventId)
//   Result: existingLike was always null → unlimited duplicate likes
//
// ORIGINAL likeEvent():
//   findOne({ eventId, userId })        ← wrong field names
//   create({ eventId, userId })         ← wrong field names → likes saved with null values
//
// ORIGINAL unlikeEvent():
//   findOneAndDelete({ eventId, userId }) ← wrong field names → always returned 404
// ─────────────────────────────────────────────────────────

const likePhoto = asyncHandler(async (req, res) => {
	const photoId = req.params?.photoId;
	const userId = req.user._id;

	const photo = await Photo.findById(photoId);
	if (!photo) {
		throw new ApiError(404, "Photo not found");
	}

	// FIX: use correct field names matching the Likes schema: { user, photo }
	const existingLike = await Likes.findOne({ user: userId, photo: photoId });
	if (existingLike) {
		throw new ApiError(400, "You have already liked this photo");
	}

	// FIX: create with correct field names
	const like = await Likes.create({ user: userId, photo: photoId });

	return res.status(201).json(new ApiResponse(201, like, "Like created"));
});

const likeEvent = asyncHandler(async (req, res) => {
	const eventId = req.params?.eventId;
	const userId = req.user._id;

	const event = await Event.findById(eventId);
	if (!event) {
		throw new ApiError(404, "Event not found");
	}

	// FIX: use correct field names matching the Likes schema: { user, event }
	const existingLike = await Likes.findOne({ event: eventId, user: userId });
	if (existingLike) {
		throw new ApiError(400, "You have already liked this event");
	}

	// FIX: create with correct field names
	const like = await Likes.create({ event: eventId, user: userId });

	return res.status(201).json(new ApiResponse(201, like, "Like created"));
});

const unlikePhoto = asyncHandler(async (req, res) => {
	const photoId = req.params?.photoId;
	const userId = req.user._id;

	// This was already correct
	const like = await Likes.findOneAndDelete({ photo: photoId, user: userId });
	if (!like) {
		throw new ApiError(404, "Like not found or not authorized");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, like, "Like on photo removed successfully"));
});

const unlikeEvent = asyncHandler(async (req, res) => {
	const eventId = req.params?.eventId;
	const userId = req.user._id;

	// FIX: use correct field names: { event, user } instead of { eventId, userId }
	const like = await Likes.findOneAndDelete({ event: eventId, user: userId });
	if (!like) {
		throw new ApiError(404, "Like not found or not authorized");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, like, "Like on event removed successfully"));
});

export { likePhoto, unlikePhoto, likeEvent, unlikeEvent };
