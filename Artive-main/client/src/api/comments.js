import api from "./axiosConfig"

const getCommentsForPost = async (postId,page = 1,limit = 5) => {
    return await api.get(`/comments/post/${postId}?page=${page}&limit=${limit}`);
}

const allComments = async () => {
	return await api.get("/comments/all-comments");
};

const create = async (data) => {
    return await api.post("/comments/create",data);
}

const update = async (data,commentId) => {
    return await api.patch(`/comments/update/${commentId}`,data);
}

const deleteComment = async (commentId) => {
    return await api.delete(`/comments/delete/${commentId}`);
}

const deleteCommentAdmin = async (commentId) => {
    return await api.delete(`/comments/delete-admin/${commentId}`);
}

export {getCommentsForPost,allComments,create,update,deleteComment,deleteCommentAdmin}