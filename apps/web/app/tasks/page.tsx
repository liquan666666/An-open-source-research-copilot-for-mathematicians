'use client';

import { useState, useEffect } from 'react';
import { tasksApi, checkinsApi } from '@/lib/api';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [checkinMinutes, setCheckinMinutes] = useState(60);
  const [checkinNote, setCheckinNote] = useState('');
  const [checkinStatus, setCheckinStatus] = useState('completed');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getToday();
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTasks = async () => {
    try {
      setError('');
      const data = await tasksApi.generateToday();
      setTasks(data);
      alert('Today\'s tasks generated!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetTasks = async () => {
    if (!confirm('Delete all tasks for today?')) return;
    try {
      await tasksApi.resetToday();
      setTasks([]);
      alert('Tasks reset!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (taskId: number, status: string) => {
    try {
      await tasksApi.update(taskId, { status });
      loadTasks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      await checkinsApi.create({
        task_id: selectedTask.id,
        minutes: checkinMinutes,
        note: checkinNote,
        status: checkinStatus,
      });
      alert('Check-in recorded!');
      setSelectedTask(null);
      setCheckinNote('');
      setCheckinMinutes(60);
      setCheckinStatus('completed');
      loadTasks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return '#4caf50';
      case 'in_progress': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done': return 'Done';
      case 'in_progress': return 'In Progress';
      default: return 'To Do';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Home</Link>
      </div>

      <h1>Today's Tasks</h1>

      {error && (
        <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', marginBottom: '20px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={handleGenerateTasks}
          disabled={tasks.length > 0}
          style={{
            padding: '10px 20px',
            background: tasks.length > 0 ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: tasks.length > 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Generate Today's Tasks
        </button>
        {tasks.length > 0 && (
          <button
            onClick={handleResetTasks}
            style={{
              padding: '10px 20px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reset Tasks
          </button>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : tasks.length === 0 ? (
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
          No tasks for today. Click "Generate Today's Tasks" to create them.
        </div>
      ) : (
        <div>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                padding: '15px',
                background: 'white',
                border: `2px solid ${getStatusColor(task.status)}`,
                marginBottom: '15px',
                borderRadius: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        background: getStatusColor(task.status),
                        color: 'white',
                        fontSize: '12px',
                        borderRadius: '3px',
                      }}
                    >
                      {getStatusLabel(task.status)}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        background: task.kind === 'theory' ? '#2196f3' : '#ff9800',
                        color: 'white',
                        fontSize: '12px',
                        borderRadius: '3px',
                      }}
                    >
                      {task.kind === 'theory' ? 'Theory' : 'Computation'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' }}>
                    {task.title}
                  </div>
                  {task.details.description && (
                    <div style={{ marginBottom: '10px', color: '#666' }}>
                      {task.details.description}
                    </div>
                  )}
                  {task.details.papers && task.details.papers.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Papers:</div>
                      {task.details.papers.map((paper: any, idx: number) => (
                        <div key={idx} style={{ fontSize: '14px', color: '#666' }}>
                          • {paper.title} {paper.pages && `(pages: ${paper.pages})`}
                        </div>
                      ))}
                    </div>
                  )}
                  {task.details.dod && task.details.dod.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Definition of Done:</div>
                      {task.details.dod.map((item: string, idx: number) => (
                        <div key={idx} style={{ fontSize: '14px', color: '#666' }}>
                          ✓ {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {task.status !== 'in_progress' && (
                  <button
                    onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                    style={{
                      padding: '5px 15px',
                      background: '#ff9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Start
                  </button>
                )}
                {task.status !== 'done' && (
                  <button
                    onClick={() => setSelectedTask(task)}
                    style={{
                      padding: '5px 15px',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Check In
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Check-in Modal */}
      {selectedTask && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedTask(null)}
        >
          <div
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Check In: {selectedTask.title}</h2>
            <form onSubmit={handleCheckin}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Time Spent (minutes)
                </label>
                <input
                  type="number"
                  value={checkinMinutes}
                  onChange={(e) => setCheckinMinutes(parseInt(e.target.value))}
                  min="1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status</label>
                <select
                  value={checkinStatus}
                  onChange={(e) => setCheckinStatus(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Notes</label>
                <textarea
                  value={checkinNote}
                  onChange={(e) => setCheckinNote(e.target.value)}
                  rows={4}
                  placeholder="What did you accomplish? Any blockers?"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Submit Check-in
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
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
        </div>
      )}
    </div>
  );
}
