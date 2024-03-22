import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
   text: { type: String, required: true },
   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
   createdAt: { type: Date, required: true, default: Date.now },
});

const comment = mongoose.model('Comment', commentSchema); // String으로 된 Comment는 관계설정을 위해 필요하다.
export default comment;
