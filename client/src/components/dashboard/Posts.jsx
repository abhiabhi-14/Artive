import React, { useState, useRef } from "react";
import { FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loading, Error, Input } from "../index";
import { format } from "date-fns";
import { allPosts, deletePost } from "../../api/posts";

const Posts = () => {
	const [showModal, setShowModal] = useState(false);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [selectedPostId, setSelectedPostId] = useState(null);
	const confirmationRef = useRef(null);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const {
		isLoading,
		isError,
		data: response,
		error,
	} = useQuery({
		queryKey: ["all-posts"],
		queryFn: allPosts,
		staleTime: 1000 * 60 * 5,
	});

	const { mutate: deletePostMutation, isPending: isDeleting } = useMutation({
		mutationFn: (postId) => deletePost(postId),
		onSuccess: () => {
			queryClient.refetchQueries(["posts"]);
			queryClient.invalidateQueries(["all-posts"]);
			queryClient.invalidateQueries(["all-comments"]);
			setShowModal(true);
			setTimeout(() => {
				setShowModal(false);
				setSelectedPostId(null);
			}, 2000);
		},
		onError: (error) => {
			console.error("Error deleting post:", error);
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

	const posts = response?.data?.data?.posts;

	const handleDelete = (postId) => {
		setSelectedPostId(postId);
		setShowConfirmationModal(true);
	};

	const handleConfirmDelete = () => {
		if (confirmationRef.current.value === "delete") {
			deletePostMutation(selectedPostId);
			setShowConfirmationModal(false);
		} else {
			alert("You need to type 'delete' to confirm.");
		}
	};

	return (
		<>
			{showModal && (
				<dialog id="delete_modal" className="modal modal-open">
					<div className="modal-box flex flex-col justify-center items-center">
						<FaCheckCircle className="text-4xl text-green-500 my-4" />
						<h1 className="text-2xl font-bold text-center">
							Post Deleted Successfully
						</h1>
					</div>
				</dialog>
			)}

			{showConfirmationModal && (
				<dialog className="modal modal-open">
					<div className="modal-box">
						<h3 className="font-bold text-lg">
							Please type "delete" to confirm deletion
						</h3>
						<div className="mt-4">
							<Input
								placeholder="Type 'delete' to confirm"
								className="mb-4"
								ref={confirmationRef}
							/>
							<div className="modal-action flex gap-x-4 justify-center">
								<button
									type="button"
									className="btn btn-error"
									onClick={handleConfirmDelete}
									disabled={isDeleting}>
									Delete Post
								</button>
								<button
									type="button"
									className="btn btn-warning"
									onClick={() =>
										setShowConfirmationModal(false)
									}>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</dialog>
			)}

			<div className="overflow-x-auto">
				<table className="table">
					<thead>
						<tr className="bg-base-200">
							<th>Date Updated</th>
							<th>Image</th>
							<th>Title</th>
							<th>Edit</th>
							<th>Delete</th>
						</tr>
					</thead>
					<tbody>
						{posts.map((post) => (
							<tr key={post._id} className="hover">
								<td>
									{format(
										new Date(post.updatedAt),
										"dd-MM-yyyy"
									)}
								</td>
								<td>
									<div className="w-16 h-16">
										<img
											src={post.featuredImage}
											alt={post.title}
											className="object-cover w-full h-full"
										/>
									</div>
								</td>
								<td>{post.title}</td>
								<td>
									<button
										className="btn btn-warning btn-sm"
										onClick={() =>
											navigate(`/add-update-post`, {
												state: { post },
											})
										}>
										<FaEdit />
									</button>
								</td>
								<td>
									<button
										className="btn btn-error btn-sm"
										onClick={() => handleDelete(post._id)}
										disabled={isDeleting}>
										<FaTrash />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
};

export default Posts;
