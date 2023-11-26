const express = require("express");

const router = express.Router();
const { User, Post, Comment, Sequelize } = require("../sequelize/models/index.js");
const { isLoggedIn } = require("../middleware/middleware.verifyToken.js");

// 댓글 CRUD 라우터

// 댓글 생성 (Create)
router.post("/post/:postId/comment", isLoggedIn, async (req, res) => {
  const { id } = res.locals.user; // 로그인한 사용자 ID
  const { postId } = req.params; // URL에서 게시글 ID 추출
  const { content } = req.body; // 요청 본문에서 댓글 내용 추출

  // postId가 숫자가 아닌 경우 오류 반환
  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: "잘못된 게시글 ID입니다." });
  }

  try {
    // 댓글 내용이 없는 경우 오류 반환
    if (!content) {
      return res.status(400).json({ success: false, message: "필수 입력 정보가 누락되었습니다." });
    }

    // 새 댓글 생성
    const newComment = await Comment.create({
      userId: id,
      postId: postId,
      content,
    });

    // 댓글 생성 실패 시 오류 반환
    if (!newComment) {
      return res.status(500).json({ success: false, message: "댓글을 생성할 수 없습니다." });
    }

    // 댓글 생성 성공 응답
    return res.status(201).json({ success: true, message: "댓글을 등록하였습니다.", data: newComment });
  } catch (err) {
    // 댓글 생성 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "댓글 등록에 실패하였습니다." });
  }
});

// 특정 게시글의 모든 댓글 조회 (Read)
router.get("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params; // URL에서 게시글 ID 추출

  // postId가 숫자가 아닌 경우 오류 반환
  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: "잘못된 유저 ID입니다." });
  }

  try {
    // 특정 게시글에 대한 모든 댓글 조회
    const getComment = await User.findAll({
      attributes: ["username"],
      include: [
        {
          model: Comment,
          attributes: ["id", "content", "createdAt"],
          where: { postId },
        },
      ],
    });

    // 댓글이 없는 경우 404 오류 반환
    if (getComment.length === 0) {
      return res.status(404).send({ success: false, message: "댓글이 존재하지 않습니다." });
    }

    // 댓글 조회 성공 응답
    return res.status(200).json({ success: true, data: getComment });
  } catch (err) {
    // 댓글 조회 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "댓글 목록 조회에 실패하였습니다." });
  }
});

// 댓글 상세 조회 (Read)
router.get("/comment/:commentId", async (req, res) => {
  const { commentId } = req.params; // URL에서 댓글 ID 추출

  // commentId가 숫자가 아닌 경우 오류 반환
  if (isNaN(commentId)) {
    return res.status(400).json({ success: false, message: "잘못된 댓글 ID입니다." });
  }

  try {
    // 특정 댓글 상세 정보 조회
    const getComment = await Comment.findOne({
      attributes: ["id", "content", "createdAt"],
      where: { id: commentId },
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    // 댓글이 없는 경우 404 오류 반환
    if (!getComment) {
      return res.status(404).json({ success: false, message: "댓글이 존재하지 않습니다." });
    }

    // 댓글 상세 정보 조회 성공 응답
    return res.status(200).json({ success: true, data: getComment });
  } catch (err) {
    // 댓글 상세 조회 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "댓글 조회에 실패하였습니다." });
  }
});

// 댓글 수정 (Update)
router.put("/comment/:commentId", isLoggedIn, async (req, res) => {
  const { commentId } = req.params; // URL에서 댓글 ID 추출
  const { id } = res.locals.user; // 로그인한 사용자 ID
  const { content } = req.body; // 요청 본문에서 댓글 내용 추출

  // commentId가 숫자가 아닌 경우 오류 반환
  if (isNaN(commentId)) {
    return res.status(400).json({ success: false, message: "잘못된 댓글 ID입니다." });
  }

  // 댓글 내용이 없는 경우 오류 반환
  if (!content) {
    return res.status(400).json({ success: false, message: "필수 입력 정보가 누락되었습니다." });
  }

  try {
    // 댓글 내용 업데이트
    const updateComment = await Comment.update({ content }, { where: { id: commentId, userId: id } });

    // 업데이트된 댓글이 없는 경우 404 오류 반환
    if (updateComment[0] === 0) {
      return res.status(404).json({ success: false, message: "댓글이 존재하지 않습니다." });
    }

    // 댓글 수정 성공 응답
    return res.status(200).json({ success: true, message: "댓글 정보를 수정하였습니다." });
  } catch (err) {
    // 댓글 수정 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "댓글 수정에 실패하였습니다." });
  }
});

// 댓글 삭제 (Delete)
router.delete("/comment/:commentId", isLoggedIn, async (req, res) => {
  const { commentId } = req.params; // URL에서 댓글 ID 추출
  const { id } = res.locals.user; // 로그인한 사용자 ID

  // commentId가 숫자가 아닌 경우 오류 반환
  if (isNaN(commentId)) {
    return res.status(400).json({ success: false, message: "잘못된 댓글 ID입니다." });
  }

  try {
    // 댓글 삭제
    const deleteComment = await Comment.destroy({ where: { id: commentId, userId: id } });

    // 삭제할 댓글이 없는 경우 404 오류 반환
    if (!deleteComment) {
      return res.status(404).json({ success: false, message: "댓글이 존재하지 않습니다." });
    }

    // 댓글 삭제 성공 응답
    return res.status(200).json({ success: true, message: "댓글을 삭제하였습니다." });
  } catch (err) {
    // 댓글 삭제 중 오류 발생 시 처리
    return res.status(500).json({ success: false, message: "댓글 삭제에 실패하였습니다." });
  }
});

module.exports = router; // 라우터 모듈 내보내기
