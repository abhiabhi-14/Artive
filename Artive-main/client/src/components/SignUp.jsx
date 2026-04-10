import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input, Logo } from "./index";
import { signUp } from "../api/users";
import { useMutation } from "@tanstack/react-query";
// import GoogleButton from "./GoogleButton";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function Signup() {
	const navigate = useNavigate();
	// const [avatarPreview, setAvatarPreview] = useState(null);
	const [registrationSuccess, setRegistrationSuccess] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm();

	// const avatar = watch("avatar");

	// useEffect(() => {
	// 	if (avatar && avatar[0]) {
	// 		setIsLoadingLocal(true);
	// 		const reader = new FileReader();
	// 		reader.onloadend = () => {
	// 			setAvatarPreview(reader.result);
	// 			setIsLoadingLocal(false);
	// 		};
	// 		reader.readAsDataURL(avatar[0]);
	// 	}
	// }, [avatar]);

	const { mutate, isPending, isError, error } = useMutation({
		mutationFn: signUp,
		onSuccess: (response) => {
			setRegistrationSuccess(true);
			setTimeout(() => {
				navigate("/login");
			}, 1000);
		},
		onError: (error) => {
			console.error("Signup failed:", error);
		},
	});

	const create = async (data) => {
		data.role = "user";
		mutate(data);
	};

	// Toggle password visibility
	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-base-100">
			<div className="card w-full max-w-lg bg-base-200 shadow-xl">
				<div className="card-body">
					<div className="mb-1 flex justify-center">
						<Logo width="100%" />
					</div>

					<h2 className="text-center text-2xl font-bold">
						Sign up to create account
					</h2>

					{registrationSuccess && <RegistrationSuccessful />}

					{/* <div className="avatar my-4 relative">
						<div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 mx-auto">
							{isPending ? (
								<div className="loading loading-spinner loading-lg"></div>
							) : avatarPreview ? (
								<img src={avatarPreview} alt="Avatar preview" />
							) : (
								<div className="bg-base-300 w-full h-full flex items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										className="w-12 h-12 text-base-content">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
								</div>
							)}
						</div>
						<input
							type="file"
							accept="image/*"
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							{...register("avatar")}
						/>
					</div> */}

					<form onSubmit={handleSubmit(create)} className="space-y-4">
						<Input
							label="Username:"
							placeholder="Enter your username"
							{...register("username", {
								required: "Username is required",
								minLength: {
									value: 3,
									message:
										"Username must be at least 3 characters long",
								},
								pattern: {
									value: /^[a-zA-Z0-9_]+$/,
									message:
										"Username can only contain letters, numbers, and underscores",
								},
							})}
						/>
						{errors.username && (
							<p className="text-error text-sm">
								{errors.username.message}
							</p>
						)}

						<Input
							label="Email:"
							type="email"
							placeholder="Enter your email"
							{...register("email", {
								required: "Email is required",
								pattern: {
									value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
									message:
										"Please enter a valid email address",
								},
							})}
						/>
						{errors.email && (
							<p className="text-error text-sm">
								{errors.email.message}
							</p>
						)}
						<div className="relative">
							<Input
								label="Password:"
								type={passwordVisible ? "text" : "password"}
								placeholder="Enter your password"
								{...register("password", {
									required: "Password is required",
									minLength: {
										value: 8,
										message:
											"Password must be at least 8 characters long",
									},
									pattern: {
										value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$#!%*?&]{8,}$/,
										message:
											"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
									},
								})}
							/>
							<button
								type="button"
								className="absolute right-4 top-1/2 text-2xl"
								onClick={togglePasswordVisibility}>
								{passwordVisible ? (
									<AiOutlineEyeInvisible />
								) : (
									<AiOutlineEye />
								)}
							</button>
						</div>
						{errors.password && (
							<p className="text-error text-sm">
								{errors.password.message}
							</p>
						)}

						<button
							type="submit"
							className="btn btn-primary w-full"
							disabled={isPending || registrationSuccess}>
							{isPending ? "Signing Up..." : "Sign Up"}
						</button>
						{/* <GoogleButton isSignUp={true} /> */}
						{isError && (
							<p className="text-error text-sm mt-2">
								Signup failed:{" "}
								{error?.response?.data?.message ||
									"Please check your information and try again."}
							</p>
						)}
					</form>

					<p className="mt-1 text-center text-base text-base-content/60">
						Already have an account?&nbsp;
						<Link to="/login" className="link link-primary">
							Sign In
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default Signup;

const RegistrationSuccessful = () => {
	return (
		<div role="alert" className="alert alert-success">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span>
				Registration successful! Kindly Login with new credentials
			</span>
		</div>
	);
};
