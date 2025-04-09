import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import Input from "../Input";
import { changePassword } from "../../api/users";

function UpdatePasswordForm({ setShowPasswordForm }) {
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm();

    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: changePassword,
        onSuccess: (data) => {
            setShowSuccessMessage(true);
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 2000);
        },
        onError: (error) => {
            console.error("Error changing password:", error);
        },
    });

    const onSubmit = (data) => {
        mutate(data);
    };

    return (
        <div>
            {showSuccessMessage && (
                <div className="alert alert-success">
                    <div>
                        <span>Password changed successfully!</span>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Current Password:"
                    type="password"
                    {...register("oldPassword", {
                        required: "Current password is required",
                    })}
                />
                {errors.oldPassword && (
                    <p className="text-error">{errors.oldPassword.message}</p>
                )}

                <Input
                    label="New Password:"
                    type="password"
                    {...register("newPassword", {
                        required: "New password is required",
                        minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters long",
                        },
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                        },
                    })}
                />
                {errors.newPassword && (
                    <p className="text-error">{errors.newPassword.message}</p>
                )}

                <Input
                    label="Confirm New Password:"
                    type="password"
                    {...register("confirmPassword", {
                        required: "Please confirm your new password",
                        validate: (value) =>
                            value === watch("newPassword") || "Passwords do not match",
                    })}
                />
                {errors.confirmPassword && (
                    <p className="text-error">{errors.confirmPassword.message}</p>
                )}

                <div className="flex space-x-2">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowPasswordForm(false)}>
                        Back to Profile
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isPending}>
                        {isPending ? "Changing..." : "Change Password"}
                    </button>
                </div>

                {isError && (
                    <p className="text-error">Error: {error?.response?.data?.message}</p>
                )}
            </form>
        </div>
    );
}

export default UpdatePasswordForm;
