import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.models.js";
import { Post } from "../models/post.models.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Dashboard route
const fetchDashboardData = asyncHandler(async (req, res) => {
	const [userCount, commentCount, postCount] = await Promise.all([
		User.aggregate([{ $count: "totalUsers" }]),
		Comment.aggregate([{ $count: "totalComments" }]),
		Post.aggregate([{ $count: "totalPosts" }]),
	]);
	
	// Fetch recent data
	const recentUsers = await User.aggregate([
		{ $sort: { createdAt: -1 } },
		{ $limit: 5 },
		{ $project: { _id: 1, username: 1, email: 1 } },
	]);

	const recentComments = await Comment.aggregate([
		{
			$sort: {
				createdAt: -1,
			},
		},
		{ $limit: 5 },
		{
			$lookup: {
				from: "users",
				localField: "userId",
				foreignField: "_id",
				as: "user",
			},
		},
		{
			$lookup: {
				from: "posts",
				localField: "postId",
				foreignField: "_id",
				as: "post",
			},
		},
		{
			$unwind: "$user",
		},
		{
			$unwind: "$post",
		},
		{
			$project: {
				_id: 1,
				content: 1,
				createdAt: 1,
				updatedAt: 1,
				postId: 1,
				username: "$user.username",
				postTitle: "$post.title",
			},
		},
	]);

	const recentPosts = await Post.aggregate([
		{ $sort: { createdAt: -1 } },
		{ $limit: 5 },
		{ $project: { _id: 1, title: 1, author: 1 } },
	]);


	return res.status(200).json(
		new ApiResponse(
			200,
			{
				userCount: userCount[0]?.totalUsers || 0,
				commentCount: commentCount[0]?.totalComments || 0,
				postCount: postCount[0]?.totalPosts || 0,
				recentUsers,
				recentComments,
				recentPosts,
			},
			"Dashboard data fetched successfully"
		)
	);
});

export { fetchDashboardData };
