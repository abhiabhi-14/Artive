import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input, Loading, RTE } from "./index";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createPost, updatePostData, updatePostImage } from "../api/posts";

function PostForm() {
	const location = useLocation();
	const post = location.state?.post;

	const [isFileChanged, setIsFileChanged] = useState(false); // Track file change
	const [showCreateSuccessMessage, setShowCreateSuccessMessage] =
		useState(false);
	const [showUpdateSuccessMessage, setShowUpdateSuccessMessage] =
		useState(false);

	// !react hook form config
	const {
		register,
		handleSubmit,
		control,
		getValues,
		formState: { errors },
	} = useForm({
		defaultValues: {
			title: post?.title || "",
			content: post?.content || "",
			status: post?.status || "active",
			tags: post?.tags?.join(", ") || "",
			timeToRead: post?.timeToRead || "",
		},
	});

	//! logic implementation
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const userData = useSelector((state) => state.auth.userData);
	const [imagePreview, setImagePreview] = useState(
		post?.featuredImage || null
	);

	const {
		mutate: updateData,
		isPending: isUpdating,
		isError: isUpdateError,
		error: updateError,
	} = useMutation({
		mutationFn: ({ data, postId }) => updatePostData(data, postId),
		onSuccess: (response) => {
			queryClient.refetchQueries(["posts"]);
			queryClient.refetchQueries(["post", post.slug]);
			setShowUpdateSuccessMessage(true);
			setTimeout(() => {
				setShowUpdateSuccessMessage(false);
				navigate(`/post/${response.data?.data?.slug}`);
			}, 2000);
		},
	});

	const {
		mutate: create,
		isPending: isCreating,
		isError: isCreateError,
		error: createError,
	} = useMutation({
		mutationFn: createPost,
		onSuccess: (response) => {
			queryClient.refetchQueries(["posts"]);
			setShowCreateSuccessMessage(true);
			setTimeout(() => {
				setShowCreateSuccessMessage(false);
				navigate(`/post/${response.data?.data?.slug}`);
			}, 2000);
		},
	});
	//?req to create post
	// ?update the all posts query
	// ?show success message
	// ?navigate to the new post page
	// ?error handling

	const [buttonDisable, setButtonDisable] = useState(false);

	const submit = async (data) => {
		setButtonDisable(true);

		const formData = new FormData();
		formData.append("title", data.title);
		formData.append("content", data.content);
		formData.append("tags", data.tags);
		formData.append("timeToRead", data.timeToRead);
		formData.append("image", data.image[0]);

		if (post) {
			if (isFileChanged && data.image[0]) {
				updatePostImage(formData, post._id);
			}
			updateData({ data: formData, postId: post._id });
		} else {
			create(formData);
		}
	};

	// !used for image preview
	const handleImageChange = (e) => {
		setIsFileChanged(true); // Mark file as changed
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const [isEditorLoading, setIsEditorLoading] = useState(true);

	return (
		<div className="relative">
			{isEditorLoading && (
				<div className="w-full h-full left-0 top-0 flex justify-center items-center absolute z-10 bg-base-100">
					<Loading className="w-20" />
				</div>
			)}

			{post ? (
				<h2 className="text-center text-2xl font-bold">Update Post</h2>
			) : (
				<h2 className="text-center text-2xl font-bold">Create Post</h2>
			)}
			<form
				onSubmit={handleSubmit(submit)}
				className="flex flex-col space-y-4 w-full max-w-3xl mx-auto my-10">
				<Input
					label="Featured Image:"
					type="file"
					className="mb-4 file-input file-input-bordered"
					accept="image/png, image/jpg, image/jpeg, image/gif"
					{...register("image", { required: !post })}
					onChange={handleImageChange}
				/>
				{errors.image && (
					<p className="text-red-500 text-xs mt-1">
						This field is required
					</p>
				)}
				{imagePreview && (
					<div className="mt-2">
						<img
							src={imagePreview}
							alt="Preview"
							className="w-full h-72 object-cover rounded-lg"
						/>
					</div>
				)}

				<Input
					label="Title:"
					placeholder="Title"
					className="mb-4"
					{...register("title", { required: "Title is required" })}
				/>
				{errors.title && (
					<p className="text-red-500 text-xs mt-1">
						{errors.title.message}
					</p>
				)}

				<Input
					label="Tags (comma separated):"
					placeholder="tag1, tag2, tag3"
					className="mb-4"
					{...register("tags")}
				/>

				<Input
					label="Time to Read (in minutes):"
					type="number"
					placeholder="5"
					className="mb-4"
					{...register("timeToRead", {
						required: "Time to read is required",
					})}
				/>
				{errors.timeToRead && (
					<p className="text-red-500 text-xs mt-1">
						{errors.timeToRead.message}
					</p>
				)}

				<RTE
					label="Content:"
					name="content"
					control={control}
					defaultValue={getValues("content")}
					setIsEditorLoading={setIsEditorLoading}
					className=""
				/>
				{errors.content && (
					<p className="text-red-500 text-xs mt-1">
						{errors.content.message}
					</p>
				)}

				<button
					type="submit"
					className={`btn ${post ? "btn-success" : "btn-primary"} w-full mt-4`}
					disabled={buttonDisable}>
					{post
						? isUpdating
							? "Updating post..."
							: "Update Post"
						: isCreating
							? "Creating post...."
							: "Create Post"}
				</button>
			</form>
			{(isCreateError || isUpdateError) && (
				<p className="text-error mt-2">
					Error: {updateError?.message || createError?.message}
				</p>
			)}
			{showUpdateSuccessMessage && (
				<div role="alert" className="alert alert-success">
					<span>Post updated successfully!</span>
				</div>
			)}
			{showCreateSuccessMessage && (
				<div role="alert" className="alert alert-success">
					<span>Post created successfully!</span>
				</div>
			)}
		</div>
	);
}

export default PostForm;
