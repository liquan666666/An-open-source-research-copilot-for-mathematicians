import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>MathResearchPilot</h1>

      <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
        An open-source research execution system for mathematicians. Turn vague research ideas into executable, supervised, and explainable daily research tasks.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginTop: 32,
        }}
      >
        <Card
          title="Research Profile"
          desc="Set your MSC codes, keywords, and research preferences"
          link="/profile"
        />
        <Card
          title="Paper Library"
          desc="Search arXiv, add papers, and mark focus papers for reading"
          link="/papers"
        />
        <Card
          title="Tasks"
          desc="Generate and manage daily research tasks with check-ins"
          link="/tasks"
        />
      </div>

      <div style={{ marginTop: 32, padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Getting Started</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Set up your <Link href="/profile" style={{ color: '#0070f3' }}>Research Profile</Link> with MSC codes and keywords</li>
          <li>Search and add papers to your <Link href="/papers" style={{ color: '#0070f3' }}>Paper Library</Link></li>
          <li>Mark focus papers and specify reading pages</li>
          <li>Go to <Link href="/tasks" style={{ color: '#0070f3' }}>Tasks</Link> to generate today's research tasks</li>
          <li>Work on tasks and check in your progress</li>
        </ol>
      </div>

      <div style={{ marginTop: 32, fontSize: '14px', color: '#666', textAlign: 'center' }}>
        <p>API Documentation: <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>http://localhost:8000/docs</a></p>
      </div>
    </div>
  );
}

function Card({ title, desc, link }: { title: string; desc: string; link: string }) {
  return (
    <Link href={link} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          border: "2px solid #eee",
          borderRadius: 12,
          padding: 20,
          cursor: 'pointer',
          transition: 'all 0.2s',
          height: '100%',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#0070f3';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#eee';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>{title}</div>
        <div style={{ opacity: 0.7, lineHeight: '1.5' }}>{desc}</div>
      </div>
    </Link>
  );
}


