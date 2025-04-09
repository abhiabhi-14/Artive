// authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
	name: "auth",
	initialState: {
		user: null,
		token: null,
		status: false,
	},
	reducers: {
		login: (state, action) => {
			const { user, token } = action.payload;
			state.user = user;
			state.token = token;
			state.status = true;
		},
		logout: (state) => {
			state.user = null;
			state.token = null;
			state.status = false;
		},
	},
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
