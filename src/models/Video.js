import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
   title: { type: String, required: true, trim: true, maxLength: 80 },
   fileUrl: { type: String, required: true },
   description: { type: String, required: true, trim: true, minLength: 20 },
   createdAt: { type: Date, required: true, default: Date.now },
   hashtags: [{ type: String, trim: true }],
   meta: {
      views: { type: Number, default: 0, required: true },
   },
   // mongoose에게 owner에 id를 저장하겠다고 알려주기 위함 -> ref: 'User'
   // 어떤 model의 objectId 라고 알려줄거야. 여기서는 User model
   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

videoSchema.static('formatHashtags', function (hashtags) {
   return hashtags
      .split(',')
      .map((word) => (word.startsWith('#') ? word : `#${word}`));
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
