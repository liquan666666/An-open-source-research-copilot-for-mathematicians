"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

interface Paper {
  id?: number;
  ext_id: string;
  title: string;
  authors: string;
  year: number;
  arxiv_url: string;
  pdf_url: string;
  focus?: boolean;
}

export default function PapersPage() {
  const [myPapers, setMyPapers] = useState<Paper[]>([]);
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"library" | "search">("library");

  useEffect(() => {
    loadMyPapers();
  }, []);

  const loadMyPapers = async () => {
    const res = await fetch(`${API_BASE}/papers`);
    const data = await res.json();
    setMyPapers(data);
  };

  const searchArxiv = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE}/papers/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
      if (data.length === 0) {
        alert("没有找到相关论文，请尝试其他关键词");
      }
    } catch (error) {
      console.error("搜索出错:", error);
      alert("搜索失败，请检查网络连接或稍后重试");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const savePaper = async (paper: Paper) => {
    await fetch(`${API_BASE}/papers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paper),
    });
    loadMyPapers();
    alert("论文已保存");
  };

  const deletePaper = async (id: number) => {
    await fetch(`${API_BASE}/papers/${id}`, { method: "DELETE" });
    loadMyPapers();
  };

  const toggleFocus = async (id: number, focus: boolean) => {
    await fetch(`${API_BASE}/papers/${id}/focus?focus=${!focus}`, { method: "PATCH" });
    loadMyPapers();
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h1>论文库</h1>
      <Link href="/" style={{ color: "#0070f3", marginBottom: 20, display: "inline-block" }}>
        ← 返回首页
      </Link>

      <div style={{ display: "flex", gap: 8, marginTop: 20, borderBottom: "2px solid #eee" }}>
        <button
          onClick={() => setActiveTab("library")}
          style={{
            padding: "8px 16px",
            border: "none",
            backgroundColor: "transparent",
            borderBottom: activeTab === "library" ? "2px solid #0070f3" : "none",
            marginBottom: -2,
            cursor: "pointer",
            fontWeight: activeTab === "library" ? 600 : 400,
          }}
        >
          我的论文库 ({myPapers.length})
        </button>
        <button
          onClick={() => setActiveTab("search")}
          style={{
            padding: "8px 16px",
            border: "none",
            backgroundColor: "transparent",
            borderBottom: activeTab === "search" ? "2px solid #0070f3" : "none",
            marginBottom: -2,
            cursor: "pointer",
            fontWeight: activeTab === "search" ? 600 : 400,
          }}
        >
          搜索 arXiv
        </button>
      </div>

      {activeTab === "library" && (
        <div style={{ marginTop: 20 }}>
          {myPapers.length === 0 ? (
            <p style={{ opacity: 0.6 }}>还没有保存任何论文，去"搜索 arXiv"添加吧！</p>
          ) : (
            myPapers.map((paper) => (
              <div
                key={paper.id}
                style={{
                  padding: 16,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  marginBottom: 12,
                  backgroundColor: paper.focus ? "#fffef0" : "white",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <h3 style={{ margin: 0, flex: 1 }}>{paper.title}</h3>
                  <button
                    onClick={() => toggleFocus(paper.id!, paper.focus!)}
                    style={{
                      marginLeft: 8,
                      padding: "4px 12px",
                      borderRadius: 4,
                      border: "1px solid #ddd",
                      backgroundColor: paper.focus ? "#ffd700" : "white",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    {paper.focus ? "★ 重点" : "☆ 标记重点"}
                  </button>
                </div>
                <div style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
                  {paper.authors} ({paper.year})
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
                  <a href={paper.arxiv_url} target="_blank" style={{ color: "#0070f3" }}>
                    arXiv 页面
                  </a>
                  <a href={paper.pdf_url} target="_blank" style={{ color: "#0070f3" }}>
                    下载 PDF
                  </a>
                  <button
                    onClick={() => deletePaper(paper.id!)}
                    style={{
                      marginLeft: "auto",
                      padding: "4px 12px",
                      borderRadius: 4,
                      border: "1px solid #ddd",
                      backgroundColor: "white",
                      cursor: "pointer",
                      color: "#d00",
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "search" && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchArxiv()}
              placeholder="输入关键词搜索 arXiv 论文（支持中英文）..."
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 4,
                border: "1px solid #ddd",
                fontSize: 16,
              }}
            />
            <button
              onClick={searchArxiv}
              disabled={searching}
              style={{
                padding: "12px 24px",
                borderRadius: 4,
                border: "none",
                backgroundColor: "#0070f3",
                color: "white",
                cursor: searching ? "not-allowed" : "pointer",
                opacity: searching ? 0.6 : 1,
              }}
            >
              {searching ? "搜索中..." : "搜索"}
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
            💡 提示：支持中文搜索（如"代数几何"、"偏微分方程"等），系统会自动翻译为英文搜索 arXiv
          </div>

          {searchResults.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3>搜索结果</h3>
              {searchResults.map((paper, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 16,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                >
                  <h4 style={{ margin: 0 }}>{paper.title}</h4>
                  <div style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
                    {paper.authors} ({paper.year})
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
                    <a href={paper.arxiv_url} target="_blank" style={{ color: "#0070f3" }}>
                      arXiv
                    </a>
                    <a href={paper.pdf_url} target="_blank" style={{ color: "#0070f3" }}>
                      PDF
                    </a>
                    <button
                      onClick={() => savePaper(paper)}
                      style={{
                        marginLeft: "auto",
                        padding: "4px 12px",
                        borderRadius: 4,
                        border: "1px solid #0070f3",
                        backgroundColor: "white",
                        color: "#0070f3",
                        cursor: "pointer",
                      }}
                    >
                      保存到我的论文库
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
