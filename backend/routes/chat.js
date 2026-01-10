const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { chatWithGemini, refineText, getChatHistory } = require('../controllers/chatController');

// @route   POST api/chat
// @desc    Chat with AI Assistant
// @access  Private
router.get('/', auth, getChatHistory);
router.post('/', auth, chatWithGemini);

// @route   POST api/chat/refine
// @desc    Refine text with AI
router.post('/refine', auth, refineText);

module.exports = router;
