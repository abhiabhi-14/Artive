import React, { useState } from "react";
import { FaRegHeart, FaHeart, FaEdit, FaTrash } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
	likeComment,
	unlikeComment,
} from "../../api/likes";
import { update, deleteComment } from "../../api/comments";

function CommentItem({ comment, onCommentDeleted }) {
	const [isEditing, setIsEditing] = useState(false);
	const queryClient = useQueryClient();
	const loggedInUser = useSelector((state) => state.auth.user);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			content: comment.content,
		},
	});

	const likeMutation = useMutation({
        mutationFn: likeComment,
        onSuccess: () => {
            comment.isLiked = true;
            comment.likesCount++;
        },
        onError: (error) => console.error("Comment liking failed:", error),
    });

    const unlikeMutation = useMutation({
        mutationFn: unlikeComment,
        onSuccess: () => {
            comment.isLiked = false;
            comment.likesCount--;
        },
        onError: (error) => console.error("Comment unliking failed:", error),
    });

	const editMutation = useMutation({
		mutationFn: ({commentId,data}) => update(data,commentId),
		onSuccess: (response) => {
			comment.content = response?.data?.data?.content;
			setIsEditing(false);
		},
		onError: (error) => console.error("Comment editing failed:", error),
	});

	const deleteMutation = useMutation({
		mutationFn: deleteComment,
		onSuccess: () => {
			onCommentDeleted(comment._id);
		},
		onError: (error) => console.error("Comment deletion failed:", error),
	});


	const handleLikeToggle = () => {
        if (comment.isLiked) {
            unlikeMutation.mutate(comment._id);
        } else {
            likeMutation.mutate(comment._id);
        }
    };

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
	};

	const onSubmit = (data) => {
		editMutation.mutate({ commentId: comment._id, data});
	};

	const handleDelete = () => {
		if (window.confirm("Are you sure you want to delete this comment?")) {
			deleteMutation.mutate(comment._id);
		}
	};

	const isCommentOwner =
		loggedInUser && loggedInUser._id === comment.user._id;

	return (
		<div className="rounded-lg bg-base-200 p-4 shadow">
			<div className="flex items-start gap-4">
				<div className="avatar h-10 w-10 shrink-0 border">
					<img
						src={comment.user.avatar || "/placeholder-user.jpg"}
						alt={comment.user.username}
					/>
				</div>
				<div className="flex-1">
					<div className="flex items-center justify-between">
						<div className="font-medium">
							@{comment.user.username}
						</div>
						<div className="text-sm text-muted">
							<time dateTime={comment.createdAt}>
								{new Date(
									comment.createdAt
								).toLocaleDateString()}
							</time>
						</div>
					</div>
					{isEditing ? (
						<form
							onSubmit={handleSubmit(onSubmit)}
							className="mt-2">
							<textarea
								{...register("content", {
									required: "Comment content is required",
									minLength: {
										value: 3,
										message:
											"Comment must be at least 3 characters long",
									},
								})}
								className="w-full max-w-lg h-24 max-h-32 p-2 border rounded-md"
							/>
							{errors.content && (
								<p className="text-red-500 text-sm mt-1">
									{errors.content.message}
								</p>
							)}
							<div className="mt-2">
								<button
									type="submit"
									disabled={editMutation.isPending}
									className="btn btn-primary btn-sm mr-2">
									Save
								</button>
								<button
									onClick={handleCancelEdit}
									type="button"
									className="btn btn-ghost btn-sm">
									Cancel
								</button>
							</div>
						</form>
					) : (
						<p className="mt-2">{comment.content}</p>
					)}
					<div className="text-sm text-muted mt-2 flex items-center">
						<button
							onClick={handleLikeToggle}
							disabled={
								likeMutation.isPending ||
								unlikeMutation.isPending
							}
							className="mr-4 inline-flex items-center">
							{comment.isLiked ? (
								<FaHeart className="text-red-500 mr-1" />
							) : (
								<FaRegHeart className="mr-1" />
							)}
							<span>{comment.likesCount} likes</span>
						</button>
						{isCommentOwner && (
							<>
								<button
									onClick={handleEdit}
									disabled={editMutation.isPending}
									className="mr-4 inline-flex items-center">
									<FaEdit className="mr-1" /> {editMutation.isPending ? "Editing..." : "Edit"}
								</button>
								<button
									onClick={handleDelete}
									disabled={deleteMutation.isPending}
									className="inline-flex items-center text-red-500">
									<FaTrash className="mr-1" /> {deleteMutation.isPending ? "Deleting..." : "Delete"}
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default CommentItem;
