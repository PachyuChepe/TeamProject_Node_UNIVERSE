const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const db = require("../sequelize/models");
const User = db.User;

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email', // req.body.email
        passwordField: 'password', // req.body.passoword
      },
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({ where: { email } })
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password)
            if (result) {
              done(null, exUser) // 검증성공시 (성공유저)
              console.log('성공');
            } else {
              done(null, false, { message: '비밀번호가 일치하지 않습니다.' })
              console.log('비번불일치');
            }
          } else {
            done(null, false, { message: '가입되지 않은 회원입니다.' })
            console.log('없는회원');
          }
        } catch (error) {
          console.error(error)
          done(error)
        }
      }
    )
  )
}
