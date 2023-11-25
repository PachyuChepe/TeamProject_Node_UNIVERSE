const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const { User } = require("../sequelize/models/index.js");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email', // req.body.email
        passwordField: 'password', // req.body.passoword
      },
      async (email, password, done) => {
        try {
          // 같은 정보의 유저가 있는지 이메일 정보로 확인
          const exUser = await User.findOne({ where: { email } })

          // 해당하는 유저가 있으면 비밀번호 검증해서 result 변수에 담아줌
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password)

            // 로그인 성공 시 
            if (result) {
              done(null, exUser) // 검증성공시 (성공유저)
              // 비밀번호 불일치
            } else {
              done(null, false, { message: '비밀번호가 일치하지 않습니다.' })
              console.log('비번불일치');
            }
            // 미가입 회원
          } else {
            done(null, false, { message: '가입되지 않은 회원입니다.' })
          }
          // 해당 결과를 가지고 다시 user 라우터로 감.
        } catch (error) {
          console.error(error)
          done(error)
        }
      }
    )
  )
}
