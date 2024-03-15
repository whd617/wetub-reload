import multer from 'multer';

export const localMiddleware = (req, res, next) => {
   res.locals.loggedIn = Boolean(req.session.loggedIn);
   res.locals.siteName = 'Wetube';
   // loggedInUser는 req.session.user인데, 이게 undefined일 수 가 있다.
   res.locals.loggedInUser = req.session.user || {};
   next();
};

// 로그인하지 않는 사용자가 로그인을 해야만 접근하려는 가능한 페이지를 보호하는 middleware
// 사용자가 로그인 돼 있지 않은 걸 확인하며, 로그인 페이지로 redirect하게함
// 사용자가 로그인돼 있다면 request를 계속하도록 할거고
// controller에서는 user를 req에서 찾을 수 있다.
export const protectorMiddleware = (req, res, next) => {
   if (req.session.loggedIn) {
      next();
   } else {
      return res.redirect('/login');
   }
};

// 로그인 돼 있지 않은 사람들만 접근 할 수 있게하는 middlware
export const publicOnlyMiddleware = (req, res, next) => {
   if (!req.session.loggedIn) {
      return next();
   } else {
      return res.redirect('/');
   }
};

// 파일 업로드 middleware
// 사용자가 보낸 파일을 uploads 폴더에 저장하도록 설정된 middleware
export const avatarUpload = multer({
   dest: 'uploads/avatars',
   limits: {
      fileSize: 3000000,
   },
});

// fileSize 최대 10000 bytes
export const videoUpload = multer({
   dest: 'uploads/videos/',
   limits: {
      fileSize: 10000000,
   },
});
