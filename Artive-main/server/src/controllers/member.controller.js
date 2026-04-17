import { Member } from "../models/members.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
	uploadOnCloudinary,
	deleteFromCloudinary,
	extractPublicId,
} from "../utils/cloudinary.js";

const getAllMembers = asyncHandler(async (req, res) => {
	const members = await Member.find().populate("photos");
	return res
		.status(200)
		.json(new ApiResponse(200, members, "Members fetched successfully"));
});

const getMember = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const member = await Member.findOne({ userId }).populate("photos");
	if (!member) {
		throw new ApiError(404, "Member not found");
	}
	return res
		.status(200)
		.json(new ApiResponse(200, member, "Member fetched successfully"));
});

const createMember = asyncHandler(async (req, res) => {
  const { userId, name, description, displayed, role } = req.body;
  const imageLocalPath = req?.file?.path;

  if (!name || !description) {
    throw new ApiError(400, "Member name and description are required");
  }

  let profilePhotoUrl = req.body.profilePhoto || null;
  if (imageLocalPath) {
    const imageCloudObject = await uploadOnCloudinary(imageLocalPath);
    profilePhotoUrl = imageCloudObject?.url;
    if (!profilePhotoUrl) {
      throw new ApiError(500, "Unable to upload image to Cloudinary");
    }
  }

  const newMember = await Member.create({
    userId,
    name,
    description,
    profilePhoto: profilePhotoUrl,
    displayed: displayed ?? false,
    role: role ?? "default",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newMember, "Member created successfully"));
});

const updateMember = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const updateData = req.body;
	const updatedMember = await Member.findOneAndUpdate(
		{ userId },
		updateData,
		{ new: true },
	)
		.populate("photos")
		.catch((err) => {
			throw new ApiError(400, err.message);
		});

	if (!updatedMember) {
		throw new ApiError(404, "Member not found");
	}
	return res
		.status(200)
		.json(new ApiResponse(200, updatedMember, "Member updated successfully"));
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
		{ new: true },
	).populate("photos");

	return res
		.status(200)
		.json(new ApiResponse(200, updatedMember, "Profile photo uploaded successfully"));
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
		// FIX: use extractPublicId() which correctly handles asset_folder prefix
		// OLD: oldPhotoUrl.split("/").slice(-1)[0].split(".")[0]
		//   → stripped folder path → Cloudinary destroy() silently returned "not found"
		const publicId = extractPublicId(oldPhotoUrl);
		if (publicId) {
			await deleteFromCloudinary(publicId);
		}
	}

	return res
		.status(200)
		.json(new ApiResponse(200, member, "Profile photo replaced successfully"));
});
	
export {
	getAllMembers,
	getMember,
	updateMember,
	uploadProfilePhoto,
	replaceProfilePhoto,
	createMember,
};
