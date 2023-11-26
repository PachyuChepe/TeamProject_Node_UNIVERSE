const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const jwt = require("jsonwebtoken");
const s3Client = require("../config/awsS3.config");

// 허용되는 파일 확장자 목록
const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".gif"];

// multer와 AWS S3를 이용한 이미지 업로드 설정
const uploadImage = multer({
  storage: multerS3({
    s3: s3Client, // AWS S3 클라이언트
    bucket: process.env.BUCKET, // 사용할 S3 버킷 이름
    contentType: multerS3.AUTO_CONTENT_TYPE, // 파일의 컨텐츠 타입 자동 설정
    key: (req, file, callback) => {
      let token = req.cookies.Authorization; // 쿠키에서 토큰 추출
      if (token) {
        // Bearer 토큰 형식인 경우 실제 토큰만 추출
        if (token.startsWith("Bearer ")) {
          token = token.slice(7, token.length);
        }

        // JWT 토큰 검증 및 디코딩
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId = decoded.userId; // 사용자 ID 추출

          // 파일명을 위한 날짜와 랜덤 번호 생성
          const date = new Date().toISOString().split("T")[0];
          const randomNumber = Math.random().toString(36).substr(2, 8);

          // 파일 확장자 검사
          const extension = path.extname(file.originalname).toLowerCase();
          if (!allowedExtensions.includes(extension)) {
            return callback(new Error("Invalid file type"));
          }

          // 최종 파일명 생성 및 저장
          const filename = `folder/${userId}_${date}_${randomNumber}${extension}`;
          callback(null, filename);
        } catch (error) {
          return callback(new Error("Invalid or expired token"));
        }
      } else {
        return callback(new Error("No token provided"));
      }
    },
    acl: "public-read-write", // 파일 접근 권한 설정
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 파일 크기 제한 (5MB)
  },
});

module.exports = uploadImage; // 모듈로 내보내기
