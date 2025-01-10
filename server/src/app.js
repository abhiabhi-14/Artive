import { errorMiddleware } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

const app = express();

//? CORS config
const corsOptions = {
	origin: process.env.ALLOWED_ORIGINS,
	credentials: process.env.CREDENTIALS === "true",
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));

//? cookie parser config to read cookies
app.use(cookieParser());

//? config for data recieved in the requests
app.use(express.json({ limit: "160kb" }));
app.use(express.urlencoded({ extended: true, limit: "160kb" }));
app.use(express.static("public"));

app.get("/", (req, res) => {
	res.send("API is running....");
});

// !routes import
import userRoutes from "./routes/user.routes.js";
import photoRoutes from "./routes/photo.route.js";
import eventRoutes from './routes/event.route.js';
import testimonialRoutes from './routes/testimonial.route.js';
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import likeRoutes from "./routes/like.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

// !routes declare
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/photo", photoRoutes);
app.use("/api/v1/event", eventRoutes);
app.use("/api/v1/testimonial", testimonialRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use(errorMiddleware);

export { app };
