import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {Input} from "../index";
import { updateUserData, deleteUser } from "../../api/users";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";

function UpdateDataForm({ user, setShowPasswordForm }) {
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const queryClient = useQueryClient();
	const navigate = useNavigate()
	const dispatch = useDispatch()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            username: user?.username,
            email: user?.email,
        },
    });

    const { mutate: updateProfile, isPending: isUpdating, isError: isUpdateError, error: updateError } = useMutation({
        mutationFn: updateUserData,
        onSuccess: (data) => {
            queryClient.setQueryData(['currentUser'], data);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 2000);
        },
    });

    const { mutate: deleteProfile, isPending: isDeleting, isError: isDeleteError, error: deleteError } = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            // Handle successful deletion (e.g., redirect to login page)
			dispatch(logout());
			navigate("/");
        },
    });

    const onSubmit = (data) => {
        updateProfile(data);
    };

    const handleDeleteProfile = () => {
        if (window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
            deleteProfile();
        }
    };

    return (
        <div>
            {showSuccessMessage && (
                <div className="alert alert-success">
                    <span>Profile updated successfully!</span>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="tooltip tooltip-bottom w-full" data-tip="Username cannot be modified">
                    <Input label="Username:" {...register("username")} disabled />
                </div>

                <Input
                    label="Email:"
                    type="email"
                    {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Invalid email address",
                        },
                    })}
                />
                {errors.email && (
                    <p className="text-error">{errors.email.message}</p>
                )}

                <div className="flex space-x-2">
                    <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                        {isUpdating ? "Updating..." : "Update Profile"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowPasswordForm(true)}>
                        Change Password
                    </button>
                </div>
            </form>

            <div className="mt-4">
                <button 
                    onClick={handleDeleteProfile}
                    className="btn btn-error"
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Delete Profile"}
                </button>
            </div>

            {(isUpdateError || isDeleteError) && (
                <p className="text-error mt-2">
                    Error: {updateError?.message || deleteError?.message}
                </p>
            )}
        </div>
    );
}

export default UpdateDataForm;