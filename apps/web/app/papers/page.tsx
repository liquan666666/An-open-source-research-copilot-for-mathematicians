"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Paper {
  id: number;
  title: string;
  authors: string;
  year: number;
  venue: string;
  citations: number;
  abstract: string;
  tags: string[];
  downloadUrl: string;
  arxivId?: string;
}

export default function PapersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [currentPaper, setCurrentPaper] = useState<Paper | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isSearchingArxiv, setIsSearchingArxiv] = useState(false);
  const [arxivResults, setArxivResults] = useState<Paper[]>([]);
  const [showArxivSearch, setShowArxivSearch] = useState(false);

  // 从localStorage加载收藏状态
  useEffect(() => {
    const savedFavorites = localStorage.getItem('paperFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // 扩展的论文数据库（数学相关论文）
  const papers: Paper[] = [
    // 拓扑学相关
    {
      id: 1,
      title: "The Poincaré Conjecture and Ricci Flow",
      authors: "Grisha Perelman",
      year: 2003,
      venue: "arXiv",
      citations: 5234,
      abstract: "We present a proof of the Poincaré conjecture using Ricci flow with surgery on three-manifolds...",
      tags: ["Topology", "Differential Geometry", "Poincaré Conjecture"],
      downloadUrl: "#",
      arxivId: "math/0303109"
    },
    {
      id: 2,
      title: "Persistent Homology: Theory and Practice",
      authors: "Herbert Edelsbrunner, John Harer",
      year: 2010,
      venue: "European Congress of Mathematics",
      citations: 3421,
      abstract: "An introduction to persistent homology methods for topological data analysis and their applications...",
      tags: ["Algebraic Topology", "Persistent Homology", "TDA"],
      downloadUrl: "#"
    },
    // 代数几何
    {
      id: 3,
      title: "Fermat's Last Theorem",
      authors: "Andrew Wiles",
      year: 1995,
      venue: "Annals of Mathematics",
      citations: 8932,
      abstract: "This paper presents a proof of Fermat's Last Theorem using modular forms and elliptic curves...",
      tags: ["Number Theory", "Elliptic Curves", "Fermat"],
      downloadUrl: "#"
    },
    {
      id: 4,
      title: "Introduction to Algebraic Geometry",
      authors: "Igor Shafarevich",
      year: 1994,
      venue: "Springer",
      citations: 4523,
      abstract: "A comprehensive introduction to the basic concepts and methods of modern algebraic geometry...",
      tags: ["Algebraic Geometry", "Varieties", "Schemes"],
      downloadUrl: "#"
    },
    // 微分几何
    {
      id: 5,
      title: "Differential Geometry of Curves and Surfaces",
      authors: "Manfredo P. do Carmo",
      year: 1976,
      venue: "Prentice-Hall",
      citations: 6782,
      abstract: "A classical textbook on the differential geometry of curves and surfaces in Euclidean space...",
      tags: ["Differential Geometry", "Curves", "Surfaces"],
      downloadUrl: "#"
    },
    {
      id: 6,
      title: "Riemannian Geometry",
      authors: "Peter Petersen",
      year: 2016,
      venue: "Springer GTM",
      citations: 2341,
      abstract: "Introduction to Riemannian manifolds, curvature, and geometric analysis techniques...",
      tags: ["Riemannian Geometry", "Curvature", "Manifolds"],
      downloadUrl: "#"
    },
    // 泛函分析
    {
      id: 7,
      title: "Functional Analysis",
      authors: "Walter Rudin",
      year: 1991,
      venue: "McGraw-Hill",
      citations: 12453,
      abstract: "A comprehensive introduction to functional analysis covering Banach and Hilbert spaces...",
      tags: ["Functional Analysis", "Banach Spaces", "Hilbert Spaces"],
      downloadUrl: "#"
    },
    {
      id: 8,
      title: "Banach-Tarski Paradox",
      authors: "Stan Wagon",
      year: 1985,
      venue: "Cambridge University Press",
      citations: 1876,
      abstract: "An exploration of the paradoxical decomposition of a sphere using the axiom of choice...",
      tags: ["Set Theory", "Measure Theory", "Paradox"],
      downloadUrl: "#"
    },
    // 偏微分方程
    {
      id: 9,
      title: "Partial Differential Equations",
      authors: "Lawrence C. Evans",
      year: 2010,
      venue: "AMS Graduate Studies",
      citations: 15234,
      abstract: "A graduate-level introduction to the modern theory of partial differential equations...",
      tags: ["PDE", "Analysis", "Mathematical Physics"],
      downloadUrl: "#"
    },
    {
      id: 10,
      title: "The Navier-Stokes Equations",
      authors: "Constantin Foias, Roger Temam",
      year: 2001,
      venue: "Springer",
      citations: 4567,
      abstract: "Mathematical analysis of the Navier-Stokes equations for fluid dynamics...",
      tags: ["PDE", "Fluid Dynamics", "Navier-Stokes"],
      downloadUrl: "#"
    },
    // 数论
    {
      id: 11,
      title: "An Introduction to the Theory of Numbers",
      authors: "G. H. Hardy, E. M. Wright",
      year: 2008,
      venue: "Oxford University Press",
      citations: 9876,
      abstract: "A classic introduction to elementary and analytic number theory...",
      tags: ["Number Theory", "Prime Numbers", "Diophantine Equations"],
      downloadUrl: "#"
    },
    {
      id: 12,
      title: "The Riemann Hypothesis",
      authors: "Peter Sarnak",
      year: 2005,
      venue: "Clay Mathematics Institute",
      citations: 3421,
      abstract: "Survey of the Riemann Hypothesis and its implications for prime number distribution...",
      tags: ["Number Theory", "Riemann Hypothesis", "Zeta Function"],
      downloadUrl: "#"
    },
    // 组合数学
    {
      id: 13,
      title: "The Probabilistic Method",
      authors: "Noga Alon, Joel H. Spencer",
      year: 2016,
      venue: "Wiley",
      citations: 5632,
      abstract: "Introduction to probabilistic methods in combinatorics with numerous applications...",
      tags: ["Combinatorics", "Probabilistic Method", "Graph Theory"],
      downloadUrl: "#"
    },
    {
      id: 14,
      title: "Enumerative Combinatorics",
      authors: "Richard P. Stanley",
      year: 2011,
      venue: "Cambridge University Press",
      citations: 4234,
      abstract: "Comprehensive treatment of counting techniques and generating functions...",
      tags: ["Combinatorics", "Enumeration", "Generating Functions"],
      downloadUrl: "#"
    },
    // 图论
    {
      id: 15,
      title: "Graph Theory",
      authors: "Reinhard Diestel",
      year: 2017,
      venue: "Springer GTM",
      citations: 7654,
      abstract: "A modern introduction to graph theory covering classical and contemporary topics...",
      tags: ["Graph Theory", "Networks", "Algorithms"],
      downloadUrl: "#"
    },
    // 优化理论
    {
      id: 16,
      title: "Convex Optimization",
      authors: "Stephen Boyd, Lieven Vandenberghe",
      year: 2004,
      venue: "Cambridge University Press",
      citations: 45678,
      abstract: "Comprehensive introduction to convex optimization theory and algorithms...",
      tags: ["Optimization", "Convex Analysis", "Algorithms"],
      downloadUrl: "#"
    },
    {
      id: 17,
      title: "Nonlinear Programming",
      authors: "Dimitri P. Bertsekas",
      year: 2016,
      venue: "Athena Scientific",
      citations: 8765,
      abstract: "Theory and algorithms for constrained optimization problems...",
      tags: ["Optimization", "Nonlinear Programming", "Algorithms"],
      downloadUrl: "#"
    },
    // 概率论与统计
    {
      id: 18,
      title: "Probability Theory: The Logic of Science",
      authors: "E. T. Jaynes",
      year: 2003,
      venue: "Cambridge University Press",
      citations: 6543,
      abstract: "A Bayesian approach to probability theory and its philosophical foundations...",
      tags: ["Probability", "Bayesian Statistics", "Information Theory"],
      downloadUrl: "#"
    },
    {
      id: 19,
      title: "Measure Theory",
      authors: "Paul R. Halmos",
      year: 1974,
      venue: "Springer",
      citations: 11234,
      abstract: "Classic introduction to measure theory and integration...",
      tags: ["Measure Theory", "Integration", "Real Analysis"],
      downloadUrl: "#"
    },
    // 机器学习中的数学
    {
      id: 20,
      title: "Mathematics for Machine Learning",
      authors: "Marc Peter Deisenroth, A. Aldo Faisal, Cheng Soon Ong",
      year: 2020,
      venue: "Cambridge University Press",
      citations: 3456,
      abstract: "Mathematical foundations of machine learning including linear algebra, probability, and optimization...",
      tags: ["Machine Learning", "Applied Mathematics", "Linear Algebra"],
      downloadUrl: "#"
    }
  ];

  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 合并本地论文和arXiv搜索结果
  const allPapers = showArxivSearch ? [...filteredPapers, ...arxivResults] : filteredPapers;

  // arXiv搜索功能
  const searchArxiv = async () => {
    if (!searchQuery.trim()) return;

    setIsSearchingArxiv(true);
    try {
      // 使用arXiv API搜索
      const response = await fetch(
        `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(searchQuery)}&start=0&max_results=10&sortBy=relevance&sortOrder=descending`
      );

      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");

      const entries = xmlDoc.getElementsByTagName("entry");
      const results: Paper[] = [];

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        // 提取arXiv ID
        const idElement = entry.getElementsByTagName("id")[0];
        const arxivUrl = idElement?.textContent || "";
        const arxivId = arxivUrl.split("/abs/")[1] || "";

        // 提取标题
        const titleElement = entry.getElementsByTagName("title")[0];
        const title = titleElement?.textContent?.replace(/\s+/g, " ").trim() || "";

        // 提取作者
        const authorElements = entry.getElementsByTagName("author");
        const authors = Array.from(authorElements)
          .map(author => author.getElementsByTagName("name")[0]?.textContent || "")
          .join(", ");

        // 提取摘要
        const summaryElement = entry.getElementsByTagName("summary")[0];
        const abstract = summaryElement?.textContent?.replace(/\s+/g, " ").trim().substring(0, 200) + "..." || "";

        // 提取发表日期
        const publishedElement = entry.getElementsByTagName("published")[0];
        const publishedDate = publishedElement?.textContent || "";
        const year = new Date(publishedDate).getFullYear();

        // 提取分类作为标签
        const categoryElements = entry.getElementsByTagName("category");
        const tags = Array.from(categoryElements)
          .slice(0, 3)
          .map(cat => cat.getAttribute("term") || "")
          .filter(Boolean);

        results.push({
          id: 1000 + i,
          title,
          authors,
          year,
          venue: "arXiv",
          citations: 0,
          abstract,
          tags,
          downloadUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
          arxivId
        });
      }

      setArxivResults(results);
      setShowArxivSearch(true);
    } catch (error) {
      console.error("arXiv搜索失败:", error);
      alert("搜索失败，请检查网络连接或稍后重试");
    } finally {
      setIsSearchingArxiv(false);
    }
  };

  const toggleFavorite = (paperId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(paperId)) {
        newFavorites.delete(paperId);
      } else {
        newFavorites.add(paperId);
      }
      // 持久化到localStorage
      localStorage.setItem('paperFavorites', JSON.stringify(Array.from(newFavorites)));
      return newFavorites;
    });
  };

  const handleDownload = async (paper: Paper) => {
    const pdfUrl = paper.downloadUrl;

    // 如果是arXiv论文，通过代理下载PDF
    if (paper.arxivId && pdfUrl && pdfUrl !== "#") {
      try {
        // 显示下载提示
        const downloadingToast = document.createElement('div');
        downloadingToast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 10000;
          font-weight: 600;
        `;
        downloadingToast.textContent = '🔄 正在下载PDF...';
        document.body.appendChild(downloadingToast);

        // 使用fetch下载PDF
        const response = await fetch(pdfUrl, {
          mode: 'cors',
        });

        if (!response.ok) throw new Error('下载失败');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${paper.title.substring(0, 50).replace(/[^a-zA-Z0-9\s]/g, '_')}_${paper.arxivId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // 更新提示
        downloadingToast.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
        downloadingToast.textContent = '✅ PDF下载成功！';
        setTimeout(() => {
          document.body.removeChild(downloadingToast);
        }, 2000);
      } catch (error) {
        console.error('PDF下载失败:', error);
        // 如果CORS下载失败，回退到新标签页打开
        const fallbackToast = document.createElement('div');
        fallbackToast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 10000;
          font-weight: 600;
        `;
        fallbackToast.textContent = '⚠️ 直接下载失败，正在新窗口打开...';
        document.body.appendChild(fallbackToast);

        window.open(pdfUrl, '_blank');

        setTimeout(() => {
          document.body.removeChild(fallbackToast);
        }, 3000);
      }
      return;
    }

    // 如果有真实URL，直接下载
    if (pdfUrl && pdfUrl !== "#") {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${paper.title}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // 演示：创建一个带有论文信息的文本文件
      const content = `论文标题: ${paper.title}\n作者: ${paper.authors}\n年份: ${paper.year}\n会议/期刊: ${paper.venue}\n引用次数: ${paper.citations}\n\n摘要:\n${paper.abstract}\n\n标签: ${paper.tags.join(', ')}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${paper.title.substring(0, 50)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const handleNote = (paper: typeof papers[0]) => {
    setCurrentPaper(paper);
    // 加载已有笔记
    const savedNotes = localStorage.getItem(`paper_note_${paper.id}`);
    setNoteContent(savedNotes || '');
    setNoteModalOpen(true);
  };

  const saveNote = () => {
    if (currentPaper) {
      localStorage.setItem(`paper_note_${currentPaper.id}`, noteContent);
      setNoteModalOpen(false);
      alert('笔记已保存！');
    }
  };

  return (
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
          检索、阅读和管理您的研究文献
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
        <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
          <input
            type="text"
            placeholder="🔍 搜索论文标题、作者或关键词..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowArxivSearch(false);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                searchArxiv();
              }
            }}
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
            onClick={searchArxiv}
            disabled={isSearchingArxiv || !searchQuery.trim()}
            style={{
              padding: "14px 28px",
              background: isSearchingArxiv || !searchQuery.trim()
                ? "#cbd5e0"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: isSearchingArxiv || !searchQuery.trim() ? "not-allowed" : "pointer",
              boxShadow: isSearchingArxiv || !searchQuery.trim()
                ? "none"
                : "0 4px 12px rgba(102, 126, 234, 0.3)",
              whiteSpace: "nowrap"
            }}
          >
            {isSearchingArxiv ? "🔄 搜索中..." : "🌐 arXiv搜索"}
          </motion.button>
        </div>

        {showArxivSearch && arxivResults.length > 0 && (
          <div style={{
            padding: "12px 16px",
            background: "#f0f9ff",
            borderRadius: "10px",
            fontSize: "0.9rem",
            color: "#0369a1",
            fontWeight: "500",
            border: "1px solid #bae6fd"
          }}>
            ✨ 找到 {arxivResults.length} 篇 arXiv 论文（支持直接下载PDF）
          </div>
        )}

        {showArxivSearch && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowArxivSearch(false);
              setArxivResults([]);
            }}
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              background: "white",
              color: "#718096",
              border: "2px solid #e9ecef",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            ✕ 清除 arXiv 搜索结果
          </motion.button>
        )}
      </motion.div>

      {/* Papers List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {allPapers.map((paper, index) => (
          <motion.div
            key={paper.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "16px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              cursor: "pointer"
            }}
          >
            {/* Title */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
              <h3 style={{
                flex: 1,
                fontSize: "1.3rem",
                fontWeight: "700",
                color: "#2d3748",
                lineHeight: "1.4",
                margin: 0
              }}>
                {paper.title}
              </h3>
              {paper.arxivId && (
                <span style={{
                  padding: "4px 12px",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                  whiteSpace: "nowrap"
                }}>
                  arXiv
                </span>
              )}
            </div>

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
              <span>📅 {paper.year}</span>
              <span>📍 {paper.venue}</span>
              <span>📊 {paper.citations.toLocaleString()} 次引用</span>
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
            <div style={{
              display: "flex",
              gap: "8px",
              marginBottom: "16px",
              flexWrap: "wrap"
            }}>
              {paper.tags.map((tag, i) => (
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

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDownload(paper)}
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
                📥 下载 PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFavorite(paper.id)}
                style={{
                  padding: "10px 20px",
                  background: favorites.has(paper.id) ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" : "white",
                  color: favorites.has(paper.id) ? "white" : "#667eea",
                  border: favorites.has(paper.id) ? "none" : "2px solid #667eea",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                {favorites.has(paper.id) ? "⭐ 已收藏" : "⭐ 收藏"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNote(paper)}
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
                📝 笔记
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {allPapers.length === 0 && (
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
          🔍 未找到匹配的论文，请尝试其他关键词
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
          <li>本地数据库包含20篇经典数学论文，覆盖拓扑学、代数几何、泛函分析等领域</li>
          <li>点击"🌐 arXiv搜索"按钮可搜索arXiv.org上的任意论文（支持直接下载PDF）</li>
          <li>arXiv论文带有特殊标记，点击下载会在新标签页打开PDF</li>
          <li>点击"收藏"按钮将重要文献加入个人文库，收藏状态会自动保存</li>
          <li>在"笔记"中记录阅读心得和重要观点，笔记会保存在浏览器本地</li>
          <li>使用搜索框可以同时搜索标题、作者和标签</li>
        </ul>
      </motion.div>

      {/* Note Modal */}
      {noteModalOpen && currentPaper && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
          onClick={() => setNoteModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#2d3748",
              marginBottom: "8px"
            }}>
              📝 论文笔记
            </h3>
            <p style={{
              fontSize: "1.1rem",
              color: "#667eea",
              marginBottom: "24px",
              fontWeight: "600"
            }}>
              {currentPaper.title}
            </p>

            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="在这里记录你的笔记、想法和重要观点..."
              style={{
                width: "100%",
                minHeight: "300px",
                padding: "16px",
                fontSize: "1rem",
                border: "2px solid #e9ecef",
                borderRadius: "12px",
                outline: "none",
                fontFamily: "inherit",
                lineHeight: "1.6",
                resize: "vertical"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
            />

            <div style={{
              display: "flex",
              gap: "12px",
              marginTop: "24px",
              justifyContent: "flex-end"
            }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setNoteModalOpen(false)}
                style={{
                  padding: "12px 24px",
                  background: "white",
                  color: "#718096",
                  border: "2px solid #e9ecef",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                取消
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveNote}
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                }}
              >
                💾 保存笔记
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
