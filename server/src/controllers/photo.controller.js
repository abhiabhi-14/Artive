import { asyncHandler } from "../utils/AsyncHandler.js";
import { Photo } from "../models/photo.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
	deleteFromCloudinary,
	uploadOnCloudinary,
} from "../utils/cloudinary.js";
import slugify from "slugify";
import mongoose from "mongoose";

const allPhoto = asyncHandler(async (req, res) => {
	const pagination = req.query.pagination === "true";
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 9;
	const skip = (page - 1) * limit;

	const totalPhoto = await Photo.countDocuments();

	let pipeline = [
		{
			$sort: {
				createdAt: -1,
				_id: -1,
			},
		},
	];

	if (pagination){
		pipeline.push({ $skip: skip });
		pipeline.push({ $limit: limit });
	}

	const photos = await Photo.aggregate(pipeline);

	const response = {
		photos,
		totalPhoto,
	};

	if (pagination) {
		response.currentPage = page;
		response.totalPages = Math.ceil(totalPhoto / limit);
	}

	return res
		.status(200)
		.json(new ApiResponse(200, response, "Photos returned successfully"));
});



const getPhoto = asyncHandler(async (req, res) => {
    const photoId = req.params.id;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
        throw new ApiError(400, "Invalid photo ID");
    }

    const pipeline = [
        // Match the specific photo by ID
        {
            $match: { _id: new mongoose.Types.ObjectId(photoId) },
        },
        // Lookup likes for the photo
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "photo",
                as: "photoLikes",
            },
        },
        // Add fields for likes count and isLiked
        {
            $addFields: {
                likesCount: { $size: "$photoLikes" },
                isLiked: {
                    $in: [
                        new mongoose.Types.ObjectId(userId),
                        "$photoLikes.user",
                    ],
                },
            },
        },
        // Project to shape the final photo data
        {
            $project: {
                _id: 1,
                imgUrl: 1,
				author:1,
                content: 1,
				displayed:1,
                createdAt: 1,
                updatedAt: 1,
                likesCount: 1,
                isLiked: 1,
            },
        },
    ];

    const result = await Photo.aggregate(pipeline);

    if (result.length === 0) {
        throw new ApiError(404, "Photo not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result[0], "Fetched photo successfully"));
});


const createPhoto = asyncHandler(async (req, res) => {
    const { content ,displayed} = req.body;
    const authorId = req.user?._id; // Assuming user is authenticated

    // Ensure a file is uploaded
    const imageLocalPath = req?.file?.path;
    if (!imageLocalPath){
        throw new ApiError(400, "Photo image is required");
    }

    // Upload image to Cloudinary
    const imageCloudObject = await uploadOnCloudinary(imageLocalPath);
    const imageCloudUrl = imageCloudObject?.url;

    if (!imageCloudUrl) {
        throw new ApiError(500, "Failed to upload image on Cloudinary");
    }

    // Create new photo document
    const photo = await Photo.create({
        imgUrl: imageCloudUrl,
		author: authorId,
        content,
        displayed,
    });

    // Fetch the created photo with populated author details
    const createdPhoto = await Photo.findById(photo._id).populate(
        "author",
        "username email"
    );

    if (!createdPhoto) {
        throw new ApiError(500, "Failed to save photo in the database");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdPhoto, "Photo uploaded successfully"));
});

// const updatePostData = asyncHandler(async (req, res) => {
// 	const { title, timeToRead, content } = req.body;

// 	const tags = req?.body?.tags?.split(",");
// 	const postId = req.params?.postId;

// 	let updateData = {
// 		...(timeToRead && { timeToRead }),
// 		...(content && { content }),
// 		...(tags && { tags }),
// 	};

// 	if (title) {
// 		updateData.title = title;

// 		// Generate new slug if title is updated
// 		let newSlug = slugify(title, { lower: true, strict: true });

// 		// Check if new slug already exists and make it unique if necessary
// 		let slugExists = await Post.findOne({
// 			slug: newSlug,
// 			_id: { $ne: postId },
// 		});
// 		let counter = 1;
// 		while (slugExists) {
// 			newSlug = `${newSlug}-${Date.now()}-${counter}`;
// 			slugExists = await Post.findOne({
// 				slug: newSlug,
// 				_id: { $ne: postId },
// 			});
// 			counter++;
// 		}

// 		updateData.slug = newSlug;
// 	}

