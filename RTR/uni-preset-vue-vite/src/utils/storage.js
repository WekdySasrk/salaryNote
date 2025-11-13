/**
 * 数据存储管理工具
 * 提供统一的数据存储接口，确保数据持久化
 */

class StorageManager {
  constructor() {
    this.keys = {
      USER_SETTINGS: 'userSettings',
      CATEGORIES: 'categories',
      RECORDS: 'records',
      ITEM_STATISTICS: 'itemStatistics',
      EARNINGS_DATA: 'earningsData'
    }
  }

  /**
   * 设置数据
   * @param {string} key 存储键
   * @param {any} data 要存储的数据
   * @returns {boolean} 是否成功
   */
  setItem(key, data) {
    try {
      uni.setStorageSync(key, data)
      return true
    } catch (error) {
      console.error(`存储数据失败 [${key}]:`, error)
      return false
    }
  }

  /**
   * 获取数据
   * @param {string} key 存储键
   * @param {any} defaultValue 默认值
   * @returns {any} 存储的数据或默认值
   */
  getItem(key, defaultValue = null) {
    try {
      const data = uni.getStorageSync(key)
      return data !== '' ? data : defaultValue
    } catch (error) {
      console.error(`获取数据失败 [${key}]:`, error)
      return defaultValue
    }
  }

  /**
   * 删除数据
   * @param {string} key 存储键
   * @returns {boolean} 是否成功
   */
  removeItem(key) {
    try {
      uni.removeStorageSync(key)
      return true
    } catch (error) {
      console.error(`删除数据失败 [${key}]:`, error)
      return false
    }
  }

  /**
   * 清空所有数据
   * @returns {boolean} 是否成功
   */
  clear() {
    try {
      uni.clearStorageSync()
      return true
    } catch (error) {
      console.error('清空数据失败:', error)
      return false
    }
  }

  // 用户设置相关
  getUserSettings() {
    return this.getItem(this.keys.USER_SETTINGS, {
      monthlySalary: 0,
      workDaysPerMonth: 22,
      workHoursPerDay: 8,
      startWorkDate: ''
    })
  }

  setUserSettings(settings) {
    return this.setItem(this.keys.USER_SETTINGS, settings)
  }

