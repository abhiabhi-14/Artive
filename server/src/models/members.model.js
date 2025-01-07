import mongoose, { Schema } from "mongoose";
import { Photo } from "./photo.model";

const memberSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
			min: 3,
			max: 500,
		},
		profilePhoto: {
			type: String,
			required: true,
		},
		photos: {
			type: [Schema.Types.ObjectId],
			ref: "Photo",
		},
		displayed: {
			type: Boolean,
			required: true,
			default: false,
		},
		role: {
			type: String,
			enum: ["year1", "year2", "year3", "coordinator"],
			default: "member1",
		},
	},
	{
		timestamps: true,
	}
);

memberSchema.pre(
	"deleteOne",
	{ document: true, query: false },
	async function (next) {
		try {
			await Photo.deleteMany({
				$or: [{ author: this._id }],
			});
			next();
		} catch (err) {
			next(err);
		}
	}
);

export const Member = mongoose.model("Member", memberSchema);
