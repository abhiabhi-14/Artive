import { Router } from "express";
import {
	likePhoto,
	unlikePhoto,
	likeEvent,
	unlikeEvent,
} from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/post/:eventId").post(verifyJWT, likeEvent);

router.route("/comment/:photoId").post(verifyJWT, likePhoto);

router.route("/delete/comment/:photoId").delete(verifyJWT, unlikePhoto);

router.route("/delete/post/:eventId").delete(verifyJWT, unlikeEvent);

export default router;
