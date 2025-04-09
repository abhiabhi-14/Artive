import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { login as loginAction } from "../store/authSlice";
import { Input, Logo } from "./index";
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/users";
import GoogleButton from "./GoogleButton";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function Login() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [passwordVisible, setPasswordVisible] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const { mutate, isPending, isError, error } = useMutation({
		mutationFn: login,
		onSuccess: (response) => {
			// Assuming the API returns user data on successful login
			dispatch(loginAction(response.data.data));
			navigate("/"); // Redirect to dashboard or home page
		},
		onError: (error) => {
			console.error("Login failed:", error);
			// Error is already captured in the `error` variable from useMutation
		},
	});

	const onSubmit = (formData) => {
		mutate(formData);
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
						Login to your account
					</h2>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-4 mt-4">
						<Input
							label="Username or Email:"
							placeholder="Enter your username or email"
							{...register("usernameOrEmail", {
								required: "Username or Email is required",
								minLength: {
									value: 3,
									message:
										"Please enter a valid username or email address",
								},
								validate: (value) => {
									// Check if it's a valid email
									const emailRegex =
										/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
									// Check if it's a valid username (letters, numbers, underscores)
									const usernameRegex = /^[a-zA-Z0-9_]+$/;

									if (
										emailRegex.test(value) ||
										usernameRegex.test(value)
									) {
										return true;
									}
									return "Please enter a valid username or email address";
								},
							})}
						/>
						{errors.usernameOrEmail && (
							<p className="text-error text-sm">
								{errors.usernameOrEmail.message}
							</p>
						)}

						<div className="relative">
							<Input
								label="Password:"
								type={passwordVisible ? "text" : "password"}
								placeholder="Enter your password"
								{...register("password", {
									required: "Password is required",
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
						{/* 
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									type="checkbox"
									id="remember"
									className="checkbox checkbox-primary"
									{...register("remember")}
								/>
								<label
									htmlFor="remember"
									className="ml-2 text-sm">
									Remember me
								</label>
							</div>
							<Link
								to="/forgot-password"
								className="text-sm link link-primary">
								Forgot password?
							</Link>
						</div> */}

						<button
							type="submit"
							className="btn btn-primary w-full"
							disabled={isPending}>
							{isPending ? "Signing In..." : "Sign In"}
						</button>

						{/* <GoogleButton/> */}
					</form>
					{isError && (
						<p className="text-error text-sm mt-2">
							Login failed:{" "}
							{error.response.data.message ||
								"Please check your credentials and try again."}
						</p>
					)}
					<p className="mt-2 text-center text-base text-base-content/60">
						Don't have an account?&nbsp;
						<Link to="/signup" className="link link-primary">
							Sign Up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default Login;
