// 로그인 검증 미들웨어

exports.isLoggedIn = (req, res, next) => {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인이 필요한 기능입니다.");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    // 이미 로그인 한 상태라면
    res.status(400).send("이미 로그인한 상태입니다.");
  }
};
