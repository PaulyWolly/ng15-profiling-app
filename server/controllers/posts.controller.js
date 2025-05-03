const express = require('express');
const router = express.Router();
const Post = require('../users/post.model');

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { sender, recipient, content } = req.body;
    const post = new Post({ sender, recipient, content });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all posts for a user (sent or received)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const posts = await Post.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
      .populate('sender', 'firstName lastName profileImage')
      .populate('recipient', 'firstName lastName profileImage')
      .populate('replies.sender', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add a reply to a post
router.post('/:id/reply', async (req, res) => {
  try {
    const { sender, content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.replies.push({ sender, content });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 