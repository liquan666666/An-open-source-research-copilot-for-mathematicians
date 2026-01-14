"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

interface Topic {
  title: string;
  difficulty: string;
  keywords: string[];
  description: string;
  score?: number;
}

export default function TopicsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/profile`)
      .then((r) => r.json())
      .then((data) => setProfile(data));
  }, []);

  const getRecommendations = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/topics/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    setTopics(data);
    setLoading(false);
  };

  const selectTopic = (topic: Topic) => {
    router.push(`/roadmap?topic=${encodeURIComponent(topic.title)}`);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1>课题推荐</h1>
      <Link href="/" style={{ color: "#0070f3", marginBottom: 20, display: "inline-block" }}>
        ← 返回首页
      </Link>

      {!profile?.research_area ? (
        <div style={{ padding: 20, backgroundColor: "#fff3cd", borderRadius: 8, marginTop: 20 }}>
          请先到<Link href="/profile" style={{ color: "#0070f3", fontWeight: 600 }}>用户资料</Link>页面设置研究领域和兴趣。
        </div>
      ) : (
        <>
          <div style={{ marginTop: 20, padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8 }}>
            <div><strong>研究领域：</strong>{profile.research_area}</div>
            <div style={{ marginTop: 8 }}>
              <strong>兴趣标签：</strong>
              {profile.interests?.length > 0 ? profile.interests.join(", ") : "未设置"}
            </div>
          </div>

          <button
            onClick={getRecommendations}
            disabled={loading}
            style={{
              marginTop: 20,
              padding: "12px 24px",
              borderRadius: 4,
              border: "none",
              backgroundColor: "#0070f3",
              color: "white",
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "获取推荐中..." : "获取课题推荐"}
          </button>

          {topics.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <h2>推荐课题</h2>
              {topics.map((topic, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 20,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <h3 style={{ margin: 0 }}>{topic.title}</h3>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: 12,
                        backgroundColor: topic.difficulty === "高" ? "#ffe0e0" : "#e0f0ff",
                        fontSize: 14,
                      }}
                    >
                      难度：{topic.difficulty}
                    </span>
                  </div>
                  <p style={{ marginTop: 12, opacity: 0.8 }}>{topic.description}</p>
                  <div style={{ marginTop: 12 }}>
                    <strong>关键词：</strong>
                    {topic.keywords.map((kw) => (
                      <span
                        key={kw}
                        style={{
                          marginLeft: 8,
                          padding: "2px 8px",
                          borderRadius: 8,
                          backgroundColor: "#f0f0f0",
                          fontSize: 14,
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => selectTopic(topic)}
                    style={{
                      marginTop: 16,
                      padding: "8px 16px",
                      borderRadius: 4,
                      border: "1px solid #0070f3",
                      backgroundColor: "white",
                      color: "#0070f3",
                      cursor: "pointer",
                    }}
                  >
                    选择此课题并生成路线图
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
