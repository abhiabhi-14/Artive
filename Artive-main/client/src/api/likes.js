import api from "./axiosConfig";

const likePost = async (postId) => {
	return await api.post(`/likes/post/${postId}`);
};

const likeComment = async (commentId) => {
	return await api.post(`/likes/comment/${commentId}`);
};

const unlikePost = async (postId) => {
	return await api.delete(`/likes/delete/post/${postId}`);
};

const unlikeComment = async (commentId) => {
	return await api.delete(`/likes/delete/comment/${commentId}`);
};

export { likePost, likeComment, unlikePost, unlikeComment };
