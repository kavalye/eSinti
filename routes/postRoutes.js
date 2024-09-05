const express = require('express');
const { createPost, getFeed, likePost, dislikePost } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createPost);
router.get('/feed', authMiddleware, getFeed);
router.post('/:postId/like', authMiddleware, likePost);
router.post('/:postId/dislike', authMiddleware, dislikePost);

module.exports = router;
