"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import Paywall from "../../components/Paywall";

export default function ExportPage() {
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    setExporting(true);

    // 模拟导出过程
    setTimeout(() => {
      // 获取所有数据
      const interests = localStorage.getItem("researchInterests") || "[]";
      const subscription = localStorage.getItem("mrp_subscription") || "{}";

      const data = {
        exportDate: new Date().toISOString(),
        interests: JSON.parse(interests),
        subscription: JSON.parse(subscription),
        stats: {
          totalDays: 15,
          checkIns: 12,
          tasksCompleted: 45,
          papersRead: 23
        }
      };

      if (format === 'json') {
        // 导出JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mathresearch_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // 导出CSV (简化版，只导出研究兴趣)
        const interests = JSON.parse(localStorage.getItem("researchInterests") || "[]");
        let csv = "课题,描述,水平,优先级\n";
        interests.forEach((item: any) => {
          csv += `"${item.topic}","${item.description}","${item.level}",${item.priority}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `研究兴趣_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        alert('PDF导出功能需要后端支持，演示版本暂未实现。\n\n您可以使用JSON或CSV格式导出数据。');
        setExporting(false);
        return;
      }

      setExporting(false);
      setExportSuccess(true);

      setTimeout(() => setExportSuccess(false), 3000);
    }, 1500);
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
            href="/account"
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
            <span>←</span> 返回账户
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
            数据导出 📦
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#ffffff", opacity: 0.9 }}>
            导出您的研究数据和设置
          </p>
        </motion.div>

        {/* 导出成功提示 */}
        {exportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              marginBottom: "24px",
              padding: "16px",
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              borderRadius: "12px",
              color: "white",
              textAlign: "center",
              fontSize: "1rem",
              fontWeight: "600"
            }}
          >
            ✅ 导出成功！文件已下载
          </motion.div>
        )}

        {/* 导出格式选择 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "32px"
        }}>
          {[
            {
              format: 'json',
              name: 'JSON 格式',
              icon: '📄',
              desc: '包含完整数据结构，适合程序读取和备份',
              color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              features: ['✓ 完整数据结构', '✓ 易于程序处理', '✓ 支持再导入']
            },
            {
              format: 'csv',
              name: 'CSV 表格',
              icon: '📊',
              desc: '表格格式，可用 Excel 打开',
              color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              features: ['✓ Excel 兼容', '✓ 易于查看', '✓ 数据分析']
            },
            {
              format: 'pdf',
              name: 'PDF 报告',
              icon: '📑',
              desc: '格式化的研究报告（需后端支持）',
              color: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
              features: ['✓ 专业排版', '✓ 易于分享', '✓ 打印友好']
            }
          ].map((option, index) => (
            <motion.div
              key={option.format}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "5px",
                background: option.color
              }} />

              <div style={{ fontSize: "3rem", marginBottom: "16px", textAlign: "center" }}>
                {option.icon}
              </div>

              <h3 style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                color: "#2d3748",
                marginBottom: "12px",
                textAlign: "center"
              }}>
                {option.name}
              </h3>

              <p style={{
                fontSize: "0.9rem",
                color: "#718096",
                lineHeight: "1.6",
                marginBottom: "16px",
                textAlign: "center"
              }}>
                {option.desc}
              </p>

              <div style={{ marginBottom: "20px" }}>
                {option.features.map((feature, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: "0.85rem",
                      color: "#4a5568",
                      padding: "6px 0",
                      borderBottom: i < option.features.length - 1 ? "1px solid #e9ecef" : "none"
                    }}
                  >
                    {feature}
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExport(option.format as any)}
                disabled={exporting}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: exporting ? "#e9ecef" : option.color,
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: exporting ? "not-allowed" : "pointer",
                  opacity: exporting ? 0.6 : 1
                }}
              >
                {exporting ? "导出中..." : `导出 ${option.name}`}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* 导出说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}
        >
          <h3 style={{
            fontSize: "1.3rem",
            fontWeight: "700",
            color: "#2d3748",
            marginBottom: "16px"
          }}>
            📋 导出内容说明
          </h3>

          <div style={{ display: "grid", gap: "16px" }}>
            {[
              { title: "研究兴趣", desc: "您添加的所有研究方向和课题" },
              { title: "订阅信息", desc: "当前订阅计划和到期时间" },
              { title: "使用统计", desc: "打卡记录、任务完成情况等" },
              { title: "个人设置", desc: "偏好设置和配置信息" }
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "16px",
                  background: "#f8f9fa",
                  borderRadius: "12px",
                  borderLeft: "4px solid #667eea"
                }}
              >
                <div style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#2d3748",
                  marginBottom: "4px"
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: "0.85rem",
                  color: "#718096"
                }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 注意事项 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: "24px",
            padding: "20px",
            background: "rgba(255, 243, 205, 0.95)",
            borderRadius: "16px",
            border: "1px solid #ffc107"
          }}
        >
          <div style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-start"
          }}>
            <span style={{ fontSize: "1.5rem" }}>💡</span>
            <div>
              <div style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#856404",
                marginBottom: "8px"
              }}>
                重要提示
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: "20px",
                fontSize: "0.85rem",
                color: "#856404",
                lineHeight: "1.8"
              }}>
                <li>导出的数据仅包含本地存储的信息</li>
                <li>建议定期导出数据作为备份</li>
                <li>JSON格式支持再次导入（功能开发中）</li>
                <li>PDF导出需要后端支持，演示版暂未实现</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </Paywall>
  );
}
