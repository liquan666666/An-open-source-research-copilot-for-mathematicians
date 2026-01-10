'use client';

import { useState, useEffect } from 'react';
import { papersApi } from '@/lib/api';
import Link from 'next/link';

export default function PapersPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [showFocusOnly, setShowFocusOnly] = useState(false);

  useEffect(() => {
    loadPapers();
  }, [showFocusOnly]);

  const loadPapers = async () => {
    try {
      setLoading(true);
      const data = await papersApi.list(showFocusOnly);
      setPapers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setError('');
      const results = await papersApi.search(searchQuery, 10, category || undefined);
      setSearchResults(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleAddPaper = async (extId: string) => {
    try {
      await papersApi.add(extId);
      alert('Paper added to library!');
      loadPapers();
      setSearchResults([]);
      setSearchQuery('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleFocus = async (paper: any) => {
    try {
      await papersApi.update(paper.id, { focus: !paper.focus });
      loadPapers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdatePages = async (paper: any) => {
    const pages = prompt('Enter reading pages (e.g., "1-20" or "1-20,30-40"):', paper.focus_pages);
    if (pages === null) return;

    try {
      await papersApi.update(paper.id, { focus_pages: pages });
      loadPapers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this paper from your library?')) return;
    try {
      await papersApi.delete(id);
      loadPapers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Home</Link>
      </div>

      <h1>Paper Library</h1>

      {error && (
        <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', marginBottom: '20px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Search Section */}
      <div style={{ marginBottom: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Search arXiv</h2>
        <form onSubmit={handleSearch}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search query (e.g., 'algebraic topology')"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (optional, e.g., math.GT)"
              style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <button
              type="submit"
              disabled={searching}
              style={{
                padding: '8px 20px',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: searching ? 'not-allowed' : 'pointer',
              }}
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {searchResults.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>Search Results</h3>
            {searchResults.map((paper, idx) => (
              <div key={idx} style={{ padding: '10px', background: 'white', marginBottom: '10px', borderRadius: '4px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{paper.title}</div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  {paper.authors} ({paper.year})
                </div>
                <div style={{ fontSize: '14px', marginBottom: '5px' }}>arXiv: {paper.ext_id}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a href={paper.arxiv_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#0070f3' }}>
                    View on arXiv
                  </a>
                  <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#0070f3' }}>
                    PDF
                  </a>
                  <button
                    onClick={() => handleAddPaper(paper.ext_id)}
                    style={{ fontSize: '14px', color: '#0070f3', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Add to Library
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Library Section */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Your Library ({papers.length})</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="checkbox"
            checked={showFocusOnly}
            onChange={(e) => setShowFocusOnly(e.target.checked)}
          />
          Show focus papers only
        </label>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : papers.length === 0 ? (
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
          No papers in your library. Search arXiv above to add papers.
        </div>
      ) : (
        <div>
          {papers.map((paper) => (
            <div
              key={paper.id}
              style={{
                padding: '15px',
                background: paper.focus ? '#e3f2fd' : 'white',
                border: '1px solid #ddd',
                marginBottom: '10px',
                borderRadius: '4px',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {paper.focus && <span style={{ color: '#0070f3', marginRight: '5px' }}>⭐</span>}
                {paper.title}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                {paper.authors} ({paper.year})
              </div>
              <div style={{ fontSize: '14px', marginBottom: '5px' }}>arXiv: {paper.ext_id}</div>
              {paper.focus_pages && (
                <div style={{ fontSize: '14px', marginBottom: '5px', color: '#0070f3' }}>
                  Reading pages: {paper.focus_pages}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <a href={paper.arxiv_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#0070f3' }}>
                  arXiv
                </a>
                <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#0070f3' }}>
                  PDF
                </a>
                <button
                  onClick={() => handleToggleFocus(paper)}
                  style={{ fontSize: '14px', color: '#0070f3', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {paper.focus ? 'Unfocus' : 'Set as Focus'}
                </button>
                {paper.focus && (
                  <button
                    onClick={() => handleUpdatePages(paper)}
                    style={{ fontSize: '14px', color: '#0070f3', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Set Pages
                  </button>
                )}
                <button
                  onClick={() => handleDelete(paper.id)}
                  style={{ fontSize: '14px', color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
