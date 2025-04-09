import React from "react";
import { FaTrash } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loading, Error } from "../index";
import { format } from "date-fns";
import { allComments, deleteCommentAdmin } from "../../api/comments";

const Comments = () => {
	const queryClient = useQueryClient();

	// Fetch all comments
	const {
		isLoading,
		isError,
		data: response,
		error,
	} = useQuery({
		queryKey: ["all-comments"],
		queryFn: allComments,
		staleTime: 1000 * 60 * 5,
	});

	const { mutate: deleteComment, isPending: isDeleting } = useMutation({
		mutationFn: deleteCommentAdmin,
		onSuccess: (response) => {
			let postId = response?.data?.data?.postId;
			queryClient.refetchQueries("all-comments");
			queryClient.invalidateQueries(["comments", postId]);
		},
	});

	if (isLoading) {
		return (
			<div className="w-full h-[80vh] flex justify-center items-center">
				<Loading className="w-20" />
			</div>
		);
	}

	if (isError) {
		console.error(error);
		return <Error />;
	}

	const comments = response?.data?.data;

	// Delete comment handler
	const handleDelete = (commentId) => {
		deleteComment(commentId);
	};

	return (
		<div className="overflow-x-auto min-h-screen">
			<table className="table">
				<thead>
					<tr className="bg-base-200">
						<th>Date Updated</th>
						<th>Content</th>
						<th>Post Title</th>
						<th>Username</th>
						<th>Delete</th>
					</tr>
				</thead>
				<tbody>
					{comments.map((comment) => (
						<tr key={comment._id} className="hover">
							<td>
								{format(
									new Date(comment.updatedAt),
									"dd-MM-yyyy"
								)}
							</td>
							<td>{comment.content}</td>
							<td>{comment.postTitle}</td>
							<td>{comment.username}</td>
							<td>
								<button
									className="btn btn-error btn-sm"
									onClick={() => handleDelete(comment._id)}
									disabled={isDeleting}>
									<FaTrash />
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default Comments;
