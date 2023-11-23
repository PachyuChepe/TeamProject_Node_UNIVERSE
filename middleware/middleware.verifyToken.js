const jwt = require('jsonwebtoken'); // jwt

const dotenv = require('dotenv');
dotenv.config();

const db = require("../sequelize/models");
const User = db.User;

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  const [authType, authToken] = (authorization || '').split(' ');

  if (!authToken || authType !== 'Bearer') {
    res.status(401).send({
      errorMessage: '로그인 후 이용 가능한 기능입니다.',
    });
    return;
  }

  try {
    const { id } = jwt.verify(authToken, process.env.JWT_SECRET); // 암호화한 키 해독해 id 할당
    const user = await User.findByPk(id); // 존재하는 id인 경우 user에 담김
    res.locals.user = user; // 해당 id의 유저정보 res.locals에 담아 어디서든 호출 가능
    next
    ();
  } catch (err) {
    console.error(err);
    res.status(401).send({
      errorMessage: `로그인 후 이용 가능한 기능입니다.`,
    });
  }
};
