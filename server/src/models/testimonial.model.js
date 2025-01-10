import mongoose from "mongoose";

const testimonialSchema = mongoose.Schema(
	{
		name: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		description: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 200,
		},
		profilePhoto: {
			type: String,
			required: true,
		},
		displayed: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
