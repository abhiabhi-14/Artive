import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CommentItem from "./CommentItem";
import { useSelector } from "react-redux";
import { Loading, Error } from "../index";
import { getCommentsForPost, create, update } from "../../api/comments";

function CommentSection({ postId }) {
	const [page, setPage] = useState(1);
	const limit = 4; // Adjust as needed
	const [allComments, setAllComments] = useState([]);
	const [successMessage, setSuccessMessage] = useState(false);
	const user = useSelector((state) => state.auth.user);
	const queryClient = useQueryClient();

	// Fetch comments query
	const {
		data: response,
		error,
		isLoading,
		isError,
		isFetching,
	} = useQuery({
		queryKey: ["comments", postId, page],
		queryFn: () => getCommentsForPost(postId, page, limit),
		staleTime: 1000 * 60 * 5,
		keepPreviousData: true, // Keep old data while new data is loading
	});

	// Handle comment form submission
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm();

	const {
		mutate,
		isPending,
		isError: isFormError,
	} = useMutation({
		mutationFn: create,

		onSuccess: (response) => {
			let newComment = response?.data?.data;
			const newCommentData = {
				_id: newComment._id,
				content: newComment.content,
				createdAt: newComment.createdAt,
				updatedAt: newComment.updatedAt,
				user: {
					_id: user._id,
					avatar: user.avatar,
					username: user.username, // Replace with actual username
				},
				likesCount: 0,
				isLiked: false,
			};

			setAllComments((prevComments) => [newCommentData, ...prevComments]);

			// Success: no additional action needed as we already updated the UI optimistically
			setSuccessMessage(true);
			// Hide success message after 1 second
			setTimeout(() => setSuccessMessage(false), 1000);
			reset(); // Reset the form
		},
		onError: (error, newComment, context) => {
			// Rollback optimistic update
			setAllComments((prevComments) =>
				prevComments.filter(
					(comment) => comment._id !== context.newCommentData._id
				)
			);
			console.error("Comment adding failed:", error);
		},
	});

	const onSubmit = (formData) => {
		const newFormData = { postId, content: formData.content };
		mutate(newFormData);
	};

	// Update comments when response changes
	useEffect(() => {
		if (response?.data?.data?.comments) {
			const newComments = response?.data?.data?.comments || [];
			setAllComments((prevComments) => {
				// Use a Map to avoid adding duplicate comments
				const uniqueComments = new Map();
				[...prevComments, ...newComments].forEach((comment) =>
					uniqueComments.set(comment._id, comment)
				);
				return Array.from(uniqueComments.values());
			});
		}
	}, [response]);

	const loadMoreComments = () => {
		if (!isFetching) setPage((prevPage) => prevPage + 1);
	};

	const handleCommentDeleted = (deletedCommentId) => {
		// Optimistically update the UI
		setAllComments((oldData) => {
			return oldData.filter(
				(comment) => comment._id !== deletedCommentId
			);
		});

	};
	return (
		<div>
			{/* Comment Form */}
			<form onSubmit={handleSubmit(onSubmit)} className="mb-6">
				{successMessage && (
					<p className="alert alert-success my-4">
						Comment posted successfully!
					</p>
				)}
				<div className="mb-4">
					<textarea
						{...register("content", {
							required: "Comment is required",
							maxLength: {
								value: 300, // Set your desired max length here
								message: "Comment cannot exceed 200 characters", // Custom error message
							},
						})}
						className="w-full max-w-lg h-24 max-h-32 p-2 border rounded-md" // Control width and height
						placeholder="Add a comment..."
						disabled={isPending} // Disable textarea during submission
					></textarea>
					{errors.content && (
						<p className="text-red-500">{errors.content.message}</p>
					)}
				</div>
				<button
					type="submit"
					className="px-4 py-2 bg-primary text-primary-content rounded-md hover:bg-primary-focus"
					disabled={isPending}>
					{isPending ? "Posting..." : "Post Comment"}
				</button>

				{isFormError && (
					<p className="alert alert-error mt-4">
						Failed to post comment. Please try again.
					</p>
				)}
			</form>

			{/* Comment List */}
			<div className="space-y-4">
				{isLoading && page === 1 ? (
					<Loading />
				) : isError ? (
					<Error error={error} />
				) : (
					allComments.map((comment) => (
						<CommentItem
							key={comment._id}
							comment={comment}
							onCommentDeleted={handleCommentDeleted}
						/>
					))
				)}
				{isFetching && <Loading />}
				{response?.data?.data?.currentPage <
					response?.data?.data?.totalPages && (
					<button
						onClick={loadMoreComments}
						disabled={isFetching}
						className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
						{isFetching ? "Loading more..." : "Show More"}
					</button>
				)}
			</div>
		</div>
	);
}

export default CommentSection;
