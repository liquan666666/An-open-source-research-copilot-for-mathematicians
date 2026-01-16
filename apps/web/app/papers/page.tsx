"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function PapersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const papers = [
    {
      id: 1,
      title: "Deep Residual Learning for Image Recognition",
      authors: "Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun",
      year: 2016,
      venue: "CVPR",
      citations: 89234,
      abstract: "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks...",
      tags: ["Deep Learning", "Computer Vision", "ResNet"],
      downloadUrl: "https://arxiv.org/pdf/1512.03385.pdf",
      arxivId: "1512.03385",
      doi: "10.1109/CVPR.2016.90"
    },
    {
      id: 2,
      title: "Attention Is All You Need",
      authors: "Ashish Vaswani, et al.",
      year: 2017,
      venue: "NeurIPS",
      citations: 76543,
      abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...",
      tags: ["Transformer", "NLP", "Attention Mechanism"],
      downloadUrl: "https://arxiv.org/pdf/1706.03762.pdf",
      arxivId: "1706.03762",
      doi: "10.48550/arXiv.1706.03762"
    },
    {
      id: 3,
      title: "BERT: Pre-training of Deep Bidirectional Transformers",
      authors: "Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova",
      year: 2019,
      venue: "NAACL",
      citations: 65432,
      abstract: "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations...",
      tags: ["BERT", "Pre-training", "NLP"],
      downloadUrl: "https://arxiv.org/pdf/1810.04805.pdf",
      arxivId: "1810.04805",
      doi: "10.18653/v1/N19-1423"
    }
  ];

  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        <input
          type="text"
          placeholder="🔍 搜索论文标题、作者或关键词..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
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
      </motion.div>

      {/* Papers List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {filteredPapers.map((paper, index) => (
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
            <h3 style={{
              fontSize: "1.3rem",
              fontWeight: "700",
              color: "#2d3748",
              marginBottom: "12px",
              lineHeight: "1.4"
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
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
              </a>
              {paper.arxivId && (
                <a
                  href={`https://arxiv.org/abs/${paper.arxivId}`}
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
                    📄 arXiv
                  </motion.button>
                </a>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert('收藏功能开发中，敬请期待！')}
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
                ⭐ 收藏
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert('笔记功能开发中，敬请期待！')}
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

      {filteredPapers.length === 0 && (
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
          <li>点击"下载 PDF"按钮直接在新标签页打开论文PDF文件</li>
          <li>点击"arXiv"按钮查看论文的详细信息和其他版本</li>
          <li>使用搜索框快速查找相关论文标题、作者或关键词</li>
          <li>引用次数可以帮助评估论文的影响力和重要性</li>
          <li>收藏和笔记功能即将上线，敬请期待</li>
        </ul>
      </motion.div>
    </div>
  );
}
