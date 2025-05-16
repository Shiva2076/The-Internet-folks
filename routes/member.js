const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, memberController.addMember);
router.delete('/:id', authenticateToken, memberController.removeMember);

module.exports = router;