"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

interface KnowledgePoint {
  id: number;
  title: string;
  content: string;
  category: "definition" | "theorem" | "method" | "application" | "conclusion";
  relevance: number;
  section: string;
}

interface PaperSummary {
  title: string;
  authors: string;
  abstract: string;
  keyContributions: string[];
  methodology: string[];
  mainResults: string[];
  limitations: string[];
}

export default function PaperAssistantPage() {
  const [researchQuestion, setResearchQuestion] = useState("");
  const [selectedPaper, setSelectedPaper] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // 模拟的论文数据
  const papers = [
    "Deep Residual Learning for Image Recognition (He et al., 2016)",
    "Attention Is All You Need (Vaswani et al., 2017)",
    "BERT: Pre-training of Deep Bidirectional Transformers (Devlin et al., 2019)"
  ];

  // 模拟的分析结果
  const paperSummary: PaperSummary = {
    title: "Attention Is All You Need",
    authors: "Ashish Vaswani, Noam Shazeer, Niki Parmar, et al.",
    abstract: "本文提出了Transformer模型，完全基于注意力机制，摒弃了循环和卷积结构。模型在机器翻译任务上达到了SOTA性能，同时具有更好的并行性和更短的训练时间。",
    keyContributions: [
      "提出了完全基于自注意力机制的Transformer架构",
      "引入多头注意力（Multi-Head Attention）机制",
      "使用位置编码（Positional Encoding）处理序列信息",
      "在WMT 2014英德翻译任务上达到28.4 BLEU分数"
    ],
    methodology: [
      "编码器-解码器架构，各包含6层",
      "每层包含多头自注意力和前馈神经网络",
      "残差连接和层归一化",
      "缩放点积注意力机制"
    ],
    mainResults: [
      "在WMT 2014英德翻译上超越所有现有模型",
      "训练时间仅为其他模型的1/10",
      "在英法翻译上达到41.8 BLEU（新记录）"
    ],
    limitations: [
      "对于非常长的序列，计算复杂度为O(n²)",
      "需要大量的训练数据",
      "位置编码可能限制模型对位置信息的理解"
    ]
  };

  const knowledgePoints: KnowledgePoint[] = [
    {
      id: 1,
      title: "自注意力机制（Self-Attention）",
      content: "自注意力机制允许模型在处理序列的每个位置时，关注序列中的所有位置。通过查询（Query）、键（Key）、值（Value）三个向量计算注意力权重。数学表达：Attention(Q,K,V) = softmax(QK^T/√d_k)V",
      category: "definition",
      relevance: 95,
      section: "3.2 Attention"
    },
    {
      id: 2,
      title: "多头注意力（Multi-Head Attention）",
      content: "多头注意力允许模型在不同的表示子空间联合关注来自不同位置的信息。使用h个不同的注意力头，每个头学习不同的注意力模式。MultiHead(Q,K,V) = Concat(head_1,...,head_h)W^O",
      category: "method",
      relevance: 92,
      section: "3.2.2 Multi-Head Attention"
    },
    {
      id: 3,
      title: "位置编码（Positional Encoding）",
      content: "由于Transformer不包含循环或卷积结构，需要注入序列位置信息。使用正弦和余弦函数的位置编码：PE(pos,2i)=sin(pos/10000^(2i/d_model)), PE(pos,2i+1)=cos(pos/10000^(2i/d_model))",
      category: "method",
      relevance: 88,
      section: "3.5 Positional Encoding"
    },
    {
      id: 4,
      title: "缩放点积注意力定理",
      content: "当维度d_k较大时，点积的值会变得很大，使softmax函数进入梯度很小的区域。因此需要将点积缩放1/√d_k。这确保了梯度的稳定性和模型的可训练性。",
      category: "theorem",
      relevance: 85,
      section: "3.2.1 Scaled Dot-Product Attention"
    },
    {
      id: 5,
      title: "编码器-解码器架构",
      content: "编码器将输入序列映射为连续表示z = (z_1,...,z_n)，解码器根据z生成输出序列y = (y_1,...,y_m)。每一步都是自回归的，使用之前生成的符号作为额外输入。",
      category: "definition",
      relevance: 80,
      section: "3.1 Model Architecture"
    },
    {
      id: 6,
      title: "在机器翻译中的应用",
      content: "Transformer在WMT 2014英德翻译任务上取得28.4 BLEU，超越所有已发表的模型。训练时间从3.5天减少到12小时（8个P100 GPU），显著提高了训练效率。",
      category: "application",
      relevance: 78,
      section: "6. Results"
    },
    {
      id: 7,
      title: "注意力复杂度分析",
      content: "自注意力层的时间复杂度为O(n²·d)，其中n是序列长度，d是表示维度。当序列很长时（n>>d），这比循环层O(n·d²)更高效。空间复杂度同样为O(n²·d)。",
      category: "conclusion",
      relevance: 75,
      section: "4. Why Self-Attention"
    }
  ];

  const categories = {
    all: { label: "全部", icon: "📚", color: "#667eea" },
    definition: { label: "定义", icon: "📖", color: "#4facfe" },
    theorem: { label: "定理", icon: "🎯", color: "#f093fb" },
    method: { label: "方法", icon: "🔧", color: "#43e97b" },
    application: { label: "应用", icon: "💡", color: "#fa709a" },
    conclusion: { label: "结论", icon: "✅", color: "#fee140" }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };

  const filteredPoints = selectedCategory === "all"
    ? knowledgePoints
    : knowledgePoints.filter(p => p.category === selectedCategory);

  const sortedPoints = [...filteredPoints].sort((a, b) => b.relevance - a.relevance);

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
      {/* Header */}
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
          论文阅读助手 🤖
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#ffffff", opacity: 0.9 }}>
          智能分析论文内容，提取与您的研究问题相关的关键知识点
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "24px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}
      >
        <h3 style={{
          fontSize: "1.3rem",
          fontWeight: "700",
          color: "#2d3748",
          marginBottom: "20px"
        }}>
          📝 输入您的研究问题
        </h3>

        <textarea
          value={researchQuestion}
          onChange={(e) => setResearchQuestion(e.target.value)}
          placeholder="例如：如何在深度学习中使用注意力机制提高序列建模能力？"
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "16px",
            fontSize: "1rem",
            border: "2px solid #e9ecef",
            borderRadius: "12px",
            outline: "none",
            resize: "vertical",
            fontFamily: "inherit",
            lineHeight: "1.6",
            marginBottom: "20px"
          }}
          onFocus={(e) => e.target.style.borderColor = "#667eea"}
          onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
        />

        <h3 style={{
          fontSize: "1.3rem",
          fontWeight: "700",
          color: "#2d3748",
          marginBottom: "16px"
        }}>
          📄 选择或上传论文
        </h3>

        <select
          value={selectedPaper}
          onChange={(e) => setSelectedPaper(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "1rem",
            border: "2px solid #e9ecef",
            borderRadius: "12px",
            outline: "none",
            cursor: "pointer",
            marginBottom: "16px",
            background: "white"
          }}
          onFocus={(e) => e.target.style.borderColor = "#667eea"}
          onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
        >
          <option value="">-- 选择论文 --</option>
          {papers.map((paper, index) => (
            <option key={index} value={paper}>{paper}</option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "12px" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={!researchQuestion || !selectedPaper || isAnalyzing}
            style={{
              flex: 1,
              padding: "16px",
              background: (!researchQuestion || !selectedPaper)
                ? "#cbd5e0"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: (!researchQuestion || !selectedPaper) ? "not-allowed" : "pointer",
              boxShadow: (!researchQuestion || !selectedPaper)
                ? "none"
                : "0 4px 15px rgba(102, 126, 234, 0.3)"
            }}
          >
            {isAnalyzing ? "🔄 分析中..." : "🚀 开始分析"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "16px 24px",
              background: "white",
              color: "#667eea",
              border: "2px solid #667eea",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            📤 上传PDF
          </motion.button>
        </div>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Paper Summary */}
            <motion.div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "20px",
                padding: "28px",
                marginBottom: "24px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)"
              }}
            >
              <h3 style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#2d3748",
                marginBottom: "8px"
              }}>
                {paperSummary.title}
              </h3>
              <p style={{ color: "#718096", marginBottom: "16px", fontSize: "0.95rem" }}>
                {paperSummary.authors}
              </p>

              <div style={{
                padding: "16px",
                background: "#f8f9fa",
                borderRadius: "12px",
                marginBottom: "20px",
                borderLeft: "4px solid #667eea"
              }}>
                <div style={{ fontWeight: "600", color: "#2d3748", marginBottom: "8px" }}>
                  📄 摘要
                </div>
                <p style={{ color: "#4a5568", lineHeight: "1.6", margin: 0 }}>
                  {paperSummary.abstract}
                </p>
              </div>

              {/* Key Contributions */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3748", marginBottom: "12px" }}>
                  ⭐ 关键贡献
                </h4>
                <ul style={{ margin: 0, paddingLeft: "24px", color: "#4a5568", lineHeight: "1.8" }}>
                  {paperSummary.keyContributions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Methodology */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3748", marginBottom: "12px" }}>
                  🔧 方法论
                </h4>
                <ul style={{ margin: 0, paddingLeft: "24px", color: "#4a5568", lineHeight: "1.8" }}>
                  {paperSummary.methodology.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Main Results */}
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3748", marginBottom: "12px" }}>
                    ✅ 主要结果
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: "24px", color: "#4a5568", lineHeight: "1.8" }}>
                    {paperSummary.mainResults.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3748", marginBottom: "12px" }}>
                    ⚠️ 局限性
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: "24px", color: "#4a5568", lineHeight: "1.8" }}>
                    {paperSummary.limitations.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Knowledge Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px"
              }}>
                <h3 style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#ffffff"
                }}>
                  🎯 相关知识点（按相关度排序）
                </h3>
                <div style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#667eea"
                }}>
                  共 {sortedPoints.length} 个知识点
                </div>
              </div>

              {/* Category Filter */}
              <div style={{
                display: "flex",
                gap: "12px",
                marginBottom: "20px",
                flexWrap: "wrap"
              }}>
                {Object.entries(categories).map(([key, { label, icon, color }]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(key)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      background: selectedCategory === key
                        ? color
                        : "rgba(255, 255, 255, 0.95)",
                      color: selectedCategory === key ? "white" : color,
                      boxShadow: selectedCategory === key
                        ? `0 4px 12px ${color}40`
                        : "0 2px 8px rgba(0,0,0,0.1)",
                      transition: "all 0.2s"
                    }}
                  >
                    {icon} {label}
                  </motion.button>
                ))}
              </div>

              {/* Knowledge Points List */}
              {sortedPoints.map((point, index) => (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "16px",
                    padding: "24px",
                    marginBottom: "16px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {/* Relevance Badge */}
                  <div style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <div style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      background: `linear-gradient(135deg, ${categories[point.category].color} 0%, ${categories[point.category].color}CC 100%)`,
                      color: "white",
                      fontSize: "0.85rem",
                      fontWeight: "600"
                    }}>
                      {categories[point.category].icon} {categories[point.category].label}
                    </div>
                    <div style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      background: point.relevance >= 90
                        ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                        : point.relevance >= 80
                        ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                        : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      color: "white",
                      fontSize: "0.85rem",
                      fontWeight: "600"
                    }}>
                      {point.relevance}% 相关
                    </div>
                  </div>

                  <h4 style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#2d3748",
                    marginBottom: "4px",
                    paddingRight: "200px"
                  }}>
                    {point.title}
                  </h4>

                  <div style={{
                    fontSize: "0.85rem",
                    color: "#718096",
                    marginBottom: "12px"
                  }}>
                    📍 章节: {point.section}
                  </div>

                  <p style={{
                    color: "#4a5568",
                    lineHeight: "1.7",
                    margin: 0,
                    fontSize: "0.95rem"
                  }}>
                    {point.content}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      {!showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            padding: "24px",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}
        >
          <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3748", marginBottom: "12px" }}>
            💡 使用说明
          </h4>
          <ul style={{ color: "#4a5568", lineHeight: "1.8", margin: 0, paddingLeft: "20px" }}>
            <li>输入您正在研究的问题，系统会找出论文中相关的知识点</li>
            <li>选择论文库中的论文，或上传您自己的PDF文件</li>
            <li>系统会自动提取论文的关键内容：定义、定理、方法、应用等</li>
            <li>知识点按与您问题的相关度排序，帮助快速定位重要信息</li>
            <li>可以按类别筛选知识点，聚焦感兴趣的内容</li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}
