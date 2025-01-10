import { Router } from "express";
import {
	allTestamonials,
	createTestamonial,
	//updateTestamonial,
	deleteTestamonial,
	getTestamonialsForPost,
	deleteTestamonialAdmin,
} from "../controllers/Testamonial.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/post/:postId").get(verifyJWT, getTestamonialsForPost);

router.route("/all-Testamonials").get(verifyJWT, isAdmin, allTestamonials);

router.route("/create").post(verifyJWT, createTestamonial);

//router.route("/update/:TestamonialId").patch(verifyJWT, updateTestamonial);

router.route("/delete/:TestamonialId").delete(verifyJWT, deleteTestamonial);

router
	.route("/delete-admin/:TestamonialId")
	.delete(verifyJWT, isAdmin, deleteTestamonialAdmin);

export default router;
