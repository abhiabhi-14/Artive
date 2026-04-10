import { logout } from "../../api/users";
import { logout as logoutAction } from "../../store/authSlice";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const UserOptionsButton = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector((state) => state.auth.user);

	const { mutate, isLoading, isError, error } = useMutation({
		mutationFn: logout,
		onSuccess: (response) => {
			// Assuming the API returns user data on successful login
			dispatch(logoutAction());
			navigate("/"); // Redirect to dashboard or home page
		},
		onError: (error) => {
			console.error("Logout failed:", error);
			// Error is already captured in the `error` variable from useMutation
		},
	});

	const handleClick = () => {
		mutate();
	};

	return (
		<>
			<div className="dropdown dropdown-end">
				<div
					tabIndex={0}
					role="button"
					className="btn btn-ghost btn-circle avatar">
					<div className="w-10 rounded-full ring-primary ring-offset-base-100 ring ring-offset-2">
						<img
							src={
								user?.avatar ||
								"https://img.daisyui.com/images/stock/photo-1567653418876-5bb0e566e1c2.webp"
							}
							alt="avatar"
						/>
					</div>
				</div>
				<ul
					tabIndex={0}
					className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
					<li >
						<Link to="/profile" className="w-full flex justify-between">
							
								<span>Profile</span>
								<span className="badge badge-outline">New</span>
						</Link>
					</li>
					<li>
						<button
							className="btn btn-primary btn-sm mt-3 mx-1"
							disabled={isLoading}
							onClick={handleClick}>
							{isLoading ? "Logging out..." : "Logout"}
						</button>
					</li>
				</ul>
			</div>
			{isError && (
				<p className="text-error text-sm mt-2">
					Logout failed:{" "}
					{error.message ||
						"Please check your credentials and try again."}
				</p>
			)}
		</>
	);
};
export default UserOptionsButton;
