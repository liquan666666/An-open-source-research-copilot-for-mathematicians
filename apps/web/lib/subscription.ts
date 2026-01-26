// 订阅管理工具函数

export interface SubscriptionStatus {
  plan: 'free_trial' | 'monthly' | 'yearly' | 'lifetime';
  startDate: string;
  expiryDate: string | null;
  isActive: boolean;
  daysRemaining: number;
}

const TRIAL_DAYS = 30;
const STORAGE_KEY = 'mrp_subscription';

// 初始化试用期
export function initializeTrial(): void {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const now = new Date();
    const expiry = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

    const subscription = {
      plan: 'free_trial',
      startDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
      isActive: true
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscription));
  }
}

// 获取订阅状态
export function getSubscriptionStatus(): SubscriptionStatus {
  initializeTrial();

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return {
      plan: 'free_trial',
      startDate: new Date().toISOString(),
      expiryDate: null,
      isActive: false,
      daysRemaining: 0
    };
  }

  const subscription = JSON.parse(data);
  const now = new Date();
  const expiry = subscription.expiryDate ? new Date(subscription.expiryDate) : null;

  let daysRemaining = 0;
  let isActive = subscription.isActive;

  if (expiry) {
    const diffTime = expiry.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (subscription.plan === 'free_trial' && daysRemaining <= 0) {
      isActive = false;
    }
  }

  return {
    plan: subscription.plan,
    startDate: subscription.startDate,
    expiryDate: subscription.expiryDate,
    isActive,
    daysRemaining: Math.max(0, daysRemaining)
  };
}

// 检查是否有访问权限
export function hasAccess(): boolean {
  const status = getSubscriptionStatus();

  // 付费用户始终有访问权限
  if (status.plan === 'monthly' || status.plan === 'yearly' || status.plan === 'lifetime') {
    return true;
  }

  // 试用期用户检查天数
  if (status.plan === 'free_trial') {
    return status.daysRemaining > 0;
  }

  return false;
}

// 激活订阅
export function activateSubscription(plan: 'monthly' | 'yearly' | 'lifetime'): void {
  const now = new Date();
  let expiryDate: string | null = null;

  if (plan === 'monthly') {
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    expiryDate = expiry.toISOString();
  } else if (plan === 'yearly') {
    const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    expiryDate = expiry.toISOString();
  } else {
    // lifetime 不设置过期时间
    expiryDate = null;
  }

  const subscription = {
    plan,
    startDate: now.toISOString(),
    expiryDate,
    isActive: true
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscription));
}

// 获取计划名称
export function getPlanName(plan: string): string {
  const names: Record<string, string> = {
    'free_trial': '免费试用',
    'monthly': '月度订阅',
    'yearly': '年度订阅',
    'lifetime': '终身会员'
  };
  return names[plan] || '未知';
}

// 获取计划价格
export function getPlanPrice(plan: string): string {
  const prices: Record<string, string> = {
    'free_trial': '¥0',
    'monthly': '¥29/月',
    'yearly': '¥299/年',
    'lifetime': '¥999/终身'
  };
  return prices[plan] || '未知';
}

// 重置为试用期（仅用于测试）
export function resetToTrial(): void {
  localStorage.removeItem(STORAGE_KEY);
  initializeTrial();
}
