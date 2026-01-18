"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Paywall from "../../components/Paywall";

interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  citations: number;
  abstract: string;
  tags: string[];
  downloadUrl: string;
  arxivId: string;
  doi: string;
  source: string;
  url: string;
}

export default function PapersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);

  const searchPapers = async () => {
    if (!searchQuery.trim()) {
      setError("请输入搜索关键词");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      const response = await fetch(
        `${apiUrl}/papers/search?query=${encodeURIComponent(searchQuery)}&source=${source}&max_results=20`
      );

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error("服务器错误，请稍后重试");
        } else if (response.status === 404) {
          throw new Error("搜索服务不可用");
        } else {
          throw new Error("搜索失败，请稍后重试");
        }
      }

      const data = await response.json();
      setPapers(data.papers || []);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError("无法连接到后端服务，请确保 API 服务正在运行 (http://localhost:8000)");
      } else {
        setError(err instanceof Error ? err.message : "搜索出错");
      }
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchPapers();
    }
  };

  return (
    <Paywall>
      <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "32px" }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "1rem",
              marginBottom: "20px",
              opacity: 0.9
            }}
          >
            <span>←</span> 返回首页
          </Link>

          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              background: "linear-gradient(135deg, #fff 0%, #f0f0f0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "12px"
            }}
          >
            论文库 📚
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#ffffff", opacity: 0.9 }}>
            搜索 arXiv 和 SCI 期刊论文
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}
        >
          {/* Source Selector */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "#2d3748"
            }}>
              数据源选择
            </label>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                { value: "all", label: "全部来源", icon: "🌐" },
                { value: "arxiv", label: "arXiv", icon: "📄" },
                { value: "crossref", label: "SCI 期刊", icon: "🔬" }
              ].map(({ value, label, icon }) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSource(value)}
                  style={{
                    padding: "10px 20px",
                    background: source === value
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "white",
                    color: source === value ? "white" : "#667eea",
                    border: source === value ? "none" : "2px solid #667eea",
                    borderRadius: "10px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: source === value ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "none"
                  }}
                >
                  {icon} {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              placeholder="🔍 输入关键词搜索论文（例如：deep learning, quantum computing）..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                flex: 1,
                padding: "14px 20px",
                fontSize: "1rem",
                border: "2px solid #e9ecef",
                borderRadius: "12px",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={searchPapers}
              disabled={loading}
              style={{
                padding: "14px 32px",
                background: loading
                  ? "#ccc"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 12px rgba(102, 126, 234, 0.3)"
              }}
            >
              {loading ? "搜索中..." : "搜索"}
            </motion.button>
          </div>

          {error && (
            <div style={{
              marginTop: "12px",
              padding: "12px",
              background: "rgba(239, 68, 68, 0.1)",
              color: "#dc2626",
              borderRadius: "8px",
              fontSize: "0.9rem"
            }}>
              ⚠️ {error}
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#ffffff",
              fontSize: "1.1rem"
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🔍</div>
            正在搜索论文...
          </motion.div>
        )}

        {/* Papers List */}
        {!loading && papers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div style={{
              marginBottom: "16px",
              color: "#ffffff",
              fontSize: "1rem",
              opacity: 0.9
            }}>
              找到 {papers.length} 篇相关论文
            </div>

            {papers.map((paper, index) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginBottom: "16px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  cursor: "pointer",
                  position: "relative" as const
                }}
              >
                {/* Source Badge */}
                <div style={{
                  position: "absolute" as const,
                  top: "16px",
                  right: "16px",
                  padding: "4px 12px",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  background: paper.source === "arxiv"
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(34, 197, 94, 0.1)",
                  color: paper.source === "arxiv" ? "#dc2626" : "#16a34a"
                }}>
                  {paper.source === "arxiv" ? "📄 arXiv" : "🔬 SCI"}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  color: "#2d3748",
                  marginBottom: "12px",
                  lineHeight: "1.4",
                  paddingRight: "100px"
                }}>
                  {paper.title}
                </h3>

                {/* Metadata */}
                <div style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                  fontSize: "0.9rem",
                  color: "#718096"
                }}>
                  <span>👤 {paper.authors}</span>
                  {paper.year > 0 && <span>📅 {paper.year}</span>}
                  <span>📍 {paper.venue}</span>
                  {paper.citations > 0 && (
                    <span>📊 {paper.citations.toLocaleString()} 次引用</span>
                  )}
                </div>

                {/* Abstract */}
                <p style={{
                  color: "#4a5568",
                  lineHeight: "1.6",
                  marginBottom: "16px",
                  fontSize: "0.95rem"
                }}>
                  {paper.abstract}
                </p>

                {/* Tags */}
                {paper.tags.length > 0 && (
                  <div style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "16px",
                    flexWrap: "wrap"
                  }}>
                    {paper.tags.slice(0, 5).map((tag, i) => (
                      <span key={i} style={{
                        padding: "4px 12px",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        background: "rgba(102, 126, 234, 0.1)",
                        color: "#667eea",
                        fontWeight: "500"
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: "10px 20px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                      }}
                    >
                      🔗 查看详情
                    </motion.button>
                  </a>
                  {paper.downloadUrl && (
                    <a
                      href={paper.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: "10px 20px",
                          background: "white",
                          color: "#667eea",
                          border: "2px solid #667eea",
                          borderRadius: "10px",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        📥 下载 PDF
                      </motion.button>
                    </a>
                  )}
                  {paper.doi && (
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: "10px 20px",
                          background: "white",
                          color: "#718096",
                          border: "2px solid #e9ecef",
                          borderRadius: "10px",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        🔍 DOI
                      </motion.button>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {!loading && hasSearched && papers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#ffffff",
              fontSize: "1.1rem"
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>😔</div>
            未找到匹配的论文，请尝试其他关键词
          </motion.div>
        )}

        {/* Welcome Message */}
        {!loading && !hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#ffffff"
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔍</div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "12px" }}>开始搜索学术论文</h2>
            <p style={{ fontSize: "1rem", opacity: 0.9 }}>
              支持 arXiv 和 SCI 期刊论文检索
            </p>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            marginTop: "32px",
            padding: "24px",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}
        >
          <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3748", marginBottom: "12px" }}>
            💡 使用技巧
          </h4>
          <ul style={{ color: "#4a5568", lineHeight: "1.8", margin: 0, paddingLeft: "20px" }}>
            <li><strong>arXiv</strong>: 涵盖物理、数学、计算机科学等领域的预印本论文</li>
            <li><strong>SCI 期刊</strong>: 通过 Crossref 搜索已发表的学术期刊论文</li>
            <li>选择"全部来源"可同时搜索 arXiv 和 SCI 期刊</li>
            <li>使用英文关键词搜索效果更佳（例如：quantum computing, neural networks）</li>
            <li>点击"查看详情"访问论文原始页面</li>
            <li>引用次数可以帮助评估论文的影响力和重要性</li>
          </ul>
        </motion.div>
      </div>
    </Paywall>
  );
}
