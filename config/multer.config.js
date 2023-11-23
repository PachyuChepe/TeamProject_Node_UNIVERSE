const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const jwt = require("jsonwebtoken");
const s3Client = require("./awsS3.config.js");

// 확장자 검사 목록
const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".gif"];

// Multer-S3 설정
const uploadImage = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, callback) => {
      let token = req.cookies.Authorization;
      if (token) {
        // Bearer 토큰에서 실제 토큰을 추출
        if (token.startsWith("Bearer ")) {
          token = token.slice(7, token.length);
        }

        // JWT 토큰 디코딩
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log(decoded);
          const userId = decoded.userId;

          // 날짜와 랜덤 번호 생성
          const date = new Date().toISOString().split("T")[0];
          const randomNumber = Math.random().toString(36).substr(2, 8);

          // 확장자 검사
          const extension = path.extname(file.originalname).toLowerCase();
          if (!allowedExtensions.includes(extension)) {
            return callback(new Error("Invalid file type"));
          }

          // 파일명 생성
          const filename = `folder/${userId}_${date}_${randomNumber}${extension}`;
          callback(null, filename);
        } catch (error) {
          return callback(new Error("Invalid or expired token"));
        }
      } else {
        return callback(new Error("No token provided"));
      }
    },
    acl: "public-read-write",
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = uploadImage;
