import mongoose from "mongoose";
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    url: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        default: 0
    },
    originalName: String,
    size: Number,
    mimetype: String
}, {
    timestamps: true
});

export default mongoose.model("Image", imageSchema)