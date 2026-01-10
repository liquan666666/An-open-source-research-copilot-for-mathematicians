'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [daily, setDaily] = useState<any>(null);
  const [productivity, setProductivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      const [overviewRes, dailyRes, productivityRes] = await Promise.all([
        fetch(`${API_BASE}/stats/overview`),
        fetch(`${API_BASE}/stats/daily?days=14`),
        fetch(`${API_BASE}/stats/productivity`)
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (dailyRes.ok) setDaily(await dailyRes.json());
      if (productivityRes.ok) setProductivity(await productivityRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Home</Link>
      </div>

      <h1>Research Dashboard</h1>

      {/* Overview Cards */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Total Tasks</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2196f3' }}>{overview.tasks.total}</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              <span style={{ color: '#4caf50' }}>{overview.tasks.completed} completed</span>
              {' • '}
              <span style={{ color: '#ff9800' }}>{overview.tasks.in_progress} in progress</span>
            </div>
          </div>

          <div style={{ padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Completion Rate</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4caf50' }}>{overview.tasks.completion_rate}%</div>
            <div style={{ marginTop: '10px', height: '8px', background: '#e0e0e0', borderRadius: '4px' }}>
              <div style={{ width: `${overview.tasks.completion_rate}%`, height: '100%', background: '#4caf50', borderRadius: '4px' }} />
            </div>
          </div>

          <div style={{ padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Total Research Time</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#9c27b0' }}>{overview.time.total_hours}h</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              {overview.time.total_checkins} check-ins recorded
            </div>
          </div>

          <div style={{ padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Paper Library</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff5722' }}>{overview.papers.total}</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              {overview.papers.focus} focus papers
            </div>
          </div>
        </div>
      )}

      {/* Daily Activity Chart */}
      {daily && daily.daily_data && (
        <div style={{ marginBottom: '30px', padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0 }}>Daily Activity (Last 14 Days)</h2>

          <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '4px', marginTop: '20px' }}>
            {daily.daily_data.map((day: any, idx: number) => {
              const maxMinutes = Math.max(...daily.daily_data.map((d: any) => d.total_minutes));
              const height = maxMinutes > 0 ? (day.total_minutes / maxMinutes * 160) : 0;
              const hasData = day.total_minutes > 0;

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${height}px`,
                      background: hasData ? '#2196f3' : '#e0e0e0',
                      borderRadius: '4px 4px 0 0',
                      position: 'relative',
                      cursor: hasData ? 'pointer' : 'default',
                    }}
                    title={`${day.date}\n${day.total_minutes}min (${Math.round(day.total_minutes / 60)}h)\n${day.completed_tasks}/${day.total_tasks} tasks completed`}
                  />
                  <div style={{ fontSize: '10px', color: '#666', writingMode: idx % 2 === 0 ? 'horizontal-tb' : 'horizontal-tb' }}>
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px', fontSize: '14px' }}>
            <strong>Total for period:</strong>{' '}
            {Math.round(daily.daily_data.reduce((sum: number, d: any) => sum + d.total_minutes, 0) / 60)}h •{' '}
            {daily.daily_data.reduce((sum: number, d: any) => sum + d.completed_tasks, 0)} tasks completed •{' '}
            {daily.daily_data.reduce((sum: number, d: any) => sum + d.checkins, 0)} check-ins
          </div>
        </div>
      )}

      {/* Theory vs Computation */}
      {productivity && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={{ padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2 style={{ marginTop: 0 }}>Theory vs Computation</h2>

            <div style={{ display: 'flex', height: '40px', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
              <div
                style={{
                  width: `${productivity.ratio.theory_ratio * 100}%`,
                  background: '#2196f3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {productivity.ratio.theory_ratio > 0.15 && `${Math.round(productivity.ratio.theory_ratio * 100)}%`}
              </div>
              <div
                style={{
                  width: `${productivity.ratio.computation_ratio * 100}%`,
                  background: '#9c27b0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {productivity.ratio.computation_ratio > 0.15 && `${Math.round(productivity.ratio.computation_ratio * 100)}%`}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#2196f3', borderRadius: '2px' }} />
                  <strong>Theory</strong>
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {productivity.theory.total_hours}h • {productivity.theory.tasks_completed} tasks
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  ~{productivity.theory.avg_minutes_per_task}min per task
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', justifyContent: 'flex-end' }}>
                  <strong>Computation</strong>
                  <div style={{ width: '12px', height: '12px', background: '#9c27b0', borderRadius: '2px' }} />
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {productivity.computation.total_hours}h • {productivity.computation.tasks_completed} tasks
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  ~{productivity.computation.avg_minutes_per_task}min per task
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2 style={{ marginTop: 0 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/tasks"
                style={{
                  padding: '12px',
                  background: '#0070f3',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                View Today's Tasks
              </Link>
              <Link
                href="/papers"
                style={{
                  padding: '12px',
                  background: '#ff5722',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                Browse Paper Library
              </Link>
              <Link
                href="/roadmap"
                style={{
                  padding: '12px',
                  background: '#4caf50',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                View Research Roadmap
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
