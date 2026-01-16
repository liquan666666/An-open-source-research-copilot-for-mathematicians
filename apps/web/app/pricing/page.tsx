"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getSubscriptionStatus, activateSubscription, getPlanName } from "../../lib/subscription";

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState("");
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    const status = getSubscriptionStatus();
    setCurrentPlan(status.plan);
    setDaysRemaining(status.daysRemaining);
  }, []);

  const handlePurchase = (plan: 'monthly' | 'yearly' | 'lifetime') => {
    // 实际应用中，这里应该调用支付API
    const confirmMessage = `确认购买${getPlanName(plan)}吗？\n\n注意：这是演示版本，实际不会扣费。点击确认后将激活${getPlanName(plan)}。`;

    if (confirm(confirmMessage)) {
      activateSubscription(plan);
      alert(`🎉 恭喜！${getPlanName(plan)}已激活！\n\n现在您可以无限制使用所有功能了。`);
      window.location.href = '/';
    }
  };

  const plans = [
    {
      id: 'monthly',
      name: '月度订阅',
      price: '29',
      period: '月',
      icon: '📅',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      features: [
        '✅ 无限访问所有功能',
        '✅ 课题推荐系统',
        '✅ 论文检索下载',
        '✅ AI阅读助手',
        '✅ 研究路线图生成',
        '✅ 任务管理与打卡',
        '✅ 数据云端备份',
        '✅ 优先技术支持'
      ],
      popular: false
    },
    {
      id: 'yearly',
      name: '年度订阅',
      price: '299',
      period: '年',
      icon: '🎁',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      features: [
        '✅ 月度套餐所有功能',
        '🎉 相当于每月仅需 ¥25',
        '🎉 节省 ¥49（14%优惠）',
        '✅ 数据云端备份',
        '✅ 高级研究分析',
        '✅ 定制化课题推荐',
        '✅ 优先新功能体验',
        '✅ VIP专属技术支持'
      ],
      popular: true,
      badge: '最超值'
    },
    {
      id: 'lifetime',
      name: '终身会员',
      price: '999',
      period: '终身',
      icon: '👑',
      color: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
      features: [
        '✅ 年度套餐所有功能',
        '🎉 一次付费，终身使用',
        '🎉 未来所有新功能免费',
        '✅ 无限云端存储空间',
        '✅ 高级数据分析报告',
        '✅ 个性化研究顾问',
        '✅ 终身免费升级',
        '👑 VIP尊享服务'
      ],
      popular: false,
      badge: '最划算'
    }
  ];

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
            marginBottom: "12px",
            textAlign: "center"
          }}
        >
          选择适合您的计划 💎
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#ffffff", opacity: 0.9, textAlign: "center" }}>
          30天免费试用，随时可取消订阅
        </p>
      </motion.div>

      {/* 当前订阅状态 */}
      {currentPlan === 'free_trial' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: "32px",
            padding: "20px",
            background: daysRemaining > 7
              ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              : "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
            borderRadius: "16px",
            color: "white",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
          }}
        >
          <div style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "8px" }}>
            {daysRemaining > 0
              ? `🎉 免费试用期剩余 ${daysRemaining} 天`
              : "⚠️ 免费试用期已结束"}
          </div>
          <div style={{ fontSize: "0.95rem", opacity: 0.95 }}>
            {daysRemaining > 0
              ? "升级到付费计划，享受不间断的研究助手服务"
              : "请选择以下任一计划继续使用"}
          </div>
        </motion.div>
      )}

      {currentPlan !== 'free_trial' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: "32px",
            padding: "20px",
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            borderRadius: "16px",
            color: "white",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
          }}
        >
          <div style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "4px" }}>
            ✨ 您当前的计划：{getPlanName(currentPlan)}
          </div>
          <div style={{ fontSize: "0.95rem", opacity: 0.95 }}>
            感谢您的支持！您可以随时升级到更高级的计划
          </div>
        </motion.div>
      )}

      {/* 定价卡片 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
        marginBottom: "48px"
      }}>
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            whileHover={{ scale: 1.03, y: -8 }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "24px",
              padding: "32px",
              position: "relative",
              overflow: "hidden",
              boxShadow: plan.popular
                ? "0 8px 32px rgba(102, 126, 234, 0.3)"
                : "0 4px 20px rgba(0, 0, 0, 0.1)",
              border: plan.popular ? "3px solid #667eea" : "1px solid rgba(255, 255, 255, 0.3)"
            }}
          >
            {/* 顶部渐变条 */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: plan.color
            }} />

            {/* 热门标签 */}
            {plan.badge && (
              <div style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                padding: "6px 16px",
                background: plan.color,
                color: "white",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "700",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
              }}>
                {plan.badge}
              </div>
            )}

            {/* 图标 */}
            <div style={{
              fontSize: "3.5rem",
              textAlign: "center",
              marginBottom: "16px",
              marginTop: plan.badge ? "20px" : "0"
            }}>
              {plan.icon}
            </div>

            {/* 计划名称 */}
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#2d3748",
              textAlign: "center",
              marginBottom: "16px"
            }}>
              {plan.name}
            </h3>

            {/* 价格 */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px" }}>
                <span style={{ fontSize: "1.2rem", color: "#718096", fontWeight: "600" }}>¥</span>
                <span style={{ fontSize: "3rem", fontWeight: "800", color: "#2d3748" }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: "1rem", color: "#718096", fontWeight: "600" }}>
                  /{plan.period}
                </span>
              </div>
            </div>

            {/* 功能列表 */}
            <div style={{ marginBottom: "28px" }}>
              {plan.features.map((feature, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 0",
                    fontSize: "0.9rem",
                    color: "#4a5568",
                    lineHeight: "1.6",
                    borderBottom: i < plan.features.length - 1 ? "1px solid #e9ecef" : "none"
                  }}
                >
                  {feature}
                </div>
              ))}
            </div>

            {/* 购买按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePurchase(plan.id as any)}
              disabled={currentPlan === plan.id}
              style={{
                width: "100%",
                padding: "16px",
                background: currentPlan === plan.id
                  ? "#e9ecef"
                  : plan.color,
                color: currentPlan === plan.id ? "#718096" : "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: currentPlan === plan.id ? "not-allowed" : "pointer",
                boxShadow: currentPlan === plan.id
                  ? "none"
                  : "0 4px 15px rgba(0, 0, 0, 0.2)",
                opacity: currentPlan === plan.id ? 0.6 : 1
              }}
            >
              {currentPlan === plan.id ? "✓ 当前计划" : "立即订阅"}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* 常见问题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          padding: "32px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          marginBottom: "24px"
        }}
      >
        <h3 style={{
          fontSize: "1.5rem",
          fontWeight: "700",
          color: "#2d3748",
          marginBottom: "24px",
          textAlign: "center"
        }}>
          ❓ 常见问题
        </h3>

        <div style={{ display: "grid", gap: "20px" }}>
          {[
            {
              q: "免费试用期结束后会怎样？",
              a: "试用期结束后，您需要订阅付费计划才能继续使用。您的数据会被安全保留90天。"
            },
            {
              q: "可以随时取消订阅吗？",
              a: "可以！您可以随时取消订阅，已支付的当前周期会继续有效，到期后不再续费。"
            },
            {
              q: "支持哪些支付方式？",
              a: "我们支持微信支付、支付宝、银行卡等多种支付方式（演示版本暂未接入真实支付）。"
            },
            {
              q: "终身会员真的是终身吗？",
              a: "是的！一次购买，终身使用，包括未来所有新功能，无需额外付费。"
            },
            {
              q: "数据安全有保障吗？",
              a: "我们采用银行级加密技术，定期备份数据，确保您的研究资料安全无忧。"
            }
          ].map((faq, i) => (
            <div
              key={i}
              style={{
                padding: "20px",
                background: "#f8f9fa",
                borderRadius: "12px",
                borderLeft: "4px solid #667eea"
              }}
            >
              <div style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#2d3748",
                marginBottom: "8px"
              }}>
                {faq.q}
              </div>
              <div style={{
                fontSize: "0.9rem",
                color: "#718096",
                lineHeight: "1.6"
              }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 保障说明 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          padding: "24px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          textAlign: "center",
          color: "#718096"
        }}
      >
        <div style={{ fontSize: "1rem", marginBottom: "12px" }}>
          🔒 安全支付 · 🎁 7天无理由退款 · 📞 24/7技术支持
        </div>
        <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
          注意：这是演示版本，支付功能未接入真实支付接口
        </div>
      </motion.div>
    </div>
  );
}
