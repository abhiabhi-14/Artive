import { asyncHandler } from "../utils/AsyncHandler.js";
import { Photo } from "../models/photo.model.js";
import { Member } from "../models/members.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

// const allPhoto = asyncHandler(async (req, res) => {
//     const pagination = req.query.pagination === "true";
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 9;
//     const skip = (page - 1) * limit;

//     const totalPhoto = await Photo.countDocuments({event: null });

//     let pipeline = [
//         {
//             $match: {
//                 event: null,
//             },
//         },
//         {
//             $sort: {
//                 createdAt: -1,
//                 _id: -1,
//             },
//         },
//     ];

//     if (pagination) {
//         pipeline.push({ $skip: skip });
//         pipeline.push({ $limit: limit });
//     }

//     const photos = await Photo.aggregate(pipeline);

//     const response = {
//         photos,
//         totalPhoto,
//     };

//     if (pagination) {
//         response.currentPage = page;
//         response.totalPages = Math.ceil(totalPhoto / limit);
//     }

//     return res
//         .status(200)
//         .json(new ApiResponse(200, response, "Photos returned successfully"));
// });
const allPhoto = asyncHandler(async (req, res) => {
    const pagination = req.query.pagination === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const userId = req.user?._id;

    const totalPhoto = await Photo.countDocuments({ member: { $ne: null }, event: null });

    let pipeline = [
        {
            $match: {
                member: { $ne: null },
                event: null,
            },
        },
        {
            $sort: {
                createdAt: -1,
                _id: -1,
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "photo",
                as: "photoLikes",
            },
        },
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
        {
            $project: {
                _id: 1,
                imgUrl: 1,
                author: 1,
                content: 1,
                displayed: 1,
                createdAt: 1,
                updatedAt: 1,
                likesCount: 1,
                isLiked: 1,
            },
        },
    ];

    if (pagination) {
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
        {
            $match: {
                _id: new mongoose.Types.ObjectId(photoId),
                event: null,
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "photo",
                as: "photoLikes",
            },
        },
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
        {
            $project: {
                _id: 1,
                imgUrl: 1,
                author: 1,
                content: 1,
                displayed: 1,
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
    const { content, displayed } = req.body;
    const userId = req.user?._id;
    const member = await Member.findOne({ userId });
    if (!member)
    {
        throw new ApiError(404, "Be a Member to upload a photo");
    }

    const imageLocalPath = req?.file?.path;
    if (!imageLocalPath) {
        throw new ApiError(400, "Photo image is required");
    }

    const imageCloudObject = await uploadOnCloudinary(imageLocalPath);
    const imageCloudUrl = imageCloudObject?.url;

    if (!imageCloudUrl) {
        throw new ApiError(500, "Failed to upload image on Cloudinary");
    }

    const photo = await Photo.create({
        imgUrl: imageCloudUrl,
        content,
        displayed,
        member: member?._id,
        event: null,
    });
    member.photos.push(photo._id);
    await member.save();
    const createdPhoto = await Photo.findById(photo._id).populate(
        "member",
    );

    if (!createdPhoto) {
        throw new ApiError(500, "Failed to save photo in the database");
    }
    return res
        .status(201)
        .json(new ApiResponse(201, createdPhoto, "Photo uploaded successfully"));
});

const deletePhoto = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const photoId = req.params?.photoId;
    const member =  await Member.findOne({ userId });
    const photo = await Photo.findOne({ _id: photoId});
    if(!photo){
        throw new ApiError(404, "Photo not found");
    }
    if(!member){
        throw new ApiError(404, "You are not a member to delete a photo");
    }
    if(photo.member.toString()!== member._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this photo");
    }
    const deletedPhoto = await Photo.findOneAndDelete({
        _id: photoId,
    });
    member.photos = member.photos.filter(photo => photo.toString() !== photoId);
    await member.save();
    if (!deletedPhoto) {
        throw new ApiError(
            404,
            "Photo does not exist or something went wrong while deleting the photo"
        );
    }

    const imageUrl = deletedPhoto.imgUrl;
    const publicId = imageUrl
        ? imageUrl.split("/").slice(-1)[0].split(".")[0]
        : null;

    if (publicId) {
        await deleteFromCloudinary(publicId);
    } else {
        throw new ApiError(500, "Failed to delete image from Cloudinary");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedPhoto, "Photo deleted successfully"));
});

export {
    allPhoto,
    getPhoto,
    createPhoto,
    deletePhoto,
};