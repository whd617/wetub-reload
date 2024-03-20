import User from '../models/User';
import bcrypt from 'bcrypt';

export const getJoin = (req, res) => res.render('join', { pageTitle: 'Join' });
export const postJoin = async (req, res) => {
   const { name, email, username, password, password2, location } = req.body;
   const pageTitle = 'Join';

   if (password !== password2) {
      return res.status(400).render('join', {
         pageTitle,
         errorMessage: 'Password confirmation does not match',
      });
   }

   const exists = await User.exists({ $or: [{ username }, { email }] });
   if (exists) {
      return res.status(400).render('join', {
         pageTitle,
         errorMessage: 'This username/email is already taken',
      });
   }
   try {
      await User.create({
         name,
         email,
         username,
         password,
         location,
      });
      return res.redirect('/login');
   } catch (error) {
      return res.status(400).render('join', {
         pageTitle,
         errorMessage: error._message,
      });
   }
};
export const getLogin = async (req, res) =>
   res.render('login', { pageTitle: 'Login' });
export const postLogin = async (req, res) => {
   const { username, password } = req.body;
   const { pageTitle } = 'Login';
   // socialOnly: false -> Github으로 로그인 했는지 password를 통해 로그인 했는지 잊어버리는 사람이 있기 때문에 처리
   const user = await User.findOne({ username, socialOnly: false });
   if (!user) {
      return res.status(400).render('login', {
         pageTitle: 'Login',
         errorMessage: 'An account with this username doses not exists',
      });
   }
   const ok = await bcrypt.compare(password, user.password);

   if (!ok) {
      return res.status(400).render('login', {
         pageTitle,
         errorMessage: 'Wrong password',
      });
   }
   req.session.loggedIn = true; // 세션을 수정하는 곳(로그인)
   req.session.user = user; // 세션을 수정하는 곳(로그인)
   return res.redirect('/');
};

