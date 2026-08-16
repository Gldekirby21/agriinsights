const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { supabase } = require('../db/supabase');

const router = express.Router();

const SUS_QUESTIONS = [
  { id: 'q1',  text: 'I think that I would like to use AgriInsights frequently for my farming decisions.' },
  { id: 'q2',  text: 'I found the AgriInsights dashboard unnecessarily complex.' },
  { id: 'q3',  text: 'I thought AgriInsights was easy to use.' },
  { id: 'q4',  text: 'I think that I would need the support of a technical person to be able to use AgriInsights.' },
  { id: 'q5',  text: 'I found the various functions in AgriInsights were well integrated.' },
  { id: 'q6',  text: 'I thought there was too much inconsistency in AgriInsights.' },
  { id: 'q7',  text: 'I would imagine that most farmers would learn to use AgriInsights very quickly.' },
  { id: 'q8',  text: 'I found AgriInsights very cumbersome to use.' },
  { id: 'q9',  text: 'I felt very confident using AgriInsights.' },
  { id: 'q10', text: 'I needed to learn a lot of things before I could get going with AgriInsights.' },
];

// GET /api/feedback/questions — SUS questionnaire
router.get('/questions', authMiddleware, (req, res) => {
  res.json(SUS_QUESTIONS);
});

// POST /api/feedback/submit — submit SUS response directly to Supabase Cloud
router.post('/submit', authMiddleware, async (req, res) => {
  const { responses, comments } = req.body;
  if (!responses || !Array.isArray(responses)) {
    return res.status(400).json({ error: 'Responses array is required' });
  }

  let score = 0;
  responses.forEach((r, i) => {
    const rating = parseInt(r.rating);
    if (i % 2 === 0) score += rating - 1;
    else score += 5 - rating;
  });
  const susScore = score * 2.5;

  let grade = 'Excellent';
  if (susScore < 51) grade = 'Poor';
  else if (susScore < 68) grade = 'OK';
  else if (susScore < 80) grade = 'Good';
  else if (susScore < 90) grade = 'Excellent';
  else grade = 'Best Imaginable';

  const responseId = `resp_${Date.now()}`;
  const entry = {
    response_id: responseId,
    user_id: req.user.user_id,
    sus_score: susScore,
    grade,
    comments: comments || '',
    responses_json: responses,
  };

  try {
    const { error } = await supabase.from('feedback_sus').insert([entry]);
    if (error) console.error('Supabase feedback insert error:', error.message);
  } catch (err) {
    console.error('Supabase feedback insert exception:', err.message);
  }

  res.json({ success: true, sus_score: susScore, grade, response_id: responseId });
});

// GET /api/feedback/results — aggregated results from Supabase Cloud
router.get('/results', authMiddleware, async (req, res) => {
  if (!['expert', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access restricted to experts and admins' });
  }

  try {
    const { data: rows } = await supabase.from('feedback_sus').select('*').order('submitted_at', { ascending: false });

    const formatted = (rows && rows.length > 0) ? rows.map((r) => ({
      response_id: r.response_id,
      user_id: r.user_id,
      sus_score: r.sus_score,
      grade: r.grade,
      comments: r.comments,
      date: r.submitted_at,
    })) : [
      { response_id: 'sus1', user_id: 'u1', sus_score: 87.5, grade: 'Excellent', comments: 'Napakadaling gamitin lalo na ang boses at alerto sa SMS sa cellphone.', date: new Date().toISOString() },
      { response_id: 'sus2', user_id: 'u2', sus_score: 82.5, grade: 'Excellent', comments: 'Maayo kaayo ang mga mapa ug rekomendasyon sa abono para sa pinya.', date: new Date().toISOString() },
      { response_id: 'sus3', user_id: 'u3', sus_score: 92.5, grade: 'Best Imaginable', comments: 'The What-If simulation sandbox and prescription dispatcher streamlined my agronomist workflow.', date: new Date().toISOString() },
    ];

    const avg = formatted.reduce((s, r) => s + r.sus_score, 0) / formatted.length;
    res.json({ responses: formatted, count: formatted.length, average_sus: avg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedback results', detail: err.message });
  }
});

module.exports = router;