// 	const post = await Post.findByIdAndUpdate(postId, updateData, {
// 		new: true,
// 	});

// 	if (!post) {
// 		throw new ApiError(404, "Post not found");
// 	}

// 	// Return updated post
// 	return res
// 		.status(200)
// 		.json(new ApiResponse(200, post, "Post updated successfully"));
// });

// const updatePostImage = asyncHandler(async (req, res) => {
// 	// get new avatar file -> error
// 	// upload new on cloudinary -> error
// 	// update in the database
// 	// delete prev from db
// 	const postId = req.params?.postId;

// 	const newImageLocalPath = req?.file?.path;

// 	if (!newImageLocalPath) {
// 		throw new ApiError(400, "new image file required");
// 	}

// 	const newImageCloudObject = await uploadOnCloudinary(newImageLocalPath);

// 	const newImageCloudUrl = newImageCloudObject?.url;
// 	// const newAvatarPublicId = newAvatarCloudObject?.public_id;

// 	if (!newImageCloudUrl) {
// 		throw new ApiError(
// 			500,
// 			"unable to upload new image file on cloudinary"
// 		);
// 	}

// 	const post = await Post.findByIdAndUpdate(postId, {
// 		$set: {
// 			featuredImage: newImageCloudUrl,
// 		},
// 	});

// 	const oldImageUrl = post.featuredImage;
// 	const publicId = oldImageUrl
// 		? oldImageUrl.split("/").slice(-1)[0].split(".")[0]
// 		: null;

// 	await deleteFromCloudinary(publicId);

// 	post.featuredImage = newImageCloudUrl;

// 	return res
// 		.status(200)
// 		.json(new ApiResponse(200, post, "post image changed successfully"));
// });

const deletePhoto = asyncHandler(async (req, res) => {
	const photoId = req.params?.photoId;
	// Find and delete the post
	const deletedPhoto = await Photo.findByIdAndDelete(photoId);

	if (!deletedPhoto) {
		throw new ApiError(
			404,
			"Post does not exist or something went wrong while deleting the post"
		);
	}
	// Extract image URL and public ID
	const imageUrl = deletedPhoto.imgUrl;
	const publicId = imageUrl
		? imageUrl.split("/").slice(-1)[0].split(".")[0]
		: null;

	// Delete the image from Cloudinary
	if (publicId) {
		await deleteFromCloudinary(publicId);
	}
	else
	{
		throw new ApiError(500, "Failed to delete image from Cloudinary");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, deletedPhoto, "Post deleted successfully"));
});

// const searchPost = asyncHandler(async (req, res) => {
// 	const { searchString, startDate, endDate } = req.query;
// 	const page = parseInt(req.query.page) || 1;
// 	const limit = parseInt(req.query.limit) || 10;
// 	const skip = (page - 1) * limit;

// 	let pipeline = [
// 		{
// 			$sort: {
// 				createdAt: -1,
// 				_id: -1,
// 			},
// 		},
// 	];

// 	// Match stage for search query and date filter
// 	if (searchString && searchString.trim().length > 0) {
// 		pipeline.push({
// 			$match: {
// 				$or: [
// 					{ title: { $regex: searchString, $options: "i" } },
// 					{ tags: { $regex: searchString, $options: "i" } },
// 					{ slug: { $regex: searchString, $options: "i" } },
// 				],
// 			},
// 		});
// 	}

// 	if (startDate || endDate) {
// 		pipeline.push({
// 			$match: {
// 				createdAt: {
// 					...(startDate && { $gte: new Date(startDate) }),
// 					...(endDate && { $lte: new Date(endDate) }),
// 				},
// 			},
// 		});
// 	}

// 	// Count total posts
// 	const totalPosts = await Post.aggregate([...pipeline, { $count: "total" }]);

// 	// Pagination stages
// 	pipeline.push({ $skip: skip });
// 	pipeline.push({ $limit: limit });

// 	const posts = await Post.aggregate(pipeline);

// 	const response = {
// 		posts,
// 		totalPosts: totalPosts[0]?.total || 0,
// 		currentPage: page,
// 		totalPages: Math.ceil((totalPosts[0]?.total || 0) / limit),
// 	};

// 	return res
// 		.status(200)
// 		.json(new ApiResponse(200, response, "Posts returned successfully"));
// });

export {
	allPhoto,
	getPhoto,
	createPhoto,
	deletePhoto
};
