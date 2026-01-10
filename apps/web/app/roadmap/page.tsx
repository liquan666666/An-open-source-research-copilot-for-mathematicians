'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    duration_weeks: 8,
  });

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/roadmap/current`);
      if (response.ok) {
        const data = await response.json();
        setRoadmap(data);

        if (data) {
          const progressResp = await fetch(`${API_BASE}/roadmap/progress`);
          if (progressResp.ok) {
            const progressData = await progressResp.json();
            setProgress(progressData);
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError('');

      const response = await fetch(`${API_BASE}/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create roadmap');
      }

      alert('Roadmap created successfully!');
      setShowCreateForm(false);
      loadRoadmap();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateWeekStatus = async (weekNum: number, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/roadmap/week/${weekNum}?status=${status}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to update week status');
      }

      loadRoadmap();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this roadmap? This cannot be undone.')) return;

    try {
      await fetch(`${API_BASE}/roadmap`, { method: 'DELETE' });
      setRoadmap(null);
      setProgress(null);
      alert('Roadmap deleted');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'in_progress': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Home</Link>
      </div>

      <h1>Research Roadmap</h1>

      {error && (
        <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', marginBottom: '20px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {!roadmap && !showCreateForm && (
        <div style={{ padding: '40px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
          <h2>No Research Roadmap Yet</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Create a structured research roadmap with milestones and weekly plans.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '12px 24px',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Create Roadmap
          </button>
        </div>
      )}

      {showCreateForm && (
        <div style={{ marginBottom: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0 }}>Create Research Roadmap</h2>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Research Topic *
              </label>
              <input
                type="text"
                required
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Persistent Homology in Topological Data Analysis"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Brief description of what you want to achieve..."
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Duration (weeks)
              </label>
              <input
                type="number"
                min="2"
                max="52"
                value={formData.duration_weeks}
                onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={creating}
                style={{
                  padding: '10px 20px',
                  background: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: creating ? 'not-allowed' : 'pointer',
                }}
              >
                {creating ? 'Creating...' : 'Create Roadmap'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '10px 20px',
                  background: '#ccc',
                  color: 'black',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {roadmap && (
        <div>
          {/* Progress Overview */}
          {progress && (
            <div style={{ marginBottom: '30px', padding: '20px', background: '#e3f2fd', borderRadius: '8px' }}>
              <h2 style={{ marginTop: 0 }}>{roadmap.data.topic}</h2>
              <p style={{ color: '#666' }}>{roadmap.data.description}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '15px' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0070f3' }}>
                    {progress.progress_percentage}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Overall Progress</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                    Week {progress.current_week}/{progress.total_weeks}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Current Week</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                    {progress.completed_milestones}/{progress.total_milestones}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Milestones</div>
                </div>
              </div>

              <button
                onClick={handleDelete}
                style={{
                  marginTop: '15px',
                  padding: '8px 16px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Delete Roadmap
              </button>
            </div>
          )}

          {/* Milestones */}
          <div style={{ marginBottom: '30px' }}>
            <h2>Key Milestones</h2>
            {roadmap.data.milestones.map((milestone: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: '15px',
                  background: 'white',
                  border: '1px solid #ddd',
                  marginBottom: '10px',
                  borderRadius: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                      Week {milestone.week}: {milestone.title}
                    </div>
                    <div style={{ color: '#666', marginBottom: '10px' }}>{milestone.description}</div>
                    <div style={{ fontSize: '14px' }}>
                      <strong>Deliverables:</strong>
                      <ul style={{ marginTop: '5px', marginBottom: '5px', paddingLeft: '20px' }}>
                        {milestone.deliverables.map((d: string, didx: number) => (
                          <li key={didx}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Theory: {milestone.theory_hours}h<br />
                    Computation: {milestone.computation_hours}h
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Plans */}
          <div>
            <h2>Weekly Plans</h2>
            {roadmap.data.weekly_plans.map((week: any) => (
              <div
                key={week.week}
                style={{
                  padding: '15px',
                  background: 'white',
                  border: `2px solid ${getStatusColor(week.status)}`,
                  marginBottom: '10px',
                  borderRadius: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <div>
                    <span
                      style={{
                        padding: '4px 12px',
                        background: getStatusColor(week.status),
                        color: 'white',
                        fontSize: '12px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        marginRight: '10px',
                      }}
                    >
                      {week.status.toUpperCase()}
                    </span>
                    <strong style={{ fontSize: '16px' }}>Week {week.week}</strong>
                    <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
                      {week.start_date} to {week.end_date}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {week.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdateWeekStatus(week.week, 'completed')}
                        style={{
                          padding: '5px 10px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ fontSize: '14px' }}>Goals:</strong>
                  <ul style={{ marginTop: '5px', marginBottom: '0', paddingLeft: '20px' }}>
                    {week.goals.map((goal: string, gidx: number) => (
                      <li key={gidx} style={{ fontSize: '14px' }}>{goal}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
