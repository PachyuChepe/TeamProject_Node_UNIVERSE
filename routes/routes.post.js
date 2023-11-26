// 게시글 CRUD

const express = require("express");

const router = express.Router();
const { User, Post, Sequelize } = require("../sequelize/models/index.js");
const { isLoggedIn } = require("../middleware/middleware.verifyToken.js");

// Create (게시글 등록)
router.post("/post", isLoggedIn, async (req, res) => {
  const { id } = res.locals.user;
  const { categoryName, title, content } = req.body;

  try {
    if (!categoryName || !title || !content) {
      return res.status(400).json({ success: false, message: "필수 입력 정보가 누락되었습니다." });
    }

    const newPost = await Post.create({
      categoryName,
      title,
      content,
      userId: id,
    });

    if (!newPost) {
      return res.status(500).json({ success: false, message: "게시글을 생성할 수 없습니다." });
    }

    return res.status(201).json({ success: true, message: "게시글을 등록하였습니다.", data: newPost });
  } catch (err) {
    // console.error("무슨 에러임?", err);
    return res.status(500).json({ success: false, message: "용량이 너무 큽니다! 사진 업로드 기능은 베타버전 입니다." });
  }
});

// Read (게시글 목록 조회 - 뉴스피드)
router.get("/posts", async (req, res) => {
  const category = req.query.category; // 카테고리 쿼리 파라미터

  try {
    // 쿼리에 카테고리 필터링 조건 추가
    const getPost = await User.findAll({
      attributes: ["username", "profilePictureUrl"],
      include: [
        {
          model: Post,
          attributes: ["id", "categoryName", "title", "content", "createdAt"],
          where: category ? { categoryName: category } : { categoryName: "1" }, // 카테고리 필터
        },
      ],
    });

    if (getPost.length === 0) {
      return res.status(404).send({ success: false, message: "게시글이 존재하지 않습니다." });
    }

    return res.status(200).json({ success: true, data: getPost });
  } catch (err) {
    // console.error(err);
    return res.status(500).json({ success: false, message: "게시글 목록 조회에 실패하였습니다." });
  }
});

// Read (게시글 상세 조회)
router.get("/post/:postId", async (req, res) => {
  const { postId } = req.params;

  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: "잘못된 게시글 ID입니다." });
  }

  try {
    const getPost = await Post.findOne({
      attributes: ["id", "categoryName", "title", "content", "multimediaUrl", "createdAt"],
      where: { id: postId },
      include: [
        {
          model: User,
          attributes: ["username"],
          where: {
            id: Sequelize.col("Post.userId"),
          },
        },
      ],
    });

    if (!getPost) {
      return res.status(404).json({ success: false, message: "게시글이 존재하지 않습니다." });
    }

    return res.status(200).json({ success: true, data: getPost });
  } catch (err) {
    // console.error("조회 실패", err);
    return res.status(500).json({ success: false, message: "게시글 조회에 실패하였습니다." });
  }
});

// Update (게시글 정보 수정)
router.put("/post/:postId", isLoggedIn, async (req, res) => {
  const { postId } = req.params;
  const { id } = res.locals.user;
  const { categoryName, title, content, multimediaUrl } = req.body;

  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: "잘못된 게시글 ID입니다." });
  }

  if (!categoryName || !title || !content) {
    return res.status(400).json({ success: false, message: "필수 입력 정보가 누락되었습니다." });
  }

  try {
    const updatePost = await Post.update({ categoryName, title, content, multimediaUrl }, { where: { id: postId, userId: id } });

    if (updatePost[0] === 0) {
      return res.status(404).json({ success: false, message: "게시글이 존재하지 않습니다." });
    }

    return res.status(200).json({ success: true, message: "게시글 정보를 수정하였습니다." });
  } catch (err) {
    // console.error("뭐가문젠데", err);
    return res.status(500).json({ success: false, message: "게시글 수정에 실패하였습니다." });
  }
});

// Delete (게시글 삭제)
router.delete("/post/:postId", isLoggedIn, async (req, res) => {
  const { postId } = req.params;
  const { id } = res.locals.user;

  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: "잘못된 게시글 ID입니다." });
  }

  try {
    const deletePost = await Post.destroy({
      where: { id: postId, userId: id },
    });

    if (!deletePost) {
      return res.status(404).json({ success: false, message: "게시글이 존재하지 않습니다." });
    }

    return res.status(200).json({ success: true, message: "게시글을 삭제하였습니다." });
  } catch (err) {
    // console.error("뭐가문제임", err);
    return res.status(500).json({ success: false, message: "게시글 삭제에 실패하였습니다." });
  }
});

module.exports = router;
