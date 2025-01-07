import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    featuredImage: {
        type: String,
        required: true,
    },
    tags: [{
        type: String,
    }],
    timeToRead: {
        type: Number,
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
}, {
    timestamps: true
});



// Middleware to delete associated comments and likes when a post is removed
postSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        // Delete all likes related to this post (likes on the post and likes on comments of this post)
        await Like.deleteMany({ 
            $or: [
                { postId: this._id },   // Likes on the post
                { commentId: { $in: (await Comment.find({ postId: this._id }).select('_id')) } } // Likes on comments related to this post
            ]
        });

        // Delete all comments related to this post
        await Comment.deleteMany({ postId: this._id });

        next();
    } catch (err) {
        next(err);
    }
});

export const Post = mongoose.model("Post", postSchema);



/*
!No, the pre('remove') middleware will not be triggered when you use findByIdAndDelete() or any of the other "find and delete" methods like findOneAndDelete() or deleteMany().
The pre('remove') hook is only triggered when you call the remove() method directly on a document instance.

If You Want the Middleware to Trigger on findByIdAndDelete:
You have two main options:
?Manually Load the Document and Use remove(): Load the document first, then call remove() on it.
?Use a post Middleware on findOneAndDelete: 
Alternatively, you can use a post('findOneAndDelete') or pre('findOneAndDelete') middleware, which is triggered when using findByIdAndDelete, findOneAndDelete, etc
 */