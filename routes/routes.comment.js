// 댓글 CRUD

const express = require("express");

const router = express.Router();
const { User, Post, Comment, Sequelize } = require("../sequelize/models/index.js");
const { isLoggedIn } = require("../middleware/middleware.verifyToken.js");

// Create (댓글 등록)
router.post("/post/:postId/comment", isLoggedIn, async (req, res) => {
  const { id } = res.locals.user;
  const { postId } = req.params;
  const { content } = req.body;

  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: "잘못된 게시글 ID입니다." });
  }

  try {
    if (!content) {
      return res.status(400).json({ success: false, message: "필수 입력 정보가 누락되었습니다." });
    }

    const newComment = await Comment.create({
      userId: id,
      postId: postId,
      content,
    });

    if (!newComment) {
      return res.status(500).json({ success: false, message: "댓글을 생성할 수 없습니다." });
    }

    return res.status(201).json({ success: true, message: "댓글을 등록하였습니다.", data: newComment });
  } catch (err) {
    // console.error("무슨 에러임?", err);
    return res.status(500).json({ success: false, message: "댓글 등록에 실패하였습니다." });
  }
});

// Read (특정 게시글의 모든 댓글 조회)
router.get("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;

  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: "잘못된 유저 ID입니다." });
  }

  try {
    const getComment = await User.findAll({
      attributes: ["username"],
      include: [
        {
          model: Comment,
          attributes: ["id", "content", "createdAt"],
          where: {
            postId,
          },
        },
      ],
    });

    if (getComment.length === 0) {
      return res.status(404).send({ success: false, message: "댓글이 존재하지 않습니다." });
    }

    return res.status(200).json({ success: true, data: getComment });
  } catch (err) {
    // console.error(err);
    return res.status(500).json({ success: false, message: "댓글 목록 조회에 실패하였습니다." });
  }
});

// Read (댓글 상세 조회)
router.get("/comment/:commentId", async (req, res) => {
  const { commentId } = req.params;

  if (isNaN(commentId)) {
    return res.status(400).json({ success: false, message: "잘못된 댓글 ID입니다." });
  }

  try {
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

    if (!getComment) {
      return res.status(404).json({ success: false, message: "댓글이 존재하지 않습니다." });
    }

    return res.status(200).json({ success: true, data: getComment });
  } catch (err) {
    // console.error("조회 실패", err);
    return res.status(500).json({ success: false, message: "댓글 조회에 실패하였습니다." });
  }
});

// Update (댓글 정보 수정)
router.put("/comment/:commentId", isLoggedIn, async (req, res) => {
  const { commentId } = req.params;
  const { id } = res.locals.user;
  const { content } = req.body;

  if (isNaN(commentId)) {
    return res.status(400).json({ success: false, message: "잘못된 댓글 ID입니다." });
  }

  if (!content) {
    return res.status(400).json({ success: false, message: "필수 입력 정보가 누락되었습니다." });
  }

  try {
    const updateComment = await Comment.update({ content }, { where: { id: commentId, userId: id } });

    if (updateComment[0] === 0) {
      return res.status(404).json({ success: false, message: "댓글이 존재하지 않습니다." });
    }

    return res.status(200).json({ success: true, message: "댓글 정보를 수정하였습니다." });
  } catch (err) {
    // console.error("뭐가문젠데", err);
    return res.status(500).json({ success: false, message: "댓글 수정에 실패하였습니다." });
  }
});

// Delete (댓글 삭제)
router.delete("/comment/:commentId", isLoggedIn, async (req, res) => {
  const { commentId } = req.params;
  const { id } = res.locals.user;

  if (isNaN(commentId)) {
    return res.status(400).json({ success: false, message: "잘못된 댓글 ID입니다." });
  }

  try {
    const deleteComment = await Comment.destroy({
      where: { id: commentId, userId: id },
    });

    if (!deleteComment) {
      return res.status(404).json({ success: false, message: "댓글이 존재하지 않습니다." });
    }

    return res.status(200).json({ success: true, message: "댓글을 삭제하였습니다." });
  } catch (err) {
    // console.error("뭐가문제임", err);
    return res.status(500).json({ success: false, message: "댓글 삭제에 실패하였습니다." });
  }
});

module.exports = router;
