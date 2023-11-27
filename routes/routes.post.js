const express = require("express");

const router = express.Router();
const { User, Post, Sequelize } = require("../sequelize/models/index.js");
const { isLoggedIn } = require("../middleware/middleware.verifyToken.js");

// 게시글 CRUD 라우터

// 게시글 등록
router.post("/post", isLoggedIn, async (req, res) => {
  const { id } = res.locals.user; // 로그인한 사용자의 ID
  const { categoryName, title, content } = req.body; // 요청 본문에서 정보 추출

  try {
    // 필수 입력 정보 검증
    if (!categoryName || !title || !content) {
      return res.status(400).json({ success: false, message: "필수 입력 정보가 누락되었습니다." });
    }

    // 새 게시글 생성
    const newPost = await Post.create({
      categoryName,
      title,
      content,
      userId: id,
    });

    // 게시글 생성 실패 시 처리
    if (!newPost) {
      return res.status(500).json({ success: false, message: "게시글을 생성할 수 없습니다." });
    }

    // 게시글 생성 성공 응답
    return res.status(201).json({ success: true, message: "게시글을 등록하였습니다.", data: newPost });
  } catch (err) {
    // 게시글 등록 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "용량이 너무 큽니다! 사진 업로드 기능은 베타버전 입니다." });
  }
});
// 뉴스피드 게시글 목록 조회
router.get("/posts", async (req, res) => {
  const category = req.query.category; // 쿼리 파라미터에서 카테고리 추출

  try {
    // 게시글 목록 조회
    const getPost = await User.findAll({
      attributes: ["id", "username", "profilePictureUrl"],
      include: [
        {
          model: Post,
          attributes: ["id", "categoryName", "title", "content", "createdAt"],
          where: category ? { categoryName: category } : { categoryName: "1" }, // 카테고리 필터
        },
      ],
    });

    // 조회된 게시글이 없을 경우 처리
    // if (getPost.length === 0) {
    //   return res.status(404).send({ success: false, message: "게시글이 존재하지 않습니다." });
    // }

    // 게시글 목록 조회 성공 응답
    return res.status(200).json({ success: true, data: getPost });
  } catch (err) {
    // 게시글 목록 조회 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "게시글 목록 조회에 실패하였습니다." });
  }
});

// 게시글 상세 조회
router.get("/post/:postId", async (req, res) => {
  const { postId } = req.params; // URL에서 게시글 ID 추출

  // // 게시글 ID가 숫자가 아닌 경우 오류 반환
  // if (isNaN(postId)) {
  //   return res.status(400).json({ success: false, message: "잘못된 게시글 ID입니다." });
  // }

  try {
    // 게시글 상세 정보 조회
    const getPost = await Post.findOne({
      // 중략: 특정 게시글 조회 로직
    });

    // 게시글이 존재하지 않을 경우 처리
    if (!getPost) {
      return res.status(404).json({ success: false, message: "게시글이 존재하지 않습니다." });
    }

    // 게시글 상세 조회 성공 응답
    return res.status(200).json({ success: true, data: getPost });
  } catch (err) {
    // 게시글 상세 조회 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "게시글 조회에 실패하였습니다." });
  }
});

// 게시글 수정
router.put("/post/:postId", isLoggedIn, async (req, res) => {
  const { postId } = req.params; // URL에서 게시글 ID 추출
  const { id } = res.locals.user; // 로그인한 사용자의 ID
  const { categoryName, title, content, multimediaUrl } = req.body; // 요청 본문에서 정보 추출

  // 게시글 ID가 숫자가 아닌 경우 오류 반환
  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: "잘못된 게시글 ID입니다." });
  }

  // 필수 입력 정보 검증
  if (!categoryName || !title || !content) {
    return res.status(400).json({ success: false, message: "필수 입력 정보가 누락되었습니다." });
  }

  try {
    // 게시글 정보 수정
    const updatePost = await Post.update({ categoryName, title, content, multimediaUrl }, { where: { id: postId, userId: id } });

    // 게시글이 존재하지 않거나 수정이 불가능한 경우 처리
    if (updatePost.size === 0) {
      return res.status(404).json({ success: false, message: "게시글이 존재하지 않습니다." });
    }

    // 게시글 수정 성공 응답
    return res.status(200).json({ success: true, message: "게시글 정보를 수정하였습니다." });
  } catch (err) {
    // 게시글 수정 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "게시글 수정에 실패하였습니다." });
  }
});

// 게시글 삭제
router.delete("/post/:postId", isLoggedIn, async (req, res) => {
  const { postId } = req.params; // URL에서 게시글 ID 추출
  const { id } = res.locals.user; // 로그인한 사용자의 ID

  // 게시글 ID가 숫자가 아닌 경우 오류 반환
  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: "잘못된 게시글 ID입니다." });
  }

  try {
    // 게시글 삭제
    const deletePost = await Post.destroy({ where: { id: postId, userId: id } });

    // 게시글이 존재하지 않거나 삭제가 불가능한 경우 처리
    if (!deletePost) {
      return res.status(404).json({ success: false, message: "게시글이 존재하지 않습니다." });
    }

    // 게시글 삭제 성공 응답
    return res.status(200).json({ success: true, message: "게시글을 삭제하였습니다." });
  } catch (err) {
    // 게시글 삭제 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "게시글 삭제에 실패하였습니다." });
  }
});

module.exports = router; // 라우터 모듈 내보내기
