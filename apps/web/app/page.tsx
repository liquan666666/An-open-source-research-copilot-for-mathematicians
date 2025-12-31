export default function Home() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>MathResearchPilot Web UI</h1>

      <p>
        这是一个面向数学研究者的开源研究执行系统：推荐课题、检索论文、生成可执行路线，并监督每日完成情况。
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        <Card title="课题推荐" desc="根据研究方向/偏好推荐可做课题" />
        <Card title="论文库" desc="检索论文并提供下载链接" />
        <Card title="路线图" desc="生成可执行研究路线（周/日粒度）" />
        <Card title="今日任务" desc="为今天分配任务并追踪" />
        <Card title="打卡监督" desc="每日提交完成情况与障碍" />
      </div>

      <p style={{ marginTop: 18, opacity: 0.8 }}>
        提示：先去“课题推荐”，确定一个课题，再去“路线图 / 今日任务”生成执行计划。
      </p>
    </div>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 6, opacity: 0.85 }}>{desc}</div>
    </div>
  );
}


