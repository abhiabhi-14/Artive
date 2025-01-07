import { Router } from "express";
import {
	likePost,
	likeComment,
	unlikeComment,
	unlikePost,
} from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/post/:postId").post(verifyJWT, likePost);

router.route("/comment/:commentId").post(verifyJWT, likeComment);

router.route("/delete/comment/:commentId").delete(verifyJWT, unlikeComment);

router.route("/delete/post/:postId").delete(verifyJWT, unlikePost);

export default router;
