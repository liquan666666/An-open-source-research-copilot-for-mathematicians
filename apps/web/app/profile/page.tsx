'use client';

import { useState, useEffect } from 'react';
import { profileApi } from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    research_interests: '',
    msc_codes: '',
    keywords: '',
    theory_ratio: 0.6,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.get();
      if (data) {
        setProfile(data);
        setFormData({
          name: data.data.name || '',
          institution: data.data.institution || '',
          research_interests: data.data.research_interests || '',
          msc_codes: (data.data.msc_codes || []).join(', '),
          keywords: (data.data.keywords || []).join(', '),
          theory_ratio: data.data.theory_ratio || 0.6,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      const data = {
        name: formData.name,
        institution: formData.institution,
        research_interests: formData.research_interests,
        msc_codes: formData.msc_codes.split(',').map(s => s.trim()).filter(s => s),
        keywords: formData.keywords.split(',').map(s => s.trim()).filter(s => s),
        theory_ratio: formData.theory_ratio,
        preferences: {},
      };

      await profileApi.create(data);
      alert('Profile saved successfully!');
      loadProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your profile?')) return;
    try {
      await profileApi.delete();
      alert('Profile deleted');
      setProfile(null);
      setFormData({
        name: '',
        institution: '',
        research_interests: '',
        msc_codes: '',
        keywords: '',
        theory_ratio: 0.6,
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Home</Link>
      </div>

      <h1>Research Profile</h1>

      {error && (
        <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', marginBottom: '20px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Institution</label>
          <input
            type="text"
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Research Interests</label>
          <textarea
            value={formData.research_interests}
            onChange={(e) => setFormData({ ...formData, research_interests: e.target.value })}
            rows={3}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            MSC Codes (comma-separated, e.g., 57N25, 58D29)
          </label>
          <input
            type="text"
            value={formData.msc_codes}
            onChange={(e) => setFormData({ ...formData, msc_codes: e.target.value })}
            placeholder="57N25, 58D29"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Keywords (comma-separated)
          </label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="topology, manifolds, differential geometry"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Theory/Computation Ratio: {formData.theory_ratio.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={formData.theory_ratio}
            onChange={(e) => setFormData({ ...formData, theory_ratio: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
            <span>All Computation</span>
            <span>Balanced</span>
            <span>All Theory</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '10px 20px',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>

          {profile && (
            <button
              type="button"
              onClick={handleDelete}
              style={{
                padding: '10px 20px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Delete Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
