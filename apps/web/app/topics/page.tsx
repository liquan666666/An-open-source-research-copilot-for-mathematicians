'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export default function TopicsPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [focusArea, setFocusArea] = useState('');

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError('');

      const body: any = { max_results: 5 };
      if (difficulty) body.difficulty = difficulty;
      if (focusArea) body.focus_area = focusArea;

      const response = await fetch(`${API_BASE}/topics/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to load recommendations');
      }

      const data = await response.json();
      setTopics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return '#4caf50';
      case 'intermediate': return '#ff9800';
      case 'advanced': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getMixColor = (mix: string) => {
    switch (mix) {
      case 'theory': return '#2196f3';
      case 'computation': return '#9c27b0';
      case 'mixed': return '#00bcd4';
      default: return '#9e9e9e';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Home</Link>
      </div>

      <h1>Research Topic Recommendations</h1>

      <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
        Get personalized research topic recommendations based on your profile, MSC codes, and keywords.
      </p>

      {error && (
        <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', marginBottom: '20px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Filters</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Focus Area (optional)</label>
            <input
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="e.g., topology, geometry"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
        </div>
        <button
          onClick={loadRecommendations}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Get Recommendations'}
        </button>
      </div>

      {/* Recommendations */}
      {topics.length === 0 && !loading && (
        <div style={{ padding: '40px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Click "Get Recommendations" to see personalized research topics.
          </p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Make sure you have set up your <Link href="/profile" style={{ color: '#0070f3' }}>research profile</Link> first.
          </p>
        </div>
      )}

      {topics.length > 0 && (
        <div>
          <h2>Recommended Topics ({topics.length})</h2>
          {topics.map((topic, idx) => (
            <div
              key={idx}
              style={{
                padding: '20px',
                background: 'white',
                border: '1px solid #ddd',
                marginBottom: '20px',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span
                  style={{
                    padding: '4px 12px',
                    background: getDifficultyColor(topic.difficulty),
                    color: 'white',
                    fontSize: '12px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {topic.difficulty.toUpperCase()}
                </span>
                <span
                  style={{
                    padding: '4px 12px',
                    background: getMixColor(topic.theory_computation_mix),
                    color: 'white',
                    fontSize: '12px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {topic.theory_computation_mix.toUpperCase()}
                </span>
                <span
                  style={{
                    padding: '4px 12px',
                    background: '#607d8b',
                    color: 'white',
                    fontSize: '12px',
                    borderRadius: '12px',
                  }}
                >
                  ~{topic.estimated_weeks} weeks
                </span>
              </div>

              <h3 style={{ marginTop: '10px', marginBottom: '10px' }}>{topic.title}</h3>

              <div style={{ marginBottom: '15px', lineHeight: '1.6', color: '#333' }}>
                {topic.description}
              </div>

              <div style={{ marginBottom: '15px', padding: '10px', background: '#e3f2fd', borderRadius: '4px', borderLeft: '4px solid #2196f3' }}>
                <strong>Why this topic?</strong>
                <div style={{ marginTop: '5px', color: '#555' }}>{topic.motivation}</div>
              </div>

              {topic.related_papers && topic.related_papers.length > 0 && (
                <div>
                  <strong style={{ fontSize: '14px' }}>Related Papers:</strong>
                  <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                    {topic.related_papers.map((paper: any, pidx: number) => (
                      <li key={pidx} style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                        {paper.title} ({paper.year})
                        <a
                          href={`https://arxiv.org/abs/${paper.ext_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginLeft: '10px', color: '#0070f3', fontSize: '13px' }}
                        >
                          arXiv:{paper.ext_id}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
