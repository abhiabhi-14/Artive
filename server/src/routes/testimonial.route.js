import { Router } from "express";
import {
	allTestimonials,
	createTestimonial,
	//updateTestimonial,
	deleteTestimonial,
	getTestimonialsForUser,
	deleteTestimonialAdmin,
} from "../controllers/testimonials.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/post/:postId").get(verifyJWT, getTestimonialsForUser);

router.route("/all-Testimonials").get(verifyJWT, isAdmin, allTestimonials);

router.route("/create").post(verifyJWT,upload.single("image"),createTestimonial);

//router.route("/update/:TestimonialId").patch(verifyJWT, updateTestimonial);

router.route("/delete/:TestimonialId").delete(verifyJWT, deleteTestimonial);

router
	.route("/delete-admin/:TestimonialId")
	.delete(verifyJWT, isAdmin, deleteTestimonialAdmin);

export default router;
