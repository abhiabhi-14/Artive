// features/ui/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	theme: "light",
	activeModal: null,
};

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		toggleTheme: (state) => {
			state.theme = (state.theme === "light") ? "dark" : "light";
		},
		openModal: (state, action) => {
			state.activeModal = action.payload;
		},
		closeModal: (state) => {
			state.activeModal = null;
		},
	},
});

export const {
	toggleTheme,
	openModal,
	closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
