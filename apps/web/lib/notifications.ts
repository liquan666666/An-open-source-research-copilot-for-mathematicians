// 浏览器通知系统

// 检查浏览器是否支持通知
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

// 获取通知权限状态
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

// 请求通知权限
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

// 发送通知
export function sendNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: '/icon.png', // 可以添加应用图标
      badge: '/badge.png',
      ...options
    });

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}

// 预定义的通知模板
export const NotificationTemplates = {
  // 每日打卡提醒
  dailyCheckIn: () => ({
    title: '📊 每日打卡提醒',
    body: '今天还没打卡哦！记录您的研究进度吧',
    tag: 'daily-checkin',
    requireInteraction: false
  }),

  // 试用期提醒
  trialExpiring: (days: number) => ({
    title: '⏰ 试用期提醒',
    body: `您的试用期还剩${days}天，记得续费哦`,
    tag: 'trial-expiring',
    requireInteraction: true
  }),

  // 新推荐通知
  newRecommendation: (count: number) => ({
    title: '💡 您有新的推荐',
    body: `系统为您生成了${count}条个性化推荐`,
    tag: 'new-recommendation',
    requireInteraction: false
  }),

  // 成就解锁
  achievementUnlocked: (achievement: string) => ({
    title: '🏆 成就解锁！',
    body: `恭喜！您获得了"${achievement}"成就`,
    tag: 'achievement',
    requireInteraction: false
  }),

  // 数据导出提醒
  exportReminder: () => ({
    title: '💾 数据备份提醒',
    body: '建议您定期导出数据以保护研究成果',
    tag: 'export-reminder',
    requireInteraction: false
  }),

  // 论文更新
  paperUpdate: (count: number) => ({
    title: '📚 论文库更新',
    body: `有${count}篇新论文与您的研究兴趣匹配`,
    tag: 'paper-update',
    requireInteraction: false
  })
};

// 通知调度器
export class NotificationScheduler {
  private static timers: Map<string, NodeJS.Timeout> = new Map();

  // 调度每日打卡提醒 (每天晚上8点)
  static scheduleDailyCheckIn(): void {
    const now = new Date();
    const target = new Date();
    target.setHours(20, 0, 0, 0);

    if (now > target) {
      target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();

    const timer = setTimeout(() => {
      sendNotification(
        NotificationTemplates.dailyCheckIn().title,
        NotificationTemplates.dailyCheckIn()
      );
      // 重新调度下一次
      this.scheduleDailyCheckIn();
    }, delay);

    this.timers.set('daily-checkin', timer);
  }

  // 取消调度
  static cancelSchedule(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  // 取消所有调度
  static cancelAll(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}

// 通知偏好设置
interface NotificationPreferences {
  enabled: boolean;
  dailyCheckIn: boolean;
  trialReminder: boolean;
  recommendations: boolean;
  achievements: boolean;
  exportReminder: boolean;
}

const PREFERENCES_KEY = 'mrp_notification_preferences';

// 获取通知偏好
export function getNotificationPreferences(): NotificationPreferences {
  const data = localStorage.getItem(PREFERENCES_KEY);
  if (!data) {
    return {
      enabled: false,
      dailyCheckIn: true,
      trialReminder: true,
      recommendations: true,
      achievements: true,
      exportReminder: true
    };
  }
  return JSON.parse(data);
}

// 保存通知偏好
export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));

  // 根据偏好调整调度
  if (prefs.enabled && prefs.dailyCheckIn) {
    NotificationScheduler.scheduleDailyCheckIn();
  } else {
    NotificationScheduler.cancelSchedule('daily-checkin');
  }
}

// 初始化通知系统
export async function initializeNotifications(): Promise<void> {
  const prefs = getNotificationPreferences();

  if (!prefs.enabled) {
    return;
  }

  const granted = await requestNotificationPermission();

  if (granted && prefs.dailyCheckIn) {
    NotificationScheduler.scheduleDailyCheckIn();
  }
}
