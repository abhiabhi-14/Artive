import { Router } from "express";
import {
	allComments,
	createComment,
	updateComment,
	deleteComment,
	getCommentsForPost,
	deleteCommentAdmin,
} from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/post/:postId").get(verifyJWT, getCommentsForPost);

router.route("/all-comments").get(verifyJWT, isAdmin, allComments);

router.route("/create").post(verifyJWT, createComment);

router.route("/update/:commentId").patch(verifyJWT, updateComment);

router.route("/delete/:commentId").delete(verifyJWT, deleteComment);

router
	.route("/delete-admin/:commentId")
	.delete(verifyJWT, isAdmin, deleteCommentAdmin);

export default router;
