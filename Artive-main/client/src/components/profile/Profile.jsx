import React, { useState } from "react";
import UpdateDataForm from "./UpdateDataForm";
import UpdatePasswordForm from "./UpdatePasswordForm";
import AvatarUpload from "./AvatarUpload";
import { useSelector } from "react-redux";

function Profile({className}) {
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const user = useSelector((state) => state.auth.user)


	return (
		<div className={`px-4 my-20 ${className}`}>
			{!showPasswordForm ? (
				<>
					<h1 className="text-2xl font-bold mb-4">Profile</h1>
					<AvatarUpload user={user} />
					<UpdateDataForm user={user} setShowPasswordForm={setShowPasswordForm} />
				</>
			) : (
				<UpdatePasswordForm setShowPasswordForm={setShowPasswordForm} />
			)}
		</div>
	);
}

export default Profile;
