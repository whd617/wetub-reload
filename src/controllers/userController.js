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
      pageTitle: 'Upload Video',
      errorMessage: error._message,
    });
  }
};
export const getLogin = async (req, res) =>
  res.render('login', { pageTitle: 'Login' });
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const { pageTitle } = 'Login';
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render('login', {
      pageTitle,
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
  req.session.loggedIn = true; // 세션을 수정하는 곳
  req.session.user = user; // 세션을 수정하는 곳
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
      return res.redirect('/login');
    }
    const existingUser = await User.findOne({ email: emailObj.email });
    if (existingUser) {
      req.session.loggedIn = true; // 세션을 수정하는 곳 (로그인하기)
      req.session.user = existingUser; // 세션을 수정하는 곳 (로그인하기)
      return res.redirect('/');
    } else {
      // 계정이 없을 경우 로그인 시키기
      const user = await User.create({
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: '',
        socialOnly: true,
        location: userData.location,
      });
      req.session.loggedIn = true; // 세션을 수정하는 곳 (로그인하기)
      req.session.user = user; // 세션을 수정하는 곳 (로그인하기)
      return res.redirect('/');
    }
  } else {
    return res.redirect('/login');
  }
};
export const edit = (req, res) => res.send('Edit User');
export const remove = (req, res) => res.send('Remove User');
export const logout = (req, res) => res.send('LogOut');
export const see = (req, res) => res.send('See User');
