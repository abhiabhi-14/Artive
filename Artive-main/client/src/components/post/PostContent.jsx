import React, { useState } from "react";
import { FaRegCalendarAlt, FaRegHeart, FaHeart } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { likePost, unlikePost } from "../../api/likes"; // Adjust the import paths as needed

function PostContent({ post }) {
	const [isLiked, setIsLiked] = useState(post.isLiked);
	const [likesCount, setLikesCount] = useState(post.likesCount);

	const likeMutation = useMutation({
		mutationFn: likePost,
		onSuccess: () => {
			setIsLiked(true);
			setLikesCount(likesCount + 1);
		},
		onError: (error) => console.error("Post liking failed:", error),
	});

	const unlikeMutation = useMutation({
		mutationFn: unlikePost,
		onSuccess: () => {
			setIsLiked(false);
			setLikesCount(likesCount - 1);
		},
		onError: (error) => console.error("Post unliking failed:", error),
	});

	const handleLikeToggle = () => {
		if (isLiked) {
			unlikeMutation.mutate(post._id);
		} else {
			likeMutation.mutate(post._id);
		}
	};

	return (
		<div className="space-y-4 my-10">
			<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
				{post.title}
			</h1>
			<div className="flex max-md:flex-col md:items-center md:space-x-4 text-sm text-muted">
				<div>
					<FaRegCalendarAlt className="md:mr-1 inline-block h-4 w-4" />
					<time dateTime={post.createdAt}>
						{new Date(post.createdAt).toLocaleDateString()}
					</time>
				</div>
				<div>
					<FaRegCalendarAlt className="md:mr-1 inline-block h-4 w-4" />
					<time dateTime={post.updatedAt}>
						Updated on {new Date(post.updatedAt).toLocaleDateString()}
					</time>
				</div>
				<div>
					<button
						onClick={handleLikeToggle}
						disabled={likeMutation.isPending || unlikeMutation.isPending}
						className="inline-flex items-center">
						{isLiked ? (
							<FaHeart className="text-red-500" />
						) : (
							<FaRegHeart />
						)}
						<span className="ml-1">{likesCount} likes</span>
					</button>
				</div>
			</div>
			<p dangerouslySetInnerHTML={{ __html: post.content }}></p>
		</div>
	);
}

export default PostContent;
