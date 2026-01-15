"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

interface SelectedTopic {
  id: number;
  title: string;
  area: string;
  difficulty: string;
  description: string;
  keywords: string[];
  estimatedDuration: string;
  papers: number;
  interest: number;
}

interface LearningItem {
  title: string;
  description: string;
  resources: string[];
  duration: string;
}

interface Phase {
  id: number;
  week: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  learningItems: LearningItem[];
}

export default function RoadmapPage() {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);
  const [selectedTopic, setSelectedTopic] = useState<SelectedTopic | null>(null);

  useEffect(() => {
    // 从localStorage读取所选课题
    const topicData = localStorage.getItem('selectedTopic');
    if (topicData) {
      setSelectedTopic(JSON.parse(topicData));
    }
  }, []);

  const phases: Phase[] = [
    {
      id: 0,
      week: "第 1-2 周",
      title: "基础知识补充",
      description: "建立数学研究所需的基础理论框架",
      icon: "📚",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      learningItems: [
        {
          title: "泛函分析基础",
          description: "学习Banach空间、Hilbert空间的基本概念和性质",
          resources: [
            "《泛函分析》- 夏道行",
            "Functional Analysis - Walter Rudin",
            "MIT OpenCourseWare: Functional Analysis"
          ],
          duration: "5-7天"
        },
        {
          title: "拓扑学核心概念",
          description: "掌握点集拓扑和代数拓扑的基本工具",
          resources: [
            "《基础拓扑学讲义》- 尤承业",
            "Topology - James Munkres",
            "视频课程: Topology Without Tears"
          ],
          duration: "5-7天"
        }
      ]
    },
    {
      id: 1,
      week: "第 3-4 周",
      title: "文献调研与精读",
      description: "深入阅读领域核心论文，理解研究前沿",
      icon: "🔍",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      learningItems: [
        {
          title: "经典论文研读",
          description: "精读领域内3-5篇奠基性论文，理解核心思想",
          resources: [
            "arXiv.org 数学类论文检索",
            "Google Scholar 引用追踪",
            "MathSciNet 数学文献数据库",
            "使用Zotero进行文献管理"
          ],
          duration: "7天"
        },
        {
          title: "最新进展跟踪",
          description: "关注近3年的重要工作和技术突破",
          resources: [
            "订阅相关期刊 TOC alerts",
            "关注领域顶尖学者的主页",
            "参与在线研讨会和讲座"
          ],
          duration: "7天"
        }
      ]
    },
    {
      id: 2,
      week: "第 5-6 周",
      title: "问题定位与方法学习",
      description: "确定具体研究问题，学习必要的数学工具",
      icon: "🎯",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      learningItems: [
        {
          title: "研究问题细化",
          description: "将大问题拆解为可处理的子问题，评估可行性",
          resources: [
            "与导师进行深度讨论",
            "撰写问题陈述文档",
            "分析问题的创新点和难点"
          ],
          duration: "4天"
        },
        {
          title: "专门技术学习",
          description: "根据问题需求，学习特定的数学方法和技巧",
          resources: [
            "偏微分方程的现代方法",
            "变分法与最优控制",
            "数值分析工具（MATLAB/Python）",
            "符号计算（Mathematica/Sage）"
          ],
          duration: "10天"
        }
      ]
    },
    {
      id: 3,
      week: "第 7-8 周",
      title: "初步探索与实验",
      description: "开始尝试解决问题，进行理论推导或数值实验",
      icon: "🧪",
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      learningItems: [
        {
          title: "理论推导",
          description: "基于已有理论，尝试证明关键引理和定理",
          resources: [
            "LaTeX 数学公式排版",
            "逻辑推理工具和证明助手",
            "定期整理推导笔记"
          ],
          duration: "7天"
        },
        {
          title: "数值验证",
          description: "通过计算实验验证理论假设，寻找反例或模式",
          resources: [
            "Python数值计算库（NumPy, SciPy）",
            "可视化工具（Matplotlib, Plotly）",
            "高性能计算平台使用"
          ],
          duration: "7天"
        }
      ]
    },
    {
      id: 4,
      week: "第 9-12 周",
      title: "深入研究与成果产出",
      description: "完成主要理论结果，撰写论文初稿",
      icon: "✍️",
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      learningItems: [
        {
          title: "核心定理证明",
          description: "完善主要结果的严格证明，处理技术细节",
          resources: [
            "反复推敲证明逻辑",
            "寻找更简洁的证明路径",
            "与同行交流验证"
          ],
          duration: "14天"
        },
        {
          title: "论文撰写",
          description: "按照学术期刊标准，撰写论文各个部分",
          resources: [
            "目标期刊的投稿指南",
            "学术英文写作指南",
            "Overleaf在线LaTeX编辑器",
            "语言润色服务（如需要）"
          ],
          duration: "14天"
        }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const phaseVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          marginBottom: "40px"
        }}
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
            opacity: 0.9,
            transition: "opacity 0.2s"
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
          研究路线图 🗺️
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#ffffff", opacity: 0.9 }}>
          为您生成的3个月数学研究执行计划 - 从基础到论文产出
        </p>
      </motion.div>

      {/* Selected Topic Card */}
      {selectedTopic && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "32px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(102, 126, 234, 0.3)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "2rem" }}>🎯</span>
            <h2 style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#2d3748",
              margin: 0
            }}>
              您选择的课题
            </h2>
          </div>

          <h3 style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#667eea",
            marginBottom: "16px",
            lineHeight: "1.4"
          }}>
            {selectedTopic.title}
          </h3>

          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            <span style={{
              padding: "6px 14px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: "600",
              background: "rgba(102, 126, 234, 0.1)",
              color: "#667eea"
            }}>
              📚 {selectedTopic.area}
            </span>
            <span style={{
              padding: "6px 14px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: "600",
              background: "rgba(79, 172, 254, 0.1)",
              color: "#4facfe"
            }}>
              🎯 {selectedTopic.difficulty}
            </span>
            <span style={{
              padding: "6px 14px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: "600",
              background: "rgba(67, 233, 123, 0.1)",
              color: "#43e97b"
            }}>
              ⏱️ {selectedTopic.estimatedDuration}
            </span>
            <span style={{
              padding: "6px 14px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: "600",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white"
            }}>
              ⭐ {selectedTopic.interest}
            </span>
          </div>

          <p style={{ color: "#4a5568", lineHeight: "1.7", marginBottom: "12px" }}>
            {selectedTopic.description}
          </p>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {selectedTopic.keywords.map((keyword, i) => (
              <span key={i} style={{
                padding: "4px 12px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                background: "#f8f9fa",
                color: "#718096",
                border: "1px solid #e9ecef"
              }}>
                #{keyword}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: "relative"
        }}
      >
        {/* Timeline line */}
        <div
          style={{
            position: "absolute",
            left: "30px",
            top: "20px",
            bottom: "20px",
            width: "4px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)",
            borderRadius: "2px"
          }}
        />

        {phases.map((phase, index) => (
          <motion.div
            key={phase.id}
            variants={phaseVariants}
            style={{
              position: "relative",
              marginBottom: "24px"
            }}
          >
            {/* Timeline dot */}
            <motion.div
              style={{
                position: "absolute",
                left: "18px",
                top: "28px",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: phase.color,
                border: "4px solid rgba(255,255,255,0.9)",
                boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                zIndex: 10
              }}
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {phase.icon}
            </motion.div>

            {/* Phase card */}
            <motion.div
              style={{
                marginLeft: "70px",
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                cursor: "pointer"
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
            >
              {/* Phase header */}
              <div
                style={{
                  background: phase.color,
                  padding: "20px 24px",
                  color: "#ffffff"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "4px" }}>
                      {phase.week}
                    </div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0 }}>
                      {phase.title}
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedPhase === phase.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ fontSize: "1.5rem" }}
                  >
                    ▼
                  </motion.div>
                </div>
                <p style={{ margin: "8px 0 0 0", opacity: 0.95 }}>
                  {phase.description}
                </p>
              </div>

              {/* Learning items */}
              <motion.div
                initial={false}
                animate={{
                  height: expandedPhase === phase.id ? "auto" : 0,
                  opacity: expandedPhase === phase.id ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                style={{
                  overflow: "hidden"
                }}
              >
                <div style={{ padding: "24px" }}>
                  {phase.learningItems.map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: expandedPhase === phase.id ? 1 : 0,
                        y: expandedPhase === phase.id ? 0 : 10
                      }}
                      transition={{ delay: itemIndex * 0.1 }}
                      style={{
                        marginBottom: itemIndex < phase.learningItems.length - 1 ? "24px" : 0,
                        padding: "20px",
                        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                        borderRadius: "12px",
                        border: "1px solid #dee2e6"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                        <h4 style={{
                          fontSize: "1.2rem",
                          fontWeight: "600",
                          color: "#2d3748",
                          margin: 0
                        }}>
                          {item.title}
                        </h4>
                        <span style={{
                          background: "rgba(102, 126, 234, 0.1)",
                          color: "#667eea",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          whiteSpace: "nowrap"
                        }}>
                          ⏱️ {item.duration}
                        </span>
                      </div>

                      <p style={{
                        color: "#4a5568",
                        marginBottom: "16px",
                        lineHeight: "1.6"
                      }}>
                        {item.description}
                      </p>

                      <div>
                        <div style={{
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          color: "#2d3748",
                          marginBottom: "8px"
                        }}>
                          📖 学习资源：
                        </div>
                        <ul style={{
                          margin: 0,
                          paddingLeft: "20px",
                          color: "#718096"
                        }}>
                          {item.resources.map((resource, resIndex) => (
                            <li key={resIndex} style={{ marginBottom: "6px", lineHeight: "1.5" }}>
                              {resource}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          marginTop: "40px",
          padding: "24px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}
      >
        <h3 style={{
          fontSize: "1.3rem",
          fontWeight: "700",
          color: "#2d3748",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          💡 使用建议
        </h3>
        <ul style={{
          color: "#4a5568",
          lineHeight: "1.8",
          margin: 0,
          paddingLeft: "24px"
        }}>
          <li>每周制定详细的学习计划，建议使用「今日任务」功能追踪进度</li>
          <li>点击每个阶段可以展开查看具体的学习内容和资源</li>
          <li>根据个人基础调整每个阶段的时间，这个路线图是一个参考框架</li>
          <li>定期使用「打卡监督」记录学习心得和遇到的问题</li>
          <li>建议每周与导师或研究伙伴讨论进展，及时调整研究方向</li>
        </ul>
      </motion.div>
    </div>
  );
}
