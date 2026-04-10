import { Member } from "../models/members.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const getAllMembers = asyncHandler(async (req, res) => {
    const members = await Member.find().populate("photos");
    return res.status(200).json(new ApiResponse(200, members, "Members fetched successfully"));
});

const getMember = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const member = await Member.findOne({ userId }).populate("photos");
    if (!member) {
        throw new ApiError(404, "Member not found");
    }
    return res.status(200).json(new ApiResponse(200, member, "Member fetched successfully"));
});

const updateMember = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const updateData = req.body;
    const updatedMember = await Member.findOneAndUpdate({ userId }, updateData, { new: true }).populate("photos").catch(err => { throw new ApiError(404, err.message) });
    if (!updatedMember) {
        throw new ApiError(404, "Member not found");
    }
    return res.status(200).json(new ApiResponse(200, updatedMember, "Member updated successfully"));
});

const uploadProfilePhoto = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const imageLocalPath = req?.file?.path;
    if (!imageLocalPath) {
        throw new ApiError(400, "Profile photo is required");
    }

    const imageCloudObject = await uploadOnCloudinary(imageLocalPath);
    const imageCloudUrl = imageCloudObject?.url;
    if (!imageCloudUrl) {
        throw new ApiError(500, "Unable to upload image to Cloudinary");
    }

    const updatedMember = await Member.findOneAndUpdate(
        { userId },
        { profilePhoto: imageCloudUrl },
        { new: true }
    ).populate("photos");

    return res.status(200).json(new ApiResponse(200, updatedMember, "Profile photo uploaded successfully"));
});

const replaceProfilePhoto = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const member = await Member.findOne({ userId }).populate("photos");
    if (!member) {
        throw new ApiError(404, "Member not found");
    }

    const oldPhotoUrl = member.profilePhoto;
    const imageLocalPath = req?.file?.path;
    if (!imageLocalPath) {
        throw new ApiError(400, "Profile photo is required");
    }

    const imageCloudObject = await uploadOnCloudinary(imageLocalPath);
    const imageCloudUrl = imageCloudObject?.url;
    if (!imageCloudUrl) {
        throw new ApiError(500, "Unable to upload image to Cloudinary");
    }

    member.profilePhoto = imageCloudUrl;
    await member.save();

    if (oldPhotoUrl) {
        const publicId = oldPhotoUrl.split("/").slice(-1)[0].split(".")[0];
        if (publicId) {
            await deleteFromCloudinary(publicId);
        }
    }

    return res.status(200).json(new ApiResponse(200, member, "Profile photo replaced successfully"));
});

export {
    getAllMembers,
    getMember,
    updateMember,
    uploadProfilePhoto,
    replaceProfilePhoto,
};