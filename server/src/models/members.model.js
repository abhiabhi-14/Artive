import mongoose from "mongoose";
import { Photo } from "./photo.model.js";

const memberSchema = mongoose.Schema(
	{	
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		name: {
			type: String,
		},
		description: {
			type: String,
		},
		profilePhoto: {
			type: String,
		},
		photos: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Photo",
			}
		],
		displayed: {
			type: Boolean,
			default: false,
		},
		role: {
			type: String,
			enum: {
				values: ["default", "year1", "year2", "year3", "coordinator"],
				message: "Invalid role. Must be one of: default, year1, year2, year3, coordinator",
			},
			default: "default",
		}
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
            await Photo.deleteMany({ member: this._id });
            next();
        } catch (err) {
            next(err);
        }
    }
);

export const Member = mongoose.model("Member", memberSchema);
