import { Router } from "express";
import {
	likePhoto,
	unlikePhoto,
	likeEvent,
	unlikeEvent,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/photo/:photoId").post(verifyJWT, likePhoto);

router.route("/event/:eventId").post(verifyJWT, likeEvent);

router.route("/delete/photo/:photoId").delete(verifyJWT, unlikePhoto);

router.route("/delete/event/:eventId").delete(verifyJWT, unlikeEvent);

export default router;
