import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		postId: {
			type: Schema.Types.ObjectId,
			ref: "Post",
			required: true,
		},
		content: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

export const Comment = mongoose.model("Comment", commentSchema);
// match , sort ,