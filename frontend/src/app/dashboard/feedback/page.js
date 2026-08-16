'use client';
import { useEffect, useState } from 'react';
import { getSUSQuestions, submitFeedback, getFeedbackResults } from '@/lib/api';

// ─── EXPERT/ADMIN — VIEW RESULTS ──────────────────────────────────────────────
function SUSResults({ user }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeedbackResults().then(setResults).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="loading-spinner" /><p>Loading SUS results...</p></div>;

  const avg = results?.average_sus;
  const count = results?.count || 0;
  const scoreColor = !avg ? 'var(--text-muted)' : avg >= 80 ? 'var(--success)' : avg >= 68 ? 'var(--warning)' : 'var(--danger)';
  const grade = !avg ? '—' : avg >= 90 ? 'Best Imaginable' : avg >= 80 ? 'Excellent' : avg >= 68 ? 'Good' : avg >= 51 ? 'OK' : 'Poor';

  return (
    <div>
      <div className="page-header">
        <span className="module-badge">📊 SUS Results</span>
        <h1 className="page-title" style={{ marginTop: 10 }}>System Usability Scale — Results</h1>
        <p className="page-subtitle">Aggregated SUS evaluation data from pilot participants in Tupi, South Cotabato</p>
      </div>

      <div className="grid-3 mb-lg">
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 48, fontFamily: 'var(--font-heading)', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
            {avg ? avg.toFixed(1) : '—'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Average SUS Score</div>
          {avg && <div style={{ marginTop: 10, display: 'inline-block', padding: '5px 16px', borderRadius: 'var(--radius-full)', background: scoreColor + '20', color: scoreColor, fontWeight: 700, fontSize: 14 }}>{grade}</div>}
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 48, fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{count}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Responses Collected</div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>Target: 30 farmers + 5 experts</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 48, fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--amber)', lineHeight: 1 }}>{count === 0 ? '0%' : `${Math.round((count / 35) * 100)}%`}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Pilot Completion Rate</div>
          <div style={{ marginTop: 10 }}>
            <div className="progress-bar-wrap"><div className="progress-bar-fill amber" style={{ width: `${Math.min(100, (count / 35) * 100)}%` }} /></div>
          </div>
        </div>
      </div>

      {/* SUS Scale Reference */}
      <div className="card mb-lg">
        <div className="card-title" style={{ marginBottom: 16 }}>SUS Score Reference</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { range: '90–100', grade: 'Best Imaginable', color: 'var(--success)',   pct: 100 },
            { range: '80–89',  grade: 'Excellent',       color: 'var(--success)',   pct: 89 },
            { range: '68–79',  grade: 'Good',            color: 'var(--warning)',   pct: 78 },
            { range: '51–67',  grade: 'OK',              color: 'var(--amber)',     pct: 60 },
            { range: '0–50',   grade: 'Poor',            color: 'var(--danger)',    pct: 50 },
          ].map((r) => (
            <div key={r.range} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 60, fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{r.range}</span>
              <div style={{ flex: 1 }}><div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${r.pct}%`, background: r.color }} /></div></div>
              <span style={{ width: 120, fontSize: 12, fontWeight: 600, color: r.color }}>{r.grade}</span>
              {avg && Math.round(avg) >= parseInt(r.range.split('–')[0]) && Math.round(avg) <= parseInt(r.range.split('–')[1]) && (
                <span style={{ fontSize: 11, color: r.color, fontWeight: 700 }}>← Current</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Individual Responses */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Individual Responses</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} total</span>
        </div>
        {count === 0 ? (
          <div className="empty-state">
            <p>No responses yet. Ask farmers to complete the SUS evaluation.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.responses.map((r) => {
              const sc = r.sus_score;
              const c = sc >= 80 ? 'var(--success)' : sc >= 68 ? 'var(--warning)' : 'var(--danger)';
              return (
                <div key={r.response_id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: c, minWidth: 60 }}>{sc.toFixed(1)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>User: {r.user_id} · {new Date(r.date).toLocaleDateString()}</div>
                    {r.comments && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>"{r.comments}"</div>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c, background: c + '20', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
                    {sc >= 90 ? 'Best Imaginable' : sc >= 80 ? 'Excellent' : sc >= 68 ? 'Good' : sc >= 51 ? 'OK' : 'Poor'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FARMER — SUBMIT FORM ─────────────────────────────────────────────────────
const SUS_REVERSE = [1, 3, 5, 7, 9];

function SUSForm() {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSUSQuestions().then(setQuestions).catch(console.error).finally(() => setLoading(false));
  }, []);

  function setRating(qId, rating) { setResponses((prev) => ({ ...prev, [qId]: rating })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (questions.some((q) => !responses[q.id])) { setError('Please answer all 10 questions before submitting.'); return; }
    setError(''); setSubmitting(true);
    try {
      const data = await submitFeedback({
        responses: questions.map((q, i) => ({ question_id: q.id, question_text: q.text, rating: responses[q.id], is_positive: SUS_REVERSE.includes(i + 1) })),
        comments,
      });
      setResult(data);
    } catch (err) { setError(err.message || 'Submission failed.'); }
    finally { setSubmitting(false); }
  }

  if (loading) return <div className="loading-center"><div className="loading-spinner" /></div>;

  if (result) {
    const sc = result.sus_score; const c = sc >= 80 ? 'var(--success)' : sc >= 68 ? 'var(--warning)' : 'var(--danger)';
    return (
      <div>
        <div className="page-header"><span className="module-badge">✦ Feedback / SUS</span><h1 className="page-title" style={{ marginTop: 10 }}>Thank You!</h1></div>
        <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 64, fontWeight: 800, color: c, lineHeight: 1 }}>{sc.toFixed(1)}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Your SUS Score</div>
          <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 'var(--radius-full)', background: c + '20', color: c, fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{result.grade}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Your evaluation has been recorded. Thank you for helping improve AgriInsights!</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 14px' }}>Response ID: {result.response_id}</div>
          <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => setResult(null)}>Submit Another</button>
        </div>
      </div>
    );
  }

  const answered = Object.keys(responses).length;
  return (
    <div>
      <div className="page-header">
        <span className="module-badge">✦ Feedback / SUS</span>
        <h1 className="page-title" style={{ marginTop: 10 }}>System Usability Scale Evaluation</h1>
        <p className="page-subtitle">Rate your experience with AgriInsights — your feedback directly helps improve the platform for all farmers.</p>
      </div>
      <div className="card mb-lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Progress</span>
          <span style={{ fontSize: 13, color: 'var(--primary)' }}>{answered} / 10 answered</span>
        </div>
        <div className="progress-bar-wrap"><div className="progress-bar-fill green" style={{ width: `${(answered / 10) * 100}%` }} /></div>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ background: 'var(--primary-glow)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          📋 <strong>Instructions:</strong> Select 1 (Strongly Disagree) to 5 (Strongly Agree) for each statement.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {questions.map((q, i) => (
            <div key={q.id} className="sus-question" id={`sus-q${i + 1}`}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: responses[q.id] ? 'var(--primary)' : 'var(--bg-surface)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: responses[q.id] ? 'white' : 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</span>
                <div className="sus-question-text" style={{ marginBottom: 0 }}>{q.text}</div>
              </div>
              <div className="likert-scale">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" id={`sus-q${i + 1}-r${n}`}
                    className={`likert-btn ${responses[q.id] === n ? 'selected' : ''}`}
                    onClick={() => setRating(q.id, n)}>{n}</button>
                ))}
              </div>
              <div className="likert-labels"><span>Strongly Disagree</span><span>Strongly Agree</span></div>
            </div>
          ))}
        </div>
        <div className="card mb-lg">
          <div className="card-title" style={{ marginBottom: 12 }}>Additional Comments (Optional)</div>
          <textarea id="sus-comments" className="form-control form-textarea" placeholder="Share any additional feedback..." value={comments} onChange={(e) => setComments(e.target.value)} />
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>{error}</div>}
        <button id="sus-submit-btn" className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
          {submitting ? <><div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Submitting...</> : `Submit SUS Evaluation (${answered}/10 answered)`}
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>🔒 Responses are anonymized · RA 10173 — Data Privacy Act of 2012</div>
      </form>
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function FeedbackPage() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const u = localStorage.getItem('agri_user');
    if (u) setUser(JSON.parse(u));
  }, []);
  if (!user) return <div className="loading-center"><div className="loading-spinner" /></div>;
  if (user.role === 'expert' || user.role === 'admin') return <SUSResults user={user} />;
  return <SUSForm />;
}