  // 分类相关 - 支持二级分类
  getCategories() {
    const defaultCategories = {
      支出: [
        {
          id: 1,
          name: '餐饮',
          icon: '🍔',
          type: '支出',
          isDefault: true,
          children: [
            { id: 11, name: '早餐', icon: '🥐', parentId: 1, type: '支出' },
            { id: 12, name: '午餐', icon: '🍱', parentId: 1, type: '支出' },
            { id: 13, name: '晚餐', icon: '🍽️', parentId: 1, type: '支出' },
            { id: 14, name: '夜宵', icon: '🌙', parentId: 1, type: '支出' },
            { id: 15, name: '饮品', icon: '🥤', parentId: 1, type: '支出' }
          ]
        },
        {
          id: 2,
          name: '交通',
          icon: '🚗',
          type: '支出',
          isDefault: true,
          children: [
            { id: 21, name: '公交', icon: '🚌', parentId: 2, type: '支出' },
            { id: 22, name: '地铁', icon: '🚇', parentId: 2, type: '支出' },
            { id: 23, name: '打车', icon: '🚕', parentId: 2, type: '支出' },
            { id: 24, name: '加油', icon: '⛽', parentId: 2, type: '支出' },
            { id: 25, name: '停车', icon: '🅿️', parentId: 2, type: '支出' }
          ]
        },
        {
          id: 3,
          name: '购物',
          icon: '🛍️',
          type: '支出',
          isDefault: true,
          children: [
            { id: 31, name: '服装', icon: '👕', parentId: 3, type: '支出' },
            { id: 32, name: '数码', icon: '📱', parentId: 3, type: '支出' },
            { id: 33, name: '日用品', icon: '🧴', parentId: 3, type: '支出' },
            { id: 34, name: '食品', icon: '🥫', parentId: 3, type: '支出' }
          ]
        },
        {
          id: 4,
          name: '娱乐',
          icon: '🎬',
          type: '支出',
          isDefault: true,
          children: [
            { id: 41, name: '电影', icon: '🎥', parentId: 4, type: '支出' },
            { id: 42, name: '游戏', icon: '🎮', parentId: 4, type: '支出' },
            { id: 43, name: '旅游', icon: '✈️', parentId: 4, type: '支出' },
            { id: 44, name: '运动', icon: '⚽', parentId: 4, type: '支出' }
          ]
        },
        {
          id: 5,
          name: '医疗',
          icon: '💊',
          type: '支出',
          isDefault: true,
          children: [
            { id: 51, name: '看病', icon: '🏥', parentId: 5, type: '支出' },
            { id: 52, name: '买药', icon: '💉', parentId: 5, type: '支出' },
            { id: 53, name: '体检', icon: '🩺', parentId: 5, type: '支出' }
          ]
        },
        {
          id: 6,
          name: '住房',
          icon: '🏠',
          type: '支出',
          isDefault: true,
          children: [
            { id: 61, name: '房租', icon: '🏘️', parentId: 6, type: '支出' },
            { id: 62, name: '水电', icon: '💡', parentId: 6, type: '支出' },
            { id: 63, name: '网费', icon: '📶', parentId: 6, type: '支出' },
            { id: 64, name: '物业', icon: '🏢', parentId: 6, type: '支出' }
          ]
        }
      ],
      收入: [
        {
          id: 101,
          name: '工资',
          icon: '💰',
          type: '收入',
          isDefault: true,
          children: [
            { id: 1011, name: '基本工资', icon: '💵', parentId: 101, type: '收入' },
            { id: 1012, name: '加班费', icon: '⏰', parentId: 101, type: '收入' },
            { id: 1013, name: '津贴', icon: '💴', parentId: 101, type: '收入' }
          ]
        },
        {
          id: 102,
          name: '奖金',
          icon: '🎁',
          type: '收入',
          isDefault: true,
          children: [
            { id: 1021, name: '年终奖', icon: '🏆', parentId: 102, type: '收入' },
            { id: 1022, name: '绩效奖', icon: '📊', parentId: 102, type: '收入' },
            { id: 1023, name: '项目奖', icon: '🎯', parentId: 102, type: '收入' }
          ]
        },
        {
          id: 103,
          name: '投资',
          icon: '📈',
          type: '收入',
          isDefault: true,
          children: [
            { id: 1031, name: '股票', icon: '📊', parentId: 103, type: '收入' },
            { id: 1032, name: '基金', icon: '💹', parentId: 103, type: '收入' },
            { id: 1033, name: '理财', icon: '🏦', parentId: 103, type: '收入' }
          ]
        },
        {
          id: 104,
          name: '兼职',
          icon: '💼',
          type: '收入',
          isDefault: true,
          children: [
            { id: 1041, name: '外包', icon: '💻', parentId: 104, type: '收入' },
            { id: 1042, name: '咨询', icon: '🤝', parentId: 104, type: '收入' }
          ]
        }
      ]
    }

    return this.getItem(this.keys.CATEGORIES, defaultCategories)
  }

  setCategories(categories) {
    return this.setItem(this.keys.CATEGORIES, categories)
  }

  // 记录相关
  getRecords() {
    return this.getItem(this.keys.RECORDS, [])
  }

  setRecords(records) {
    return this.setItem(this.keys.RECORDS, records)
  }

  addRecord(record) {
    const records = this.getRecords()
    records.unshift(record)
    return this.setRecords(records)
  }

  // 统计相关
  getItemStatistics() {
    return this.getItem(this.keys.ITEM_STATISTICS, {})
  }

  setItemStatistics(statistics) {
    return this.setItem(this.keys.ITEM_STATISTICS, statistics)
  }

  updateItemStatistics(record) {
    const statistics = this.getItemStatistics()
    const key = `${record.category.name}_${record.type}`

    if (!statistics[key]) {
      statistics[key] = {
        name: record.category.name,
        icon: record.category.icon,
        type: record.type,
        count: 0,
        totalAmount: 0
      }
    }

    statistics[key].count += 1
    statistics[key].totalAmount += record.amount

    return this.setItemStatistics(statistics)
  }

