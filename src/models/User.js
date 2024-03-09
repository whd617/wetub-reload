import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
   email: { type: String, required: true, unique: true },
   avatarUrl: String, // 굉장히 유용하다. 왜냐하면 난 user들이 avatar를 가지고 있길 원하기 때문이다.
   socialOnly: { type: Boolean, default: false }, // user가 Github로 로그인했는지 여부를 알기 위한 설정
   username: { type: String, required: true, unique: true },
   password: { type: String },
   name: { type: String, required: true },
   location: String,
   videos: [
      { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Video' },
   ],
});

// user를 save, 즉 user.save()를 할때마다 userSchema.pre("save")를 거쳐서 데이터를 저장하고 있다.
// 이것은 좋지 못하다.
userSchema.pre('save', async function () {
   if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
   }
});

const User = mongoose.model('User', userSchema);
export default User;
