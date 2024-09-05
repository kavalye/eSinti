const express = require('express');
const { sendFriendRequest, respondFriendRequest, getFriends } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/friend-request/:receiverId', authMiddleware, sendFriendRequest);
router.post('/friend-request/:requestId/respond', authMiddleware, respondFriendRequest);
router.get('/friends', authMiddleware, getFriends);

module.exports = router;
