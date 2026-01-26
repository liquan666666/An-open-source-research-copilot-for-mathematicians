"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "全部", icon: "📚" },
    { id: "getting-started", name: "快速开始", icon: "🚀" },
    { id: "features", name: "功能介绍", icon: "✨" },
    { id: "subscription", name: "订阅相关", icon: "💎" },
    { id: "account", name: "账户管理", icon: "👤" },
    { id: "troubleshooting", name: "问题排查", icon: "🔧" }
  ];

  const faqs = [
    {
      category: "getting-started",
      question: "如何开始使用 MathResearchPilot？",
      answer: "首次访问自动获得30天免费试用。建议按以下步骤：1) 在「我的研究兴趣」中添加您的研究方向；2) 浏览「课题推荐」获取研究灵感；3) 使用「论文库」检索相关文献；4) 通过「路线图」规划学习路径；5) 用「打卡监督」记录每日进展。"
    },
    {
      category: "getting-started",
      question: "免费试用包含哪些功能？",
      answer: "30天试用期内，您可以使用所有功能，包括：研究兴趣管理、课题推荐、论文检索下载、AI阅读助手、路线图生成、任务管理、打卡监督、使用统计和数据导出。"
    },
    {
      category: "features",
      question: "「论文阅读助手」如何使用？",
      answer: "论文阅读助手使用AI技术自动提取论文知识点。访问该功能后，输入您的研究问题，系统会从论文中提取相关的定义、定理、方法和应用，并按相关度排序。您可以按类别筛选知识点，快速定位重要信息。"
    },
    {
      category: "features",
      question: "如何生成研究路线图？",
      answer: "在「课题推荐」页面选择感兴趣的课题，点击「选择此课题并生成路线图」按钮。系统会自动生成包含5个学习阶段的详细计划，每个阶段包含学习项目、推荐资源和时间估计。"
    },
    {
      category: "features",
      question: "研究兴趣可以修改吗？",
      answer: "当然可以！在「我的研究兴趣」页面，您可以随时添加、编辑或删除研究兴趣。点击「编辑」按钮修改课题信息、研究水平和优先级，或点击「删除」按钮移除不再关注的方向。"
    },
    {
      category: "subscription",
      question: "试用期结束后会怎样？",
      answer: "试用期结束后，部分高级功能（如论文库、论文阅读助手、使用统计、数据导出）将需要订阅付费计划才能继续使用。您的数据会安全保留90天，订阅后即可恢复访问。"
    },
    {
      category: "subscription",
      question: "有哪些订阅计划？",
      answer: "我们提供三种计划：1) 月度订阅 ¥29/月；2) 年度订阅 ¥299/年（相当于¥25/月，省14%）；3) 终身会员 ¥999（一次性付费，永久使用）。所有计划都包含完整功能。"
    },
    {
      category: "subscription",
      question: "可以随时取消订阅吗？",
      answer: "可以！在「账户管理」页面点击「取消订阅」按钮。取消后您仍可使用至当前订阅期结束，到期后不再续费。我们支持7天无理由退款。"
    },
    {
      category: "subscription",
      question: "如何升级订阅计划？",
      answer: "访问「会员订阅」或「账户管理」页面，选择您想升级的计划。升级后立即生效，费用按剩余时间比例计算。"
    },
    {
      category: "account",
      question: "如何查看我的使用统计？",
      answer: "访问「使用统计」页面可以查看详细的数据分析，包括：使用天数、打卡次数、完成任务数、阅读论文数等6大维度，还有每周趋势和成就徽章系统。这是付费会员专享功能。"
    },
    {
      category: "account",
      question: "如何导出我的数据？",
      answer: "在「数据导出」页面可以选择三种格式：JSON（完整数据）、CSV（表格格式）或PDF（需后端支持）。导出内容包括研究兴趣、订阅信息、使用统计和个人设置。"
    },
    {
      category: "account",
      question: "数据存储在哪里？",
      answer: "当前版本数据存储在浏览器本地（localStorage），因此清除浏览器缓存会导致数据丢失。建议定期使用「数据导出」功能备份。未来版本将支持云端同步。"
    },
    {
      category: "troubleshooting",
      question: "为什么无法访问某些功能？",
      answer: "如果试用期已结束，部分高级功能会显示付费墙。订阅付费计划后即可继续使用。如果是付费用户仍无法访问，请检查订阅状态或联系技术支持。"
    },
    {
      category: "troubleshooting",
      question: "数据丢失了怎么办？",
      answer: "如果数据丢失，首先检查是否清除了浏览器缓存。如果有备份文件（JSON格式），未来版本将支持导入功能。建议定期导出数据作为备份。"
    },
    {
      category: "troubleshooting",
      question: "如何重置试用期（测试用）？",
      answer: "在「账户管理」页面底部有「重置为试用期」按钮，这是开发者测试功能。点击后会清除订阅数据并重新开启30天试用。注意：这仅用于演示和测试。"
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchSearch = searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

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
          帮助中心 📖
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#ffffff", opacity: 0.9 }}>
          快速找到您需要的答案
        </p>
      </motion.div>

      {/* 搜索框 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
          placeholder="🔍 搜索问题..."
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

      {/* 分类标签 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap"
        }}
      >
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: "10px 20px",
              borderRadius: "20px",
              border: "none",
              background: selectedCategory === cat.id
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "rgba(255, 255, 255, 0.95)",
              color: selectedCategory === cat.id ? "white" : "#4a5568",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: selectedCategory === cat.id
                ? "0 4px 15px rgba(102, 126, 234, 0.3)"
                : "0 2px 8px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s"
            }}
          >
            {cat.icon} {cat.name}
          </motion.button>
        ))}
      </motion.div>

      {/* FAQ 列表 */}
      <div>
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)"
              }}
            >
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: "700",
                color: "#2d3748",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span style={{ color: "#667eea" }}>Q:</span>
                {faq.question}
              </h3>
              <p style={{
                fontSize: "0.95rem",
                color: "#4a5568",
                lineHeight: "1.7",
                paddingLeft: "24px"
              }}>
                <span style={{ color: "#43e97b", fontWeight: "600" }}>A:</span> {faq.answer}
              </p>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: "60px 20px",
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "16px",
              color: "#718096"
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
            <div style={{ fontSize: "1.1rem" }}>
              未找到匹配的问题，请尝试其他关键词
            </div>
          </motion.div>
        )}
      </div>

      {/* 联系支持 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: "32px",
          padding: "28px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          textAlign: "center"
        }}
      >
        <h3 style={{
          fontSize: "1.3rem",
          fontWeight: "700",
          color: "#2d3748",
          marginBottom: "12px"
        }}>
          💬 还有其他问题？
        </h3>
        <p style={{
          fontSize: "0.95rem",
          color: "#718096",
          marginBottom: "20px",
          lineHeight: "1.6"
        }}>
          如果您在帮助中心找不到答案，欢迎联系我们的技术支持团队
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
            }}
          >
            📧 发送邮件
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "12px 24px",
              background: "white",
              color: "#667eea",
              border: "2px solid #667eea",
              borderRadius: "12px",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            💬 在线客服
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
