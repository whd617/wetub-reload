import User from '../models/User';
import Video from '../models/Video';

export const home = async (req, res) => {
   const videos = await Video.find({})
      .sort({ createdAt: 'desc' })
      .populate('owner');
   return res.render('home', { pageTitle: 'Home', videos });
};

export const watch = async (req, res) => {
   const { id } = req.params; //-> ES6 형식으로 작성된 방식: const id =req.params.id; 이것과 동일
   const video = await Video.findById(id).populate('owner');
   if (!video) {
      return res.render('404', { pageTitle: 'Video not found' });
   }
   return res.render('watch', { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
   const { id } = req.params;
   const {
      user: { _id },
   } = req.session;
   const video = await Video.findById(id);
   if (!video) {
      return res.status(404).render('404', { pageTitle: 'Video not found' });
   }
   // !== 는 데이터의 모양뿐만아니라 데이터의 형식도 동일해야 해당 조건문이 실행이된다.
   if (String(video.owner) !== String(_id)) {
      return res.status(403).redirect('/');
   }
   return res.render('edit', { pageTitle: `Edit: ${video.title}`, video });
};

export const postEdit = async (req, res) => {
   const { id } = req.params;
   const {
      user: { _id },
   } = req.session;
   const { title, description, hashtags } = req.body;
   const video = await Video.exists({ _id: id });

   if (!video) {
      return res.status(404).render('404', { pageTitle: 'Video not found' });
   }
   await Video.findByIdAndUpdate(id, {
      title,
      description,
      hashtags: Video.formatHashtags(hashtags),
   });

   if (String(video.owner) !== String(_id)) {
      req.flash('error', 'You are not the owner of th video.'); // 사용자에게 알림보내기
      return res.status(403).redirect('/');
   }
   req.flash('success', 'Changes saved.');
   return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
   return res.render('upload', { pageTitle: `Uploaded Vidoe` });
};

export const postUpload = async (req, res) => {
   const {
      user: { _id },
   } = req.session;
   //"path" 를 req.file.path 에서 받은 뒤에 이름을 "fileUrl" 로 바꿀 수 있어(es6)
   const { video, thumb } = req.files;
   const { title, description, hashtags } = req.body;
   try {
      const newVideo = await Video.create({
         title,
         description,
         fileUrl: video[0].path,
         thumbUrl: thumb[0].path,
         owner: _id,
         hashtags: Video.formatHashtags(hashtags),
      });
      // User Schema의 videos가 array형태이므로 push()를 사용하여 video._id값을 넣어주면된다.
      const user = await User.findById(_id);
      user.videos.push(newVideo._id);
      user.save();
      return res.redirect('/');
   } catch (error) {
      console.log(error);
      return res.status(400).render('upload', {
         pageTitle: `Uploaded Vidoe`,
         errorMessage: error._message,
      });
   }
};

export const deleteVideo = async (req, res) => {
   const { id } = req.params;
   const {
      user: { _id },
   } = req.session;

   // populate 없이 잘 돌아간다면 populate를 안써도 된다.
   const video = await User.findById(id);

   if (!video) {
      return res.status(404).render('404', { pageTitle: 'Video not found' });
   }
   if (String(video.owner) !== String(_id)) {
      return res.status(403).redirect('/');
   }
   console.log(video);
   await Video.findByIdAndDelete(id);
   return res.redirect('/');
};

export const search = async (req, res) => {
   const { keyword } = req.query;
   let videos = [];
   if (keyword) {
      videos = await Video.find({
         title: {
            $regex: new RegExp(`${keyword}$`, 'i'),
         },
      }).populate('owner');
   }
   return res.render('search', { pageTitle: 'Search', videos });
};

export const registerView = async (req, res) => {
   const { id } = req.params;
   const video = await Video.findById(id);
   if (!video) {
      return res.sendStatus(404);
   }
   video.meta.views += 1;
   await video.save();
   return res.sendStatus(200);
};
