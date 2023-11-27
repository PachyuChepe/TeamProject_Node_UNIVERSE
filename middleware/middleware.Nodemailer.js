const nodemailer = require("nodemailer");

exports.mailVerify = async (req, res, next) => {
  const { email } = req.body;
  try {
    // 6자리 인증번호 생성
    const verifyCode = Math.floor(Math.random() * (999999 - 100000)) + 100000;

    // nodemailer로 이메일 전송을 위한 설정
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.NODE_MAIL_ID, // 환경변수에서 이메일 ID 가져오기
        pass: process.env.NODE_MAIL_PW, // 환경변수에서 이메일 비밀번호 가져오기
      },
    });

    // 전송할 이메일 내용
    let message = {
      from: process.env.NODE_MAIL_ID,
      to: `<${email}>`,
      subject: "유니버스 인증메일", // 이메일 제목
      html: `
      <div>...</div>`, // 이메일 본문 (HTML 형식)
      attachments: [
        {
          filename: "UNIVERSE.jpg", // 첨부 파일 이름
          path: "../TeamProject_Node/front.public/image/UNIVERSE.jpg", // 첨부 파일 경로
          cid: "UNIVERSE", // Content ID
        },
      ],
    };

    // 이메일 전송
    transporter.sendMail(message, (err) => {
      if (err) next(err); // 에러 발생 시 다음 미들웨어로 에러 전달
      else return res.status(200).json({ success: true, data: verifyCode }); // 성공 응답 전송
    });
  } catch (err) {
    console.error("nodeMailer Err", err); // 콘솔에 에러 로깅
    return res.status(500).json({ success: true, message: "서버 에러 발생" }); // 서버 에러 응답 전송
  }
};
