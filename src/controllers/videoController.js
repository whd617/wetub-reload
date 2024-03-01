import Video from '../models/Video';

export const home = async (req, res) => {
  try {
    const videos = await Video.find({});
    console.log(videos);
    return res.render('home', { pageTitle: 'Home', videos });
  } catch (error) {
    return res.render('server-err', { error });
  }
};

export const watch = async (req, res) => {
  const { id } = req.params; //-> ES6 형식으로 작성된 방식: const id =req.params.id; 이것과 동일
  const video = await Video.findById(id);
  return res.render('watch', { pageTitle: video.title, video });
};

export const getEdit = (req, res) => {
  const { id } = req.params;
  return res.render('edit', { pageTitle: `Editing` });
};

export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body; //-> ES6 형식으로 작성된 방식: const title = req.body.title; 이것과 동일
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render('upload', { pageTitle: `Uploaded Vidoe` });
};

export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  try {
    await Video.create({
      title,
      description,
      hashtags: hashtags.split(',').map((words) => `#${words}`),
    });

    return res.redirect('/');
  } catch (error) {
    return res.render('upload', {
      pageTitle: `Uploaded Vidoe`,
      errorMessage: error._message,
    });
  }
};
