const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { susQuestions, feedbackResponses } = require('../data/mockData');

const router = express.Router();

// GET /api/feedback/questions — SUS questionnaire
router.get('/questions', authMiddleware, (req, res) => {
  res.json(susQuestions);
});

// POST /api/feedback/submit — submit SUS response
router.post('/submit', authMiddleware, (req, res) => {
  const { responses, comments } = req.body;
  if (!responses || !Array.isArray(responses)) {
    return res.status(400).json({ error: 'Responses array is required' });
  }

  // Calculate SUS score
  let score = 0;
  responses.forEach((r, i) => {
    const rating = parseInt(r.rating);
    if (i % 2 === 0) score += rating - 1;       // odd questions
    else score += 5 - rating;                    // even questions
  });
  const susScore = score * 2.5;

  const entry = {
    response_id: `resp_${Date.now()}`,
    user_id: req.user.user_id,
    responses,
    comments: comments || '',
    sus_score: susScore,
    date: new Date().toISOString(),
  };
  feedbackResponses.push(entry);

  let grade = 'Excellent';
  if (susScore < 51) grade = 'Poor';
  else if (susScore < 68) grade = 'OK';
  else if (susScore < 80) grade = 'Good';
  else if (susScore < 90) grade = 'Excellent';
  else grade = 'Best Imaginable';

  res.json({ success: true, sus_score: susScore, grade, response_id: entry.response_id });
});

// GET /api/feedback/results — aggregated results (expert/admin)
router.get('/results', authMiddleware, (req, res) => {
  if (!['expert', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access restricted to experts and admins' });
  }
  const avg = feedbackResponses.length
    ? feedbackResponses.reduce((s, r) => s + r.sus_score, 0) / feedbackResponses.length
    : null;
  res.json({ responses: feedbackResponses, count: feedbackResponses.length, average_sus: avg });
});

module.exports = router;
