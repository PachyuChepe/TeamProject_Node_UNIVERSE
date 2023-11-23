const nodemailer = require("nodemailer");

exports.mailVerify = async (req, res, next) => {
  const { email } = req.body;
  try {
    const verifyCode = Math.floor(Math.random() * (999999 - 100000)) + 100000;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODE_MAIL_ID,
        pass: process.env.NODE_MAIL_PW,
      },
    });

    let message = {
      from: process.env.NODE_MAIL_ID,
      to: `<${email}>`,
      subject: "유니버스 인증메일",
      html: `
      <div style='
      margin: 0 auto 0 auto;
      padding: 3.5% 0 5% 0;
      text-align: center;
      border: 0.5px solid #ececec;
      height: 50%;
      width: 50%;
      '>
      <img src="cid:UNIVERSE" /><br/><br/><br/>

      
      <span style="
      font-size: 30pt;
      border: 0.5px solid #ececec;
      padding: 0.5% 2.5%;
      font-weight:bold;
      ">${verifyCode}</span>
      <br/>
      <h2>인증번호는 3분간 유효합니다.</h2><br/><br/><br/>
      <h4 style="
      color: gray;
      ">
      &copy; Copyright UNIVERSE, 2023 All Rights Reserved.
      </h4>
      </div>
			`,
      attachments: [
        {
          filename: "UNIVERSE.png",
          path: "../TeamProject_Node/image/UNIVERSE.jpg",
          cid: "UNIVERSE",
        },
      ],
    };

    transporter.sendMail(message, (err) => {
      if (err) next(err);
      else return res.status(200).json({ success: true, data: verifyCode });
    });
  } catch (err) {
    console.error("nodeMailer Err", err);
    return res.status(500).json({ success: true, message: "서버 에러 발생" });
  }
};
