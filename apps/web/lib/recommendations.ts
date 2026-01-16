// 智能推荐引擎

import { getUserBehavior, getMostUsedFeatures, getUserEngagementScore } from './analytics';
import { getSubscriptionStatus } from './subscription';

export interface Recommendation {
  id: string;
  type: 'feature' | 'upgrade' | 'task' | 'tip';
  title: string;
  description: string;
  action: string;
  href?: string;
  priority: number; // 1-10
  icon: string;
}

// 基于用户行为生成个性化推荐
export function getPersonalizedRecommendations(): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const behavior = getUserBehavior();
  const subscription = getSubscriptionStatus();
  const engagementScore = getUserEngagementScore();
  const mostUsedFeatures = getMostUsedFeatures(3);

  // 1. 订阅相关推荐
  if (subscription.plan === 'free_trial') {
    if (subscription.daysRemaining <= 7 && subscription.daysRemaining > 0) {
      recommendations.push({
        id: 'upgrade_trial_ending',
        type: 'upgrade',
        title: '试用期即将结束',
        description: `还剩${subscription.daysRemaining}天试用期，升级会员享受不间断服务`,
        action: '查看订阅计划',
        href: '/pricing',
        priority: 10,
        icon: '⏰'
      });
    } else if (subscription.daysRemaining === 0) {
      recommendations.push({
        id: 'upgrade_trial_expired',
        type: 'upgrade',
        title: '试用期已结束',
        description: '立即订阅，继续使用所有功能',
        action: '选择订阅计划',
        href: '/pricing',
        priority: 10,
        icon: '🔒'
      });
    }
  }

  if (subscription.plan === 'monthly' && behavior.totalActions > 100) {
    recommendations.push({
      id: 'upgrade_to_yearly',
      type: 'upgrade',
      title: '升级年度会员更划算',
      description: '您是活跃用户！升级年度会员可节省14%费用',
      action: '了解年度计划',
      href: '/pricing',
      priority: 7,
      icon: '💰'
    });
  }

  // 2. 功能使用推荐
  const pageViews = behavior.pageViews;

  // 如果从未访问过研究兴趣页面
  if (!pageViews['/interests'] || pageViews['/interests'] < 2) {
    recommendations.push({
      id: 'try_interests',
      type: 'feature',
      title: '添加您的研究兴趣',
      description: '管理研究方向，让推荐更精准',
      action: '设置研究兴趣',
      href: '/interests',
      priority: 9,
      icon: '🎯'
    });
  }

  // 如果访问过论文库但未使用论文助手
  if (pageViews['/papers'] > 2 && (!pageViews['/paper-assistant'] || pageViews['/paper-assistant'] < 1)) {
    recommendations.push({
      id: 'try_paper_assistant',
      type: 'feature',
      title: '试试论文阅读助手',
      description: 'AI自动提取论文知识点，提高阅读效率',
      action: '开始使用',
      href: '/paper-assistant',
      priority: 8,
      icon: '🤖'
    });
  }

  // 如果从未查看统计
  if (!pageViews['/stats']) {
    recommendations.push({
      id: 'check_stats',
      type: 'feature',
      title: '查看您的研究统计',
      description: '了解学习进度，获得成就徽章',
      action: '查看统计',
      href: '/stats',
      priority: 6,
      icon: '📊'
    });
  }

  // 如果从未导出数据
  if (!pageViews['/export']) {
    recommendations.push({
      id: 'export_data',
      type: 'feature',
      title: '定期备份研究数据',
      description: '导出数据保护您的研究成果',
      action: '导出数据',
      href: '/export',
      priority: 5,
      icon: '📦'
    });
  }

  // 3. 基于活跃度的推荐
  if (engagementScore < 30) {
    recommendations.push({
      id: 'low_engagement',
      type: 'tip',
      title: '发现更多功能',
      description: '探索课题推荐和路线图功能，提升研究效率',
      action: '查看功能',
      href: '/',
      priority: 7,
      icon: '💡'
    });
  }

  // 如果活跃度高
  if (engagementScore > 70) {
    recommendations.push({
      id: 'power_user',
      type: 'task',
      title: '您是超级用户！',
      description: '分享给同学朋友，一起提升研究效率',
      action: '分享系统',
      priority: 4,
      icon: '🌟'
    });
  }

  // 4. 时间相关推荐
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    if (!pageViews['/tasks']) {
      recommendations.push({
        id: 'morning_tasks',
        type: 'task',
        title: '早安！规划今日任务',
        description: '查看今日任务列表，开启高效一天',
        action: '查看任务',
        href: '/tasks',
        priority: 8,
        icon: '🌅'
      });
    }
  } else if (hour >= 20 && hour < 24) {
    if (!pageViews['/checkin']) {
      recommendations.push({
        id: 'evening_checkin',
        type: 'task',
        title: '今天辛苦了！',
        description: '记录今日研究进展，保持连续打卡',
        action: '每日打卡',
        href: '/checkin',
        priority: 8,
        icon: '🌙'
      });
    }
  }

  // 5. 智能提示
  const totalActions = behavior.totalActions;

  if (totalActions > 50 && totalActions < 100) {
    recommendations.push({
      id: 'milestone_50',
      type: 'tip',
      title: '活跃里程碑！',
      description: '您已经完成50次操作，继续保持！',
      action: '查看成就',
      href: '/stats',
      priority: 5,
      icon: '🎉'
    });
  }

  // 按优先级排序
  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5); // 最多返回5条推荐
}

