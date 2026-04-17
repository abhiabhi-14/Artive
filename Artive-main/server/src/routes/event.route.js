import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

import {
	allEvents,
	getEvent,
	createEvent,
	deleteEvent,
	searchEvent,
} from "../controllers/event.controller.js";

const router = Router();

// Route to get all events
router.route("/all-events").get(allEvents);

// Route to get a single event by slug
router.route("/get-events/:slug").get(getEvent);

// Route to create a new event (admin only)
router
	.route("/create")
	.post(verifyJWT, isAdmin, upload.array("image", 5), createEvent);

// Route to delete an event by ID (admin only)
router.route("/delete/:eventId").delete(verifyJWT, isAdmin, deleteEvent);

// Route to search events
router.route("/search").get(searchEvent);

export default router;