  // 收入数据相关
  getEarningsData() {
    return this.getItem(this.keys.EARNINGS_DATA, {
      lastUpdateTime: 0,
      todayEarnings: 0,
      yearEarnings: 0,
      totalEarnings: 0
    })
  }

  setEarningsData(data) {
    return this.setItem(this.keys.EARNINGS_DATA, data)
  }

  /**
   * 计算收入数据
   * @param {object} userSettings 用户设置
   * @returns {object} 收入数据
   */
  calculateEarnings(userSettings) {
    if (!userSettings.monthlySalary || !userSettings.startWorkDate || !userSettings.workStartTime || !userSettings.workEndTime) {
      return {
        perSecondEarning: 0,
        todayEarnings: 0,
        yearEarnings: 0,
        totalEarnings: 0
      }
    }

    // 计算每秒收入
    const monthlySeconds = userSettings.workDaysPerMonth * userSettings.workHoursPerDay * 3600
    const perSecondEarning = userSettings.monthlySalary / monthlySeconds

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const workStartHour = userSettings.workStartTime // 假设9点开始工作
    const workEndHour = userSettings.workEndTime // 假设17点结束工作

    // 计算今日收入
    let todayWorkSeconds = 0
    if (now.getHours() >= workStartHour && now.getHours() < workEndHour) {
      const workStart = new Date(todayStart.getTime() + workStartHour * 3600000)
      todayWorkSeconds = Math.max(0, (now - workStart) / 1000)
    } else if (now.getHours() >= workEndHour) {
      todayWorkSeconds = userSettings.workHoursPerDay * 3600
    }

    const todayEarnings = todayWorkSeconds * perSecondEarning

    // 计算今年收入
    const yearStart = new Date(now.getFullYear(), 0, 1)
    const workDaysThisYear = this.calculateWorkDays(yearStart, now, userSettings.workDaysPerMonth)
    const yearEarnings = workDaysThisYear * (userSettings.monthlySalary / userSettings.workDaysPerMonth)

    // 计算总收入
    const startWork = new Date(userSettings.startWorkDate)
    const totalWorkDays = this.calculateWorkDays(startWork, now, userSettings.workDaysPerMonth)
    const totalEarnings = totalWorkDays * (userSettings.monthlySalary / userSettings.workDaysPerMonth)

    return {
      perSecondEarning: perSecondEarning.toFixed(4),
      todayEarnings,
      yearEarnings,
      totalEarnings
    }
  }

  /**
   * 计算工作天数
   * @param {Date} startDate 开始日期
   * @param {Date} endDate 结束日期
   * @param {number} workDaysPerMonth 每月工作天数
   * @returns {number} 工作天数
   */
  calculateWorkDays(startDate, endDate, workDaysPerMonth) {
    const oneDay = 24 * 60 * 60 * 1000
    const diffDays = Math.round((endDate - startDate) / oneDay)
    // 简化计算，假设每月工作天数固定
    return Math.max(0, diffDays * (workDaysPerMonth / 30))
  }

  /**
   * 导出数据
   * @returns {object} 所有数据
   */
  exportData() {
    return {
      userSettings: this.getUserSettings(),
      categories: this.getCategories(),
      records: this.getRecords(),
      itemStatistics: this.getItemStatistics(),
      earningsData: this.getEarningsData(),
      exportTime: new Date().toISOString()
    }
  }

  /**
   * 导入数据
   * @param {object} data 要导入的数据
   * @returns {boolean} 是否成功
   */
  importData(data) {
    try {
      if (data.userSettings) this.setUserSettings(data.userSettings)
      if (data.categories) this.setCategories(data.categories)
      if (data.records) this.setRecords(data.records)
      if (data.itemStatistics) this.setItemStatistics(data.itemStatistics)
      if (data.earningsData) this.setEarningsData(data.earningsData)
      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      return false
    }
  }

  /**
   * 获取存储信息
   * @returns {object} 存储信息
   */
  getStorageInfo() {
    try {
      return uni.getStorageInfoSync()
    } catch (error) {
      console.error('获取存储信息失败:', error)
      return {
        keys: [],
        currentSize: 0,
        limitSize: 0
      }
    }
  }
}

// 创建单例实例
const storageManager = new StorageManager()

export default storageManager
