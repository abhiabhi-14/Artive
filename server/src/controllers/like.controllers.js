import { asyncHandler } from "../utils/AsyncHandler.js";
import { Like } from "../models/like.models.js";
import { Post } from "../models/post.models.js";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Like a post
const likePost = asyncHandler(async (req, res) => {
	const postId = req.params?.postId;
	const userId = req.user._id;

	// Check if the post exists
	const post = await Post.findById(postId);
	if (!post) {
		throw new ApiError(404, "Post not found");
	}

	// Check if the like already exists
	const existingLike = await Like.findOne({ postId, userId });
	if (existingLike) {
		return res
			.status(400)
			.json(new ApiError(400, "You have already liked this post"));
	}

	// Create a new like
	const like = await Like.create({ postId, userId });

	return res
		.status(201)
		.json(new ApiResponse(201, like, "Like created successfully"));
});

// Like a comment
const likeComment = asyncHandler(async (req, res) => {
	const commentId = new mongoose.Types.ObjectId(req.params?.commentId);
	const userId = new mongoose.Types.ObjectId(req.user._id);

	// Check if the comment exists
	const comment = await Comment.findById(commentId);
	if (!comment) {
		throw new ApiError(404, "Comment not found");
	}

	// Check if the like already exists
	const existingLike = await Like.findOne({ commentId, userId });
	if (existingLike) {
		return res
			.status(400)
			.json(new ApiError(400, "You have already liked this comment"));
	}

	// Create a new like
	const like = await Like.create({ commentId, userId });

	return res
		.status(201)
		.json(new ApiResponse(201, like, "Like created successfully"));
});

// Unlike a Post
const unlikePost = asyncHandler(async (req, res) => {
	const postId = new mongoose.Types.ObjectId(req.params.postId);
	const userId = req.user._id;

	// Find and delete the like for the post
	const like = await Like.findOneAndDelete({
		postId,
		userId,
	});
	if (!like) {
		throw new ApiError(
			404,
			"Like not found or not authorized to delete this like"
		);
	}

	return res
		.status(200)
		.json(new ApiResponse(200, like, "Like on post deleted successfully"));
});

// Unlike a Comment
const unlikeComment = asyncHandler(async (req, res) => {
	const commentId = new mongoose.Types.ObjectId(req.params.commentId);
	const userId = req.user._id;

	// Find and delete the like for the comment
	const like = await Like.findOneAndDelete({ commentId, userId});
	if (!like) {
		throw new ApiError(
			404,
			"Like not found or not authorized to delete this like"
		);
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, like, "Like on comment deleted successfully")
		);
});

export { likeComment, likePost, unlikePost, unlikeComment };
