const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, communityController.createCommunity);
router.get('/', communityController.getAllCommunities);
router.get('/:id/members', communityController.getCommunityMembers);
router.get('/me/owner', authenticateToken, communityController.getMyOwnedCommunities);
router.get('/me/member', authenticateToken, communityController.getMyJoinedCommunities);

module.exports = router;