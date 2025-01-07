import { Router } from "express";
import {
	allPosts,
	getPost,
	createPost,
	updatePostData,
	updatePostImage,
	deletePost,
	searchPost,
} from "../controllers/post.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.midleware.js";

const router = Router();

router.route("/all-posts").get(verifyJWT, allPosts);

router.route("/get-post/:slug").get(verifyJWT, getPost);

router
	.route("/create")
	.post(verifyJWT, isAdmin, upload.single("image"), createPost);

router.route("/update-data/:postId").patch(verifyJWT, isAdmin, updatePostData);

router
	.route("/update-image/:postId")
	.patch(verifyJWT, isAdmin, upload.single("image"), updatePostImage);

router.route("/delete/:postId").delete(verifyJWT, isAdmin, deletePost);

router.route("/search").get(verifyJWT, searchPost);

export default router;