// 生成每日推荐任务
export function getDailyRecommendations(): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const today = new Date().getDay(); // 0-6

  // 周一：设定本周目标
  if (today === 1) {
    recommendations.push({
      id: 'monday_planning',
      type: 'task',
      title: '新的一周开始了',
      description: '设定本周研究目标和任务',
      action: '规划任务',
      href: '/tasks',
      priority: 9,
      icon: '📋'
    });
  }

  // 周三：中期回顾
  if (today === 3) {
    recommendations.push({
      id: 'wednesday_review',
      type: 'task',
      title: '周中检查',
      description: '回顾本周进度，调整计划',
      action: '查看进度',
      href: '/stats',
      priority: 7,
      icon: '🔍'
    });
  }

  // 周五：周总结
  if (today === 5) {
    recommendations.push({
      id: 'friday_summary',
      type: 'task',
      title: '本周总结',
      description: '总结本周成果，导出数据备份',
      action: '导出数据',
      href: '/export',
      priority: 8,
      icon: '📝'
    });
  }

  // 周末：轻松学习
  if (today === 0 || today === 6) {
    recommendations.push({
      id: 'weekend_reading',
      type: 'task',
      title: '周末充电时间',
      description: '阅读感兴趣的论文，拓展视野',
      action: '浏览论文',
      href: '/papers',
      priority: 6,
      icon: '📚'
    });
  }

  return recommendations;
}

// 获取功能使用建议
export function getFeatureUsageTips(): string[] {
  const behavior = getUserBehavior();
  const tips: string[] = [];

  const pageViews = behavior.pageViews;

  // 功能组合建议
  if (pageViews['/interests'] && !pageViews['/topics']) {
    tips.push('💡 您已添加研究兴趣，可以前往"课题推荐"获取个性化课题建议');
  }

  if (pageViews['/topics'] && !pageViews['/roadmap']) {
    tips.push('🗺️ 选择了课题？生成研究路线图帮您规划学习路径');
  }

  if (pageViews['/papers'] > 5 && !pageViews['/paper-assistant']) {
    tips.push('🤖 试试"论文阅读助手"，AI自动提取知识点，节省80%阅读时间');
  }

  if (behavior.totalActions > 20 && !pageViews['/stats']) {
    tips.push('📊 您已经很活跃了！查看"使用统计"了解您的学习数据');
  }

  if (behavior.totalActions > 50 && !pageViews['/export']) {
    tips.push('💾 建议定期"导出数据"备份您的研究成果');
  }

  return tips;
}

// 获取未使用的功能列表
export function getUnusedFeatures(): Array<{ name: string; description: string; href: string }> {
  const behavior = getUserBehavior();
  const allFeatures = [
    { name: '我的研究兴趣', description: '管理研究方向', href: '/interests', page: '/interests' },
    { name: '课题推荐', description: '获取研究课题', href: '/topics', page: '/topics' },
    { name: '论文库', description: '检索下载论文', href: '/papers', page: '/papers' },
    { name: '论文阅读助手', description: 'AI提取知识点', href: '/paper-assistant', page: '/paper-assistant' },
    { name: '路线图', description: '生成学习路线', href: '/roadmap', page: '/roadmap' },
    { name: '今日任务', description: '任务管理', href: '/tasks', page: '/tasks' },
    { name: '打卡监督', description: '记录进度', href: '/checkin', page: '/checkin' },
    { name: '使用统计', description: '查看数据分析', href: '/stats', page: '/stats' },
    { name: '数据导出', description: '备份研究数据', href: '/export', page: '/export' },
  ];

  return allFeatures.filter(feature => !behavior.pageViews[feature.page]);
}
