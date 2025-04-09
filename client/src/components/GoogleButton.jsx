import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api/users";


function GoogleButton({ isSignUp = false }) {
const queryClient = useQueryClient()

	const { mutate } = useMutation({
		mutationFn: googleAuth,
		onSuccess: (data) => {
			queryClient.refetchQueries({
				queryKey:['currentUser'],
				type:"active"
			})
		},
		onError: (error) => {
			console.error(
				`Error during ${isSignUp ? "sign-up" : "sign-in"}:`,
				error
			);
		},
	});

	return (
		<div className="flex justify-center">
			<GoogleLogin
				onSuccess={(credentialResponse) => {
					mutate(credentialResponse?.credential);
				}}
				onError={() => {
					console.log("Login Failed");
				}}
				text={isSignUp ? "signup_with" : "signin_with"}
				useOneTap={false}
				auto_select={false}
			/>
		</div>
	);
}

export default GoogleButton;
