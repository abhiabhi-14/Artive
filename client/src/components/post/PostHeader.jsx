import React, { useState, useRef } from "react";
import { FaRegClock, FaCheckCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost } from "../../api/posts";
import {BackButton, Input} from "../index"; // Assuming your Input component is correctly imported

function PostHeader({ post }) {
	const user = useSelector((state) => state.auth.user);
	const isAdmin = user?.role === "admin";
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [showModal, setShowModal] = useState(false);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const confirmationRef = useRef(""); // useRef to handle the confirmation input

	const { mutate, isPending, isError, error } = useMutation({
		mutationFn: deletePost,
		onSuccess: (response) => {
			queryClient.refetchQueries(["posts"]);
			queryClient.invalidateQueries("all-posts");
			queryClient.invalidateQueries("all-comments");
			setShowModal(true);
			setTimeout(() => {
				setShowModal(false);
				navigate("/all-posts");
			}, 2000);
		},
	});

	const handleDelete = () => {
		setShowConfirmationModal(true);
	};

	const handleConfirmDelete = () => {
		if (confirmationRef.current.value === "delete") {
			mutate(post._id);
			setShowConfirmationModal(false);
			confirmationRef.current.value = ""; // Reset the ref value after deletion
		} else {
			alert("You need to type 'delete' to confirm.");
		}
	};

	return (
		<div className="relative mb-8 overflow-hidden rounded-xl mx-auto">
			{isAdmin && (
				<div className="flex gap-x-4 my-4 justify-end relative">
					<BackButton className="absolute -left-3 -top-5"/>
					<div
						className="btn btn-sm btn-outline btn-accent"
						onClick={() => {
							navigate(`/add-update-post`, { state: { post } });
						}}>
						Edit
					</div>
					<div
						className="btn btn-sm btn-outline btn-error"
						onClick={handleDelete}
						disabled={isPending}
						>
						Delete
					</div>

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
										ref={confirmationRef} // Use ref here
									/>
									<div className="modal-action flex gap-x-4 justify-center">
										<button
											type="button"
											className="btn btn-error"
											onClick={handleConfirmDelete}
											disabled={isPending}
											>
											{isPending ? "Deleting..." : "Confirm"}
										</button>
										<button
											type="button"
											className="btn btn-warning"
											onClick={() => setShowConfirmationModal(false)}>
											Cancel
										</button>
									</div>
								</div>
							</div>
						</dialog>
					)}
				</div>
			)}

			<img
				src={post.featuredImage || "/placeholder.svg"}
				alt={post.title}
				className="aspect-video w-full object-cover"
			/>
			<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-base-100 px-4 py-6 md:px-6 lg:py-8">
				<div className="flex items-center justify-between">
					<div className="space-x-2">
						{post.tags.map((tag, index) => (
							<div
								key={index}
								className="badge badge-outline bg-primary text-primary-content">
								{tag}
							</div>
						))}
					</div>
					<div className="text-sm text-muted">
						<FaRegClock className="mr-1 inline-block h-4 w-4" />
						{post.timeToRead} min read
					</div>
				</div>
			</div>
		</div>
	);
}

export default PostHeader;
