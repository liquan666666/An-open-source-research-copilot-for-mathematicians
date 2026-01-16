// 用户行为追踪系统

export interface UserAction {
  id: string;
  type: 'page_view' | 'button_click' | 'feature_use' | 'export_data' | 'subscription_action';
  page: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserBehavior {
  totalActions: number;
  pageViews: Record<string, number>;
  featureUsage: Record<string, number>;
  lastActive: string;
  sessionStart: string;
  actions: UserAction[];
}

const STORAGE_KEY = 'mrp_user_behavior';
const MAX_ACTIONS = 1000; // 最多保存1000条记录

// 获取用户行为数据
export function getUserBehavior(): UserBehavior {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return {
      totalActions: 0,
      pageViews: {},
      featureUsage: {},
      lastActive: new Date().toISOString(),
      sessionStart: new Date().toISOString(),
      actions: []
    };
  }
  return JSON.parse(data);
}

// 保存用户行为数据
function saveBehavior(behavior: UserBehavior): void {
  // 只保留最近的MAX_ACTIONS条记录
  if (behavior.actions.length > MAX_ACTIONS) {
    behavior.actions = behavior.actions.slice(-MAX_ACTIONS);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(behavior));
}

// 追踪用户行为
export function trackAction(
  type: UserAction['type'],
  page: string,
  action: string,
  metadata?: Record<string, any>
): void {
  const behavior = getUserBehavior();

  const newAction: UserAction = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    page,
    action,
    timestamp: new Date().toISOString(),
    metadata
  };

  // 更新统计数据
  behavior.totalActions++;
  behavior.pageViews[page] = (behavior.pageViews[page] || 0) + 1;

  if (type === 'feature_use') {
    behavior.featureUsage[action] = (behavior.featureUsage[action] || 0) + 1;
  }

  behavior.lastActive = newAction.timestamp;
  behavior.actions.push(newAction);

  saveBehavior(behavior);
}

// 追踪页面访问
export function trackPageView(page: string): void {
  trackAction('page_view', page, `访问${page}页面`);
}

// 追踪按钮点击
export function trackButtonClick(page: string, buttonName: string): void {
  trackAction('button_click', page, buttonName);
}

// 追踪功能使用
export function trackFeatureUse(feature: string, details?: Record<string, any>): void {
  trackAction('feature_use', feature, `使用${feature}功能`, details);
}

// 获取最常访问的页面
export function getMostVisitedPages(limit: number = 5): Array<{ page: string; count: number }> {
  const behavior = getUserBehavior();
  return Object.entries(behavior.pageViews)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// 获取最常使用的功能
export function getMostUsedFeatures(limit: number = 5): Array<{ feature: string; count: number }> {
  const behavior = getUserBehavior();
  return Object.entries(behavior.featureUsage)
    .map(([feature, count]) => ({ feature, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// 获取活跃时段分析
export function getActivityByHour(): Record<number, number> {
  const behavior = getUserBehavior();
  const hourlyActivity: Record<number, number> = {};

  behavior.actions.forEach(action => {
    const hour = new Date(action.timestamp).getHours();
    hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
  });

  return hourlyActivity;
}

// 获取最近N天的活跃度
export function getRecentActivity(days: number = 7): Array<{ date: string; count: number }> {
  const behavior = getUserBehavior();
  const now = new Date();
  const activityByDate: Record<string, number> = {};

  // 初始化最近N天
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    activityByDate[dateStr] = 0;
  }

  // 统计每天的活动
  behavior.actions.forEach(action => {
    const dateStr = action.timestamp.split('T')[0];
    if (dateStr in activityByDate) {
      activityByDate[dateStr]++;
    }
  });

  return Object.entries(activityByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// 计算用户活跃度评分 (0-100)
export function getUserEngagementScore(): number {
  const behavior = getUserBehavior();

  // 因素权重
  const weights = {
    totalActions: 0.3,
    recentActivity: 0.4,
    featureDiversity: 0.3
  };

  // 总行为数评分 (最多1000分)
  const actionScore = Math.min(behavior.totalActions / 1000 * 100, 100);

  // 最近活跃度评分 (最近7天)
  const recentActivity = getRecentActivity(7);
  const avgRecentActivity = recentActivity.reduce((sum, day) => sum + day.count, 0) / 7;
  const recentScore = Math.min(avgRecentActivity / 10 * 100, 100);

  // 功能多样性评分
  const uniqueFeatures = Object.keys(behavior.featureUsage).length;
  const diversityScore = Math.min(uniqueFeatures / 10 * 100, 100);

  // 综合评分
  return Math.round(
    actionScore * weights.totalActions +
    recentScore * weights.recentActivity +
    diversityScore * weights.featureDiversity
  );
}

// 清除行为数据
export function clearBehaviorData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// 获取行为洞察
export function getBehaviorInsights(): {
  mostActiveHour: number;
  averageSessionLength: number;
  topFeature: string;
  topPage: string;
} {
  const behavior = getUserBehavior();
  const hourlyActivity = getActivityByHour();
  const mostUsedFeatures = getMostUsedFeatures(1);
  const mostVisitedPages = getMostVisitedPages(1);

  // 找到最活跃的时段
  const mostActiveHourStr = Object.entries(hourlyActivity)
    .sort(([, a], [, b]) => b - a)[0]?.[0];
  const mostActiveHour = mostActiveHourStr ? parseInt(mostActiveHourStr) : 12;

  // 计算平均会话时长（分钟）
  const sessionStart = new Date(behavior.sessionStart);
  const lastActive = new Date(behavior.lastActive);
  const sessionLength = (lastActive.getTime() - sessionStart.getTime()) / (1000 * 60);

  return {
    mostActiveHour,
    averageSessionLength: Math.round(sessionLength),
    topFeature: mostUsedFeatures[0]?.feature || '暂无',
    topPage: mostVisitedPages[0]?.page || '暂无'
  };
}
