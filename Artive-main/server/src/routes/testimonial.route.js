// ─── FIXED: testimonial.route.js ─────────────────────────
//
// BUG 1: Route param casing mismatch on user-delete route
//   OLD:  DELETE /delete/:TestimonialId
//   Controller read: req.params?.testimonialId   (lowercase t)
//   Express is case-sensitive → testimonialId was always undefined → always 404
//   FIX:  Rename param to :testimonialId (lowercase) on both routes for consistency
//
// BUG 2: getTestimonialsForUser route param name mismatch
//   OLD route:  GET /post/:postId
//   Controller: req.params?.userId               (reads "userId" not "postId")
//   FIX:  Change route param to :userId  (it logically queries by userId anyway)
// ─────────────────────────────────────────────────────────

import { Router } from "express";
import {
	allTestimonials,
	createTestimonial,
	deleteTestimonial,
	getTestimonialsForUser,
	deleteTestimonialAdmin,
} from "../controllers/testimonials.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// FIX: changed :postId → :userId so controller's req.params?.userId resolves
router.route("/user/:userId").get(getTestimonialsForUser);

router.route("/all-Testimonials").get(allTestimonials);

router.route("/create").post(verifyJWT, upload.single("image"), createTestimonial);

// FIX: changed :TestimonialId → :testimonialId (lowercase) to match controller read
router.route("/delete/:testimonialId").delete(verifyJWT, deleteTestimonial);

router
	.route("/delete-admin/:testimonialId")
	.delete(verifyJWT, isAdmin, deleteTestimonialAdmin);

export default router;