export const startGithubLogin = (req, res) => {
   const baseUrl = 'https://github.com/login/oauth/authorize';
   const config = {
      client_id: process.env.GH_CLIENT,
      allow_signup: false,
      scope: 'read:user user:email',
   };
   const params = new URLSearchParams(config).toString();
   const finalUrl = `${baseUrl}?${params}`;
   return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
   const baseUrl = 'https://github.com/login/oauth/access_token';
   const config = {
      client_id: process.env.GH_CLIENT,
      client_secret: process.env.GH_SECRET,
      code: req.query.code, // code는 URL에 보이는 code를 사용하면 된다.
   };
   const params = new URLSearchParams(config).toString();
   const finalUrl = `${baseUrl}?${params}`;
   const tokenRequest = await (
      await fetch(finalUrl, {
         method: 'POST',
         headers: {
            Accept: 'application/json',
         },
      })
   ).json();

   //access_token은 Github API와 상호작용할 때 사용
   if ('access_token' in tokenRequest) {
      const { access_token } = tokenRequest;
      const apiUrl = 'https://api.github.com';
      const userData = await (
         await fetch(`${apiUrl}/user`, {
            headers: {
               Authorization: `token ${access_token}`,
            },
         })
      ).json();
      const emailData = await (
         await fetch(`${apiUrl}/user/emails`, {
            headers: {
               Authorization: `token ${access_token}`,
            },
         })
      ).json();
      const emailObj = emailData.find(
         (email) => email.primary === true && email.verified === true,
      );
      if (!emailObj) {
         // set notification
         return res.redirect('/login');
      }
      // 유저를 찾게 되면 모든 과정을 건너뛰고 user를 로그인 시키게 함
      let user = await User.findOne({ email: emailObj.email });
      if (!user) {
         // 계정이 없을 경우 로그인 시키기
         user = await User.create({
            avatarUrl: userData.avatar_url,
            name: userData.name,
            username: userData.login,
            email: emailObj.email,
            password: '',
            socialOnly: true,
            location: userData.location,
         });
      }
      req.session.loggedIn = true; // 세션을 수정하는 곳 (로그인하기)
      req.session.user = user; // 세션을 수정하는 곳 (로그인하기)
      return res.redirect('/');
   } else {
      return res.redirect('/login');
   }
};
export const logout = (req, res) => {
   req.session.destroy();
   req.flash('info', 'Bye Bye'); // 사용자에게 알림보내기
   return res.redirect('/');
};
export const getEdit = (req, res) => {
   return res.render('edit-profile', { pageTitle: 'Edit Profile' });
};
export const postEdit = async (req, res) => {
   //req.session에 있는 user object에서 id를 찾을 수 있다. req.session.user;
   // 아래와 같은 방법은 const id = req.session.user.id;  와 같은 방법이다
   // 이와 같은 방법은 req.body 안에 있는 name, email, username, password, location 정보도 가져올 수 있다.(es6)
   const {
      session: {
         user: {
            _id,
            email: sessionEamil,
            username: sessionUsername,
            avatarUrl,
         },
      },
      body: { name, email, username, location },
      file,
   } = req;
   const emailExists =
      email !== sessionEamil ? await User.exists({ email }) : undefined;
   console.log('emailExists', sessionEamil);
   const usernameExists =
      username !== sessionUsername
         ? await User.exists({ username })
         : undefined;

   if (emailExists || usernameExists) {
      return res.status(400).render('edit-profile', {
         pageTitle: 'Edit Profile',
         usernameErrorMessage: usernameExists
            ? 'This username is already taken'
            : '',
         emailErrorMessage: emailExists ? 'This email is already taken' : '',
      });
   }

   // 참고자료: https://mongoosejs.com/docs/api/model.html#Model.findOneAndUpdate()
   // 기본적으로 findByIdAndUpdate는 update 되기 전의 데이터를 return해주고
   // new:true를 설정해주면 findByIdAndUpdate가 업데이트된 데이터를 return해줄 것이다.
   const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
         avatarUrl: file ? file.path : avatarUrl,
         name,
         email,
         username,
         location,
      },
      { new: true },
   );
   // user를 업데이트 했는데 업데이트 값이 템플릿에서 수정이 안될때
   // DB에서는 user를 업데이트했는데, session은 DB와 연결되어 있지 않아서 그렇다.
   // session은 로그인 할때 한번만 update하고 있으므로 session을 다시 update해줘야한다.
   // 다음같은 방법은 req.session.user 안의 내용을 밖으로 꺼내주는 것이다.
   // ..req.session.user에 있는 email, username을 덮어쓸 것이기 때문에 ..req.session.user를 상단에 배치
   req.session.user = updatedUser;

   return res.redirect('/users/edit');
};

export const getChangePassword = (req, res) => {
   if (req.session.user.socialOnly === true) {
      req.flash('error', "Can't change password");
      return res.redirect('/');
   }
   return res.render('users/change-password', {
      pageTitle: 'Change Password',
   });
};

export const postChangePassword = async (req, res) => {
   const {
      session: {
         user: { _id },
      },
      body: { oldPassword, newPassword, newPasswordConfirmation },
   } = req;

   const user = await User.findById(_id);

   // 만약에 session에서 정보를 받으면, 업데이트도 해줘야한다!!!
   const ok = await bcrypt.compare(oldPassword, user.password);

   if (!ok) {
      return res.status(400).render('users/change-password', {
         pageTitle: 'Change Password',
         errorMessage: 'The current password is incorrect',
      });
   }

   if (newPassword !== newPasswordConfirmation) {
      return res.status(400).render('users/change-password', {
         pageTitle: 'Change Password',
         errorMessage: 'The password does not match the confirmation',
      });
   }
   user.password = newPassword;
   await user.save(); // 이것만 처리해도 User의 schema의 pre save middleware를 거쳐 data를 업데이트 한다.
   req.flash('info', 'Password updated');
   return res.redirect('/users/logout'); // 비밀번호 변경 후 로그아웃
};

// 이 API는 모든 사용자에게 보여주기 위해서 req.session에서 안가져오고 API params에서 가져올 것이다.
export const see = async (req, res) => {
   const { id } = req.params;
   const user = await User.findById(id).populate({
      path: 'videos',
      populate: {
         path: 'owner',
         model: 'User',
      },
   });
   console.log(user);
   if (!user) {
      return res.status(404).render('404', { pageTitle: 'User not found.' });
   }
   return res.render('users/profile', {
      pageTitle: user.name,
      user,
   });
};
