<template>
  <view class="container">
    <!-- 收入设置卡片 -->
    <view class="income-card" v-if="!userSettings.monthlySalary">
      <view class="card-header">
        <text class="card-title">💰 设置您的收入信息</text>
      </view>
      <view class="form-group">
        <text class="label">月薪 (元)</text>
        <input
          class="input"
          type="number"
          v-model="tempSettings.monthlySalary"
          placeholder="请输入月薪"
        />
      </view>
      <view class="form-group">
        <text class="label">每月工作天数</text>
        <input
          class="input"
          type="number"
          v-model="tempSettings.workDaysPerMonth"
          placeholder="例如：22"
        />
      </view>
      <view class="form-group">
        <text class="label">每日工作小时</text>
        <input
          class="input"
          type="number"
          v-model="tempSettings.workHoursPerDay"
          placeholder="例如：8"
        />
      </view>
      <view class="form-group">
        <text class="label">工作开始时间</text>
        <input
          class="input"
          type="number"
          v-model="tempSettings.workStartTime"
          placeholder="例如：9"
        />
      </view>
      <view class="form-group">
        <text class="label">工作结束时间</text>
        <input
          class="input"
          type="number"
          v-model="tempSettings.workEndTime"
          placeholder="例如：18"
        />
      </view>
      <view class="form-group">
        <text class="label">开始工作日期</text>
        <picker mode="date" :value="tempSettings.startWorkDate" @change="onDateChange">
          <view class="picker">
            {{ tempSettings.startWorkDate || '选择开始工作日期' }}
          </view>
        </picker>
        </view>

        <!-- 休息日设置 -->
        <view class="form-group">
          <text class="label">休息日设置</text>
          <radio-group @change="onRestTypeChange">
            <label class="radio-item">
              <radio
                value="double"
                :checked="tempSettings.restType === 'double'"
                color="#6B7280"
              />
              <text class="radio-text">双休（周六周日）</text>
            </label>
            <label class="radio-item">
              <radio
                value="single"
                :checked="tempSettings.restType === 'single'"
                color="#6B7280"
              />
              <text class="radio-text">单休</text>
            </label>
          </radio-group>
        </view>

        <!-- 单休日选择 -->
        <view v-if="tempSettings.restType === 'single'" class="form-group">
          <text class="label">单休日选择</text>
          <radio-group @change="onSingleRestDayChange">
            <label class="radio-item">
              <radio
                value="sunday"
                :checked="tempSettings.singleRestDay === 'sunday'"
                color="#6B7280"
              />
              <text class="radio-text">周日休息</text>
            </label>
            <label class="radio-item">
              <radio
                value="saturday"
                :checked="tempSettings.singleRestDay === 'saturday'"
                color="#6B7280"
              />
              <text class="radio-text">周六休息</text>
            </label>
          </radio-group>
        </view>

        <button class="save-btn" @click="saveSettings">保存设置</button>
    </view>

    <!-- 实时收入显示 -->
    <view class="earnings-section" v-if="userSettings.monthlySalary">
      <view class="earnings-card main-card" @click="showTodayEarningsOptions">
        <view class="earnings-header">
          <text class="earnings-title">💸 实时收入</text>
          <text class="per-second">每秒赚 ¥{{ perSecondEarning }}</text>
        </view>
        <view class="today-earnings">
          <text class="amount">¥{{ todayEarnings.toFixed(2) }}</text>
          <text class="label">今日已赚</text>
        </view>
        <view class="time-info">
          <text class="time">{{ currentTime }}</text>
        </view>
      </view>

      <!-- 统计卡片 -->
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-amount">¥{{ yearEarnings.toFixed(2) }}</text>
          <text class="stat-label">今年总收入</text>
        </view>
        <view class="stat-card">
          <text class="stat-amount">¥{{ totalEarnings.toFixed(2) }}</text>
          <text class="stat-label">累计总收入</text>
        </view>
      </view>

      <!-- 设置按钮 -->
      <view class="settings-btn" @click="showSettings = true">
        <text>⚙️ 修改设置</text>
      </view>
    </view>

    <!-- 目标和预算设置 -->
    <view class="targets-card" v-if="userSettings.monthlySalary">
      <view class="section-title">
        <text>🎯 目标与预算</text>
        <text class="edit-btn" @tap="showTargetSettings = !showTargetSettings">
          {{ showTargetSettings ? '完成' : '设置' }}
        </text>
      </view>

      <view v-if="!showTargetSettings" class="targets-display">
        <view class="target-grid">
          <view class="target-item" @tap="editTarget('monthlyTarget')">
            <text class="target-label">月收入目标</text>
            <text class="target-amount">¥{{ targets.monthlyTarget.toLocaleString() }}</text>
          </view>
          <view class="target-item" @tap="editTarget('yearlyTarget')">
            <text class="target-label">年收入目标</text>
            <text class="target-amount">¥{{ targets.yearlyTarget.toLocaleString() }}</text>
          </view>
          <view class="target-item" @tap="editTarget('monthlyBudget')">
            <text class="target-label">月支出预算</text>
            <text class="target-amount">¥{{ targets.monthlyBudget.toLocaleString() }}</text>
          </view>
          <view class="target-item" @tap="editTarget('yearlyBudget')">
            <text class="target-label">年支出预算</text>
            <text class="target-amount">¥{{ targets.yearlyBudget.toLocaleString() }}</text>
          </view>
        </view>
      </view>

      <view v-if="showTargetSettings" class="targets-form">
        <view class="form-group">
          <text class="label">月收入目标 (元)</text>
          <input class="input" type="number" v-model="tempTargets.monthlyTarget" placeholder="请输入月收入目标">
        </view>
        <view class="form-group">
          <text class="label">年收入目标 (元)</text>
          <input class="input" type="number" v-model="tempTargets.yearlyTarget" placeholder="请输入年收入目标">
        </view>
        <view class="form-group">
          <text class="label">月支出预算 (元)</text>
          <input class="input" type="number" v-model="tempTargets.monthlyBudget" placeholder="请输入月支出预算">
        </view>
        <view class="form-group">
          <text class="label">年支出预算 (元)</text>
          <input class="input" type="number" v-model="tempTargets.yearlyBudget" placeholder="请输入年支出预算">
        </view>
        <button class="save-btn" @click="saveTargets">保存目标设置</button>
      </view>
    </view>

    <!-- 快捷记账 -->
    <view class="quick-actions" v-if="userSettings.monthlySalary">
      <view class="section-title">
        <text>📝 快捷记账</text>
      </view>
      <view class="action-grid">
        <view class="action-item" @tap="quickRecord('支出')">
          <text class="action-icon">💸</text>
          <text class="action-text">支出</text>
        </view>
        <view class="action-item" @tap="quickRecord('收入')">
          <text class="action-icon">💰</text>
          <text class="action-text">收入</text>
        </view>
        <view class="action-item" @tap="goToStatistics">
          <text class="action-icon">📊</text>
          <text class="action-text">统计</text>
        </view>
        <view class="action-item" @tap="goToAnalysis">
          <text class="action-icon">🤖</text>
          <text class="action-text">AI分析</text>
        </view>
      </view>
    </view>

    <!-- 设置弹窗 -->
    <view class="modal" v-if="showSettings" @click="showSettings = false">
      <view class="modal-content settings-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">修改设置</text>
          <text class="close-btn" @click="showSettings = false">✕</text>
        </view>
        <scroll-view class="settings-scroll" scroll-y="true">
        <view class="form-group">
          <text class="label">月薪 (元)</text>
          <input
            class="input"
            type="number"
            v-model="tempSettings.monthlySalary"
          />
        </view>
        <view class="form-group">
          <text class="label">每月工作天数</text>
          <input
            class="input"
            type="number"
            v-model="tempSettings.workDaysPerMonth"
          />
        </view>
        <view class="form-group">
          <text class="label">每日工作小时</text>
          <input
            class="input"
            type="number"
            v-model="tempSettings.workHoursPerDay"
          />
        </view>
        <view class="form-group">
          <text class="label">工作开始时间</text>
          <input
            class="input"
            type="number"
            v-model="tempSettings.workStartTime"
          />
        </view>
        <view class="form-group">
          <text class="label">工作结束时间</text>
          <input
            class="input"
            type="number"
            v-model="tempSettings.workEndTime"
          />
        </view>

        <view class="form-group">
          <text class="label">开始工作日期</text>
          <picker mode="date" :value="tempSettings.startWorkDate" @change="onSettingsDateChange">
            <view class="picker">
              {{ tempSettings.startWorkDate || '选择开始工作日期' }}
            </view>
          </picker>
        </view>

        <!-- 休息日设置 -->
        <view class="form-group">
          <text class="label">休息日设置</text>
          <radio-group @change="onRestTypeChange">
            <label class="radio-item">
              <radio
                value="double"
                :checked="tempSettings.restType === 'double'"
                color="#6B7280"
              />
              <text class="radio-text">双休（周六周日）</text>
            </label>
            <label class="radio-item">
              <radio
                value="single"
                :checked="tempSettings.restType === 'single'"
                color="#6B7280"
              />
              <text class="radio-text">单休</text>
            </label>
          </radio-group>
        </view>

        <!-- 单休日选择 -->
        <view v-if="tempSettings.restType === 'single'" class="form-group">
          <text class="label">单休日选择</text>
          <radio-group @change="onSingleRestDayChange">
            <label class="radio-item">
              <radio
                value="sunday"
                :checked="tempSettings.singleRestDay === 'sunday'"
                color="#6B7280"
              />
              <text class="radio-text">周日休息</text>
            </label>
            <label class="radio-item">
              <radio
                value="saturday"
                :checked="tempSettings.singleRestDay === 'saturday'"
                color="#6B7280"
              />
              <text class="radio-text">周六休息</text>
            </label>
          </radio-group>
        </view>

        <button class="save-btn" @click="updateSettings">更新设置</button>
        <button class="reset-btn" @click="resetEarnings">重置收入数据</button>
        </scroll-view>
      </view>
    </view>

    <!-- 目标输入弹窗 -->
    <view class="modal" v-if="showTargetInputModal" @click="showTargetInputModal = false">
      <view class="modal-content target-input-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ currentTargetName }}</text>
          <text class="close-btn" @click="showTargetInputModal = false">✕</text>
        </view>

        <!-- 输入显示区域 -->
        <view class="input-display">
          <text class="input-label">请输入金额</text>
          <view class="amount-display">
            <text class="currency">¥</text>
            <text class="amount-text">{{ targetInputValue || '0' }}</text>
          </view>
        </view>

        <!-- 数字键盘 -->
        <view class="number-keyboard">
          <view class="keyboard-row">
            <view class="key" @click="inputTargetNumber('1')">1</view>
            <view class="key" @click="inputTargetNumber('2')">2</view>
            <view class="key" @click="inputTargetNumber('3')">3</view>
          </view>
          <view class="keyboard-row">
            <view class="key" @click="inputTargetNumber('4')">4</view>
            <view class="key" @click="inputTargetNumber('5')">5</view>
            <view class="key" @click="inputTargetNumber('6')">6</view>
          </view>
          <view class="keyboard-row">
            <view class="key" @click="inputTargetNumber('7')">7</view>
            <view class="key" @click="inputTargetNumber('8')">8</view>
            <view class="key" @click="inputTargetNumber('9')">9</view>
          </view>
          <view class="keyboard-row">
            <view class="key" @click="inputTargetNumber('.')">.</view>
            <view class="key" @click="inputTargetNumber('0')">0</view>
            <view class="key delete-key" @click="deleteTargetNumber">
              <text class="delete-icon">⌫</text>
            </view>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-buttons">
          <button class="cancel-btn" @click="showTargetInputModal = false">取消</button>
          <button class="confirm-btn" @click="saveTargetValue">确定</button>
        </view>
      </view>
    </view>

    <!-- 重置今日收入弹窗 -->
    <view class="modal reset-modal" v-if="showResetModal" @click="showResetModal = false">
      <view class="modal-content reset-modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">确认重置</text>
        </view>

        <view class="modal-body">
          <view class="warning-icon">⚠️</view>
          <text class="warning-text">确定要重置今日收入吗？(根据当前设置的月薪重置)</text>
          <text class="warning-subtitle">此操作不可恢复</text>
        </view>

        <view class="modal-actions">
          <button class="cancel-btn" @click="showResetModal = false">取消</button>
          <button class="confirm-btn" @click="confirmResetTodayEarnings">确定</button>
        </view>
      </view>
    </view>

    <!-- 今日收入选项弹窗 -->
    <view class="modal options-modal" v-if="showTodayOptionsModal" @click="showTodayOptionsModal = false">
      <view class="options-content" @click.stop>
        <view class="option-item" @click="selectTodayOption('reset')">
          <text class="option-text">重置今日收入</text>
        </view>
        <view class="option-divider"></view>
        <view class="option-item cancel-option" @click="showTodayOptionsModal = false">
          <text class="option-text">取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userSettings: {
        monthlySalary: 0,
        workDaysPerMonth: 22,
        workHoursPerDay: 8,
        startWorkDate: '',
        workStartTime: 9,
        workEndTime: 18,
        restType: 'double', // 'double' 双休, 'single' 单休
        singleRestDay: 'sunday' // 'sunday' 周日休, 'saturday' 周六休
      },
      targets: {
        monthlyTarget: 0,
        yearlyTarget: 0,
        monthlyBudget: 0,
        yearlyBudget: 0
      },
      tempSettings: {
        monthlySalary: '',
        workDaysPerMonth: 22,
        workHoursPerDay: 8,
        startWorkDate: '',
        workStartTime: 9,
        workEndTime: 18,
        restType: 'double',
        singleRestDay: 'sunday'
      },
      tempTargets: {
        monthlyTarget: '',
        yearlyTarget: '',
        monthlyBudget: '',
        yearlyBudget: ''
      },
      showSettings: false,
      showTargetSettings: false,
      showTargetInputModal: false,
      showResetModal: false,
      showTodayOptionsModal: false,
      currentTargetType: '',
      currentTargetName: '',
      targetInputValue: '',
      currentTime: '',
      todayEarnings: 0,
      yearEarnings: 0,
      totalEarnings: 0,
      timer: null,
      perSecondEarning: 0
    }
  },
  onLoad() {
    this.loadUserSettings()
    this.updateTime()
    this.startTimer()
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    loadUserSettings() {
      try {
        const settings = uni.getStorageSync('userSettings')
        if (settings) {
          this.userSettings = settings
          this.tempSettings = { ...settings }
          this.calculateEarnings()
        }

        // 加载目标设置
        const targets = uni.getStorageSync('targets')
        if (targets) {
          this.targets = targets
          this.tempTargets = { ...targets }
        }

        // 加载历史收入数据
        this.loadEarningsData()

        // 立即重新计算所有收入
        if (this.userSettings.monthlySalary && this.userSettings.startWorkDate) {
          this.recalculateAllEarnings(new Date())
        }
      } catch (e) {
        console.error('加载设置失败:', e)
      }
    },

    loadEarningsData() {
      try {
        // 初始化收入数据为0
        this.todayEarnings = 0
        this.yearEarnings = 0
        this.totalEarnings = 0

        // 如果有用户设置，立即重新计算所有收入
        if (this.userSettings.monthlySalary && this.userSettings.startWorkDate) {
          this.recalculateAllEarnings(new Date())
        }
      } catch (e) {
        console.error('加载收入数据失败:', e)
        // 出错时初始化为0
        this.todayEarnings = 0
        this.yearEarnings = 0
        this.totalEarnings = 0
      }
    },

    saveSettings() {
      if (!this.tempSettings.monthlySalary || !this.tempSettings.startWorkDate) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }

      this.userSettings = { ...this.tempSettings }
      uni.setStorageSync('userSettings', this.userSettings)
      this.calculateEarnings()

      uni.showToast({
        title: '设置保存成功',
        icon: 'success'
      })
    },

    updateSettings() {
      this.userSettings = { ...this.tempSettings }
      uni.setStorageSync('userSettings', this.userSettings)

      // 重新计算收入，包括当日已工作时间的收入
      this.calculateEarnings()

      // 重新计算当日已工作时间的收入
      const todayEarned = this.calculateTodayEarnings()

      // 更新今日收入为重新计算的值
      this.todayEarnings = todayEarned

      // 更新年收入和累计收入（如果今天是第一天工作）
      const earningsData = uni.getStorageSync('earningsData')
      if (!earningsData) {
        this.yearEarnings = todayEarned
        this.totalEarnings = todayEarned
      }

      // 保存更新后的数据
      const newEarningsData = {
        lastUpdateTime: new Date().getTime(),
        todayEarnings: this.todayEarnings,
        yearEarnings: this.yearEarnings,
        totalEarnings: this.totalEarnings
      }
      uni.setStorageSync('earningsData', newEarningsData)

      this.showSettings = false

      uni.showToast({
        title: '设置更新成功',
        icon: 'success'
      })
    },

    onDateChange(e) {
      this.tempSettings.startWorkDate = e.detail.value
    },

    onSettingsDateChange(e) {
      this.tempSettings.startWorkDate = e.detail.value
    },

    onRestTypeChange(e) {
      this.tempSettings.restType = e.detail.value
    },

    onSingleRestDayChange(e) {
      this.tempSettings.singleRestDay = e.detail.value
    },

    calculateEarnings() {
      if (!this.userSettings.monthlySalary) return

      // 计算每秒收入
      const monthlySeconds = this.userSettings.workDaysPerMonth * this.userSettings.workHoursPerDay * 3600
      this.perSecondEarning = (this.userSettings.monthlySalary / monthlySeconds).toFixed(4)

      // 计算今日收入（只在没有本地存储数据时重新计算）
      const now = new Date()
      const earningsData = uni.getStorageSync('earningsData')

      if (!earningsData) {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const workStartHour = this.userSettings.workStartTime || 9
        const workEndHour = this.userSettings.workEndTime || 18

        let todayWorkSeconds = 0

        // 检查今天是否为工作日
        if (this.isWorkDay(now)) {
          if (now.getHours() >= workStartHour && now.getHours() < workEndHour) {
            const workStart = new Date(todayStart.getTime() + workStartHour * 3600000)
            todayWorkSeconds = Math.max(0, (now - workStart) / 1000)
          } else if (now.getHours() >= workEndHour) {
            todayWorkSeconds = this.userSettings.workHoursPerDay * 3600
          }
        }

        this.todayEarnings = todayWorkSeconds * this.perSecondEarning
      }

      // 计算今年收入
      // 注意：只在初始化时计算，如果本地存储中没有数据才计算
      if (!earningsData && this.yearEarnings === 0) {
        // 计算从今年开始或开始工作日期（取较晚的日期）到现在的工作天数
        const yearStart = new Date(now.getFullYear(), 0, 1)
        const startWork = new Date(this.userSettings.startWorkDate)
        const actualStart = startWork > yearStart ? startWork : yearStart

        const workDaysThisYear = this.calculateWorkDays(actualStart, now)
        const dailySalary = this.userSettings.monthlySalary / this.userSettings.workDaysPerMonth
        this.yearEarnings = workDaysThisYear * dailySalary
      }

      // 计算总收入（按日工资累加）
      // 注意：只在初始化时计算，如果本地存储中没有数据才计算
      if (!earningsData && this.totalEarnings === 0) {
        const startWork = new Date(this.userSettings.startWorkDate)
        const totalWorkDays = this.calculateWorkDays(startWork, now)
        const dailySalary = this.userSettings.monthlySalary / this.userSettings.workDaysPerMonth
        this.totalEarnings = totalWorkDays * dailySalary
      }

      // 调试信息（可在开发时查看）
      if (this.userSettings.startWorkDate) {
        const startWork = new Date(this.userSettings.startWorkDate)
        const totalWorkDays = this.calculateWorkDays(startWork, now)
        const dailySalary = this.userSettings.monthlySalary / this.userSettings.workDaysPerMonth

        console.log('收入计算详情:', {
          开始工作日期: this.userSettings.startWorkDate,
          总工作天数: totalWorkDays,
          日工资: dailySalary.toFixed(2),
          累计总收入: this.totalEarnings.toFixed(2),
          休息日类型: this.userSettings.restType,
          单休日: this.userSettings.singleRestDay
        })
      }
    },

    calculateWorkDays(startDate, endDate) {
      if (!startDate || !endDate) return 0

      let workDays = 0
      const currentDate = new Date(startDate)
      const end = new Date(endDate)

      // 确保开始日期不晚于结束日期
      if (currentDate > end) return 0

      // 逐日检查是否为工作日
      while (currentDate <= end) {
        if (this.isWorkDay(currentDate)) {
          workDays++
        }
        // 移动到下一天
        currentDate.setDate(currentDate.getDate() + 1)
      }

      return workDays
    },

    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleTimeString('zh-CN')
    },

    startTimer() {
      this.timer = setInterval(() => {
        this.updateTime()
        this.updateRealTimeEarnings()
      }, 1000)
    },

    updateRealTimeEarnings() {
      if (!this.userSettings.monthlySalary) return

      const now = new Date()

      // 重新计算所有收入数据，确保准确性
      this.recalculateAllEarnings(now)

      // 保存当前时间作为下次计算的基准
      const earningsData = {
        lastUpdateTime: now.getTime(),
        todayEarnings: this.todayEarnings,
        yearEarnings: this.yearEarnings,
        totalEarnings: this.totalEarnings
      }
      uni.setStorageSync('earningsData', earningsData)
    },


    // 判断是否为工作日
    isWorkDay(date) {
      const dayOfWeek = date.getDay() // 0=周日, 1=周一, ..., 6=周六

      // 如果是双休（默认）
      if (this.userSettings.restType === 'double' || !this.userSettings.restType) {
        return dayOfWeek !== 0 && dayOfWeek !== 6 // 周一到周五
      }

      // 如果是单休
      if (this.userSettings.restType === 'single') {
        if (this.userSettings.singleRestDay === 'sunday') {
          return dayOfWeek !== 0 // 除了周日都工作
        } else if (this.userSettings.singleRestDay === 'saturday') {
          return dayOfWeek !== 6 // 除了周六都工作
        }
      }

      return true // 默认都是工作日
    },

    // 计算当日已工作时间的收入
    calculateTodayEarnings() {
      if (!this.userSettings.monthlySalary) return 0

      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const workStartHour = this.userSettings.workStartTime || 9
      const workEndHour = this.userSettings.workEndTime || 18

      let todayWorkSeconds = 0

      // 检查今天是否为工作日
      if (this.isWorkDay(now)) {
        if (now.getHours() >= workStartHour && now.getHours() < workEndHour) {
          // 当前在工作时间内，计算从工作开始到现在的时间
          const workStart = new Date(todayStart.getTime() + workStartHour * 3600000)
          todayWorkSeconds = Math.max(0, (now - workStart) / 1000)
        } else if (now.getHours() >= workEndHour) {
          // 已经下班，计算整个工作日的时间
          todayWorkSeconds = this.userSettings.workHoursPerDay * 3600
        }
        // 如果还没到上班时间，todayWorkSeconds 保持为 0
      }

      const perSecondEarning = parseFloat(this.perSecondEarning)
      return todayWorkSeconds * perSecondEarning
    },

    // 重新计算所有收入数据（不使用累加，而是重新计算）
    recalculateAllEarnings(currentTime) {
      if (!this.userSettings.monthlySalary || !this.userSettings.startWorkDate) return

      const now = new Date(currentTime)
      const startWorkDate = new Date(this.userSettings.startWorkDate)

      // 1. 计算今日收入
      this.todayEarnings = this.calculateTodayEarningsAtTime(now)

      // 2. 计算今年收入
      const yearStart = new Date(now.getFullYear(), 0, 1)
      const actualYearStart = startWorkDate > yearStart ? startWorkDate : yearStart
      this.yearEarnings = this.calculateEarningsBetweenDates(actualYearStart, now)

      // 3. 计算累计总收入
      this.totalEarnings = this.calculateEarningsBetweenDates(startWorkDate, now)
    },

    // 计算指定时间的今日收入
    calculateTodayEarningsAtTime(time) {
      if (!this.userSettings.monthlySalary) return 0

      const todayStart = new Date(time.getFullYear(), time.getMonth(), time.getDate())
      const workStartHour = this.userSettings.workStartTime || 9
      const workEndHour = this.userSettings.workEndTime || 18

      let todayWorkSeconds = 0

      // 检查今天是否为工作日
      if (this.isWorkDay(time)) {
        if (time.getHours() >= workStartHour && time.getHours() < workEndHour) {
          // 当前在工作时间内
          const workStart = new Date(todayStart.getTime() + workStartHour * 3600000)
          todayWorkSeconds = Math.max(0, (time - workStart) / 1000)
        } else if (time.getHours() >= workEndHour) {
          // 已经下班
          todayWorkSeconds = this.userSettings.workHoursPerDay * 3600
        }
      }

      const perSecondEarning = parseFloat(this.perSecondEarning)
      return todayWorkSeconds * perSecondEarning
    },

    // 计算两个日期之间的总收入
    calculateEarningsBetweenDates(startDate, endDate) {
      if (!startDate || !endDate || startDate > endDate) return 0

      let totalEarnings = 0
      const currentDate = new Date(startDate)
      const end = new Date(endDate)
      const perSecondEarning = parseFloat(this.perSecondEarning)

      // 逐日计算收入
      while (currentDate <= end) {
        const isToday = currentDate.toDateString() === end.toDateString()

        if (this.isWorkDay(currentDate)) {
          if (isToday) {
            // 如果是今天，计算到当前时间的收入
            totalEarnings += this.calculateTodayEarningsAtTime(end)
          } else {
            // 如果是过去的日期，计算整天的收入
            totalEarnings += this.userSettings.workHoursPerDay * 3600 * perSecondEarning
          }
        }

        // 移动到下一天
        currentDate.setDate(currentDate.getDate() + 1)
      }

      return totalEarnings
    },

    // 显示今日收入选项
    showTodayEarningsOptions() {
      this.showTodayOptionsModal = true
    },

    // 选择今日收入选项
    selectTodayOption(option) {
      this.showTodayOptionsModal = false
      if (option === 'reset') {
        this.resetTodayEarnings()
      }
    },

    // 重置今日收入
    resetTodayEarnings() {
      this.showResetModal = true
    },

    // 确认重置今日收入
    confirmResetTodayEarnings() {
      // 重置今日收入为0
      this.todayEarnings = 0

      // 保存更新后的数据
      const earningsData = {
        lastUpdateTime: new Date().getTime(),
        todayEarnings: this.todayEarnings,
        yearEarnings: this.yearEarnings,
        totalEarnings: this.totalEarnings
      }
      uni.setStorageSync('earningsData', earningsData)

      // 关闭弹窗
      this.showResetModal = false

      uni.showToast({
        title: '今日收入已重置',
        icon: 'success'
      })
    },

    quickRecord(type) {
      console.log('快捷记账点击:', type)
      uni.switchTab({
        url: '/pages/record/record'
      })
    },

    goToStatistics() {
      uni.switchTab({
        url: '/pages/statistics/statistics'
      })
    },

    editTarget(targetType) {
      const targetNames = {
        monthlyTarget: '月收入目标',
        yearlyTarget: '年收入目标',
        monthlyBudget: '月支出预算',
        yearlyBudget: '年支出预算'
      }

      this.currentTargetType = targetType
      this.currentTargetName = targetNames[targetType]
      this.targetInputValue = (this.targets[targetType] || 0).toString()
      this.showTargetInputModal = true
    },


    saveTargets() {
      this.targets = {
        monthlyTarget: parseFloat(this.tempTargets.monthlyTarget) || 0,
        yearlyTarget: parseFloat(this.tempTargets.yearlyTarget) || 0,
        monthlyBudget: parseFloat(this.tempTargets.monthlyBudget) || 0,
        yearlyBudget: parseFloat(this.tempTargets.yearlyBudget) || 0
      }
      uni.setStorageSync('targets', this.targets)
      this.showTargetSettings = false

      uni.showToast({
        title: '目标设置保存成功',
        icon: 'success'
      })
    },

    goToAnalysis() {
      uni.switchTab({
        url: '/pages/analysis/analysis'
      })
    },

    resetEarnings() {
      console.log('重置方法被调用')
      uni.showModal({
        title: '确认重置',
        content: '确定要重置累计总收入和今年已赚吗？此操作不可恢复。',
        success: (res) => {
          if (res.confirm) {
            // 重新计算当日已工作时间的收入
            const todayEarned = this.calculateTodayEarnings()

            // 重置收入数据，但保留当日已工作的收入
            this.todayEarnings = todayEarned
            this.yearEarnings = todayEarned  // 今年收入从当日开始
            this.totalEarnings = todayEarned // 累计收入从当日开始

            // 清除本地存储的收入数据
            uni.removeStorageSync('earningsData')

            // 保存重置后的数据到本地存储
            const earningsData = {
              lastUpdateTime: new Date().getTime(),
              todayEarnings: this.todayEarnings,
              yearEarnings: this.yearEarnings,
              totalEarnings: this.totalEarnings
            }
            uni.setStorageSync('earningsData', earningsData)

            uni.showToast({
              title: '重置成功',
              icon: 'success'
            })
          }
        }
      })
    },

    // 目标输入相关方法
    inputTargetNumber(num) {
      if (this.targetInputValue === '0') {
        this.targetInputValue = num
      } else {
        this.targetInputValue += num
      }
    },

    deleteTargetNumber() {
      if (this.targetInputValue.length > 1) {
        this.targetInputValue = this.targetInputValue.slice(0, -1)
      } else {
        this.targetInputValue = '0'
      }
    },

    saveTargetValue() {
      const newValue = parseFloat(this.targetInputValue) || 0
      this.targets[this.currentTargetType] = newValue
      this.tempTargets[this.currentTargetType] = newValue
      uni.setStorageSync('targets', this.targets)

      this.showTargetInputModal = false

      uni.showToast({
        title: '设置成功',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.container {
  padding: 24rpx;
  background: #F9FAFB;
  min-height: 100vh;
}

.income-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.1), 0 1rpx 2rpx rgba(0,0,0,0.06);
  border: 1rpx solid #E5E7EB;
}

.card-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
}

.form-group {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #6B7280;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 88rpx;
  border: 1rpx solid #E5E7EB;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  background: #FFFFFF;
  color: #1F2937;
  transition: all 0.3s;
}

.input:focus {
  border-color: #6B7280;
  box-shadow: 0 0 0 3rpx rgba(107, 114, 128, 0.1);
  outline: none;
}

.picker {
  height: 88rpx;
  line-height: 88rpx;
  border: 1rpx solid #E5E7EB;
  border-radius: 16rpx;
  padding: 0 24rpx;
  background: #FFFFFF;
  color: #1F2937;
  transition: all 0.3s;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: #6B7280;
  color: white;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.1), 0 1rpx 2rpx rgba(0,0,0,0.06);
}

.save-btn:active {
  transform: translateY(1rpx);
  box-shadow: 0 1rpx 2rpx rgba(0,0,0,0.1);
}

.earnings-section {
  margin-bottom: 30rpx;
}

.earnings-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.1), 0 1rpx 2rpx rgba(0,0,0,0.06);
  border: 1rpx solid #E5E7EB;
}

.main-card {
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
  color: #1F2937;
  border: 1rpx solid #A7F3D0;
  cursor: pointer;
  transition: all 0.3s;
}

.main-card:active {
  transform: translateY(2rpx);
  box-shadow: 0 1rpx 2rpx rgba(0,0,0,0.1);
}

.earnings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.earnings-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #10B981;
}

.per-second {
  font-size: 24rpx;
  color: #6B7280;
}

.today-earnings {
  text-align: center;
  margin-bottom: 20rpx;
}

.amount {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
  color: #10B981;
}

.today-earnings .label {
  font-size: 26rpx;
  color: #6B7280;
}

.time-info {
  text-align: center;
}

.time {
  font-size: 28rpx;
  font-weight: 500;
  color: #6B7280;
}

.stats-grid {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.stat-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.1), 0 1rpx 2rpx rgba(0,0,0,0.06);
  border: 1rpx solid #E5E7EB;
}

.stat-amount {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #10B981;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #6B7280;
}

.settings-btn {
  background: rgb(255, 255, 255);
  border-radius: 20rpx;
  padding: 32rpx;
  text-align: center;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.1), 0 1rpx 2rpx rgba(0,0,0,0.06);
  border: 2rpx solid #E5E7EB;
}

.settings-btn text {
  color: rgb(214, 205, 34);
  font-size: 28rpx;
}

.targets-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.1), 0 1rpx 2rpx rgba(0,0,0,0.06);
  border: 1rpx solid #E5E7EB;
}

.edit-btn {
  color: #6B7280;
  font-size: 26rpx;
  font-weight: 500;
}

.targets-display {
  margin-top: 16rpx;
}

.target-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.target-item {
  background: #F9FAFB;
  border-radius: 12rpx;
  padding: 16rpx;
  text-align: center;
  border: 1rpx solid #E5E7EB;
}

.target-label {
  display: block;
  font-size: 22rpx;
  color: #6B7280;
  margin-bottom: 8rpx;
}

.target-amount {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #1F2937;
}

.targets-form {
  margin-top: 16rpx;
}

.quick-actions {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.1), 0 1rpx 2rpx rgba(0,0,0,0.06);
  border: 1rpx solid #E5E7EB;
}

.section-title {
  margin-bottom: 24rpx;
}

.section-title text {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
}

.action-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.action-item {
  flex: 1;
  min-width: 140rpx;
  background: #F9FAFB;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  text-align: center;
  border: 1rpx solid #E5E7EB;
  transition: all 0.3s;
}

.action-item:active {
  background: #F3F4F6;
  transform: translateY(1rpx);
}

.action-icon {
  display: block;
  font-size: 36rpx;
  margin-bottom: 8rpx;
}

.action-text {
  font-size: 22rpx;
  color: #6B7280;
  font-weight: 500;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin: 40rpx;
  max-width: 600rpx;
  width: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  border-radius: 12rpx;
  background: #F9FAFB;
  border: 1rpx solid #E5E7EB;
  transition: all 0.3s;
}

.radio-item:active {
  background: #F3F4F6;
}

.radio-text {
  margin-left: 16rpx;
  font-size: 26rpx;
  color: #374151;
  font-weight: 500;
}

.reset-btn {
  width: 100%;
  height: 88rpx;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.1), 0 1rpx 2rpx rgba(0,0,0,0.06);
  margin-top: 16rpx;
}

.reset-btn:active {
  transform: translateY(1rpx);
  box-shadow: 0 1rpx 2rpx rgba(0,0,0,0.1);
}

/* 设置弹窗样式 */
.settings-modal {
  max-height: 80vh;
  overflow: hidden;
}

.settings-scroll {
  max-height: 60vh;
  padding-right: 10rpx;
}

/* 目标输入弹窗样式 */
.target-input-modal {
  max-width: 500rpx;
}

.input-display {
  text-align: center;
  margin-bottom: 40rpx;
}

.input-label {
  font-size: 24rpx;
  color: #6B7280;
  margin-bottom: 16rpx;
  display: block;
}

.amount-display {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1rpx solid #E5E7EB;
}

.currency {
  font-size: 32rpx;
  color: #6B7280;
  margin-right: 8rpx;
}

.amount-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #1F2937;
  min-width: 60rpx;
}

.number-keyboard {
  margin-bottom: 30rpx;
}

.keyboard-row {
  display: flex;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.key {
  flex: 1;
  height: 80rpx;
  background: #F9FAFB;
  border: 1rpx solid #E5E7EB;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 500;
  color: #1F2937;
  transition: all 0.2s;
}

.key:active {
  background: #E5E7EB;
  transform: scale(0.95);
}

.delete-key {
  background: #FEF2F2;
  border-color: #FECACA;
}

.delete-key:active {
  background: #FEE2E2;
}

.delete-icon {
  font-size: 24rpx;
  color: #EF4444;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s;
}

.cancel-btn {
  background: #F3F4F6;
  color: #6B7280;
}

.cancel-btn:active {
  background: #E5E7EB;
}

.confirm-btn {
  background: #10B981;
  color: white;
}

.confirm-btn:active {
  background: #059669;
  transform: translateY(1rpx);
}

/* 重置今日收入弹窗样式 */
.reset-modal {
  animation: fadeIn 0.3s ease-out;
  backdrop-filter: blur(2rpx);
}

.reset-modal-content {
  max-width: 400rpx;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.3), 0 8rpx 20rpx rgba(0,0,0,0.2);
}

.modal-body {
  text-align: center;
  padding: 40rpx 0;
}

.warning-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  animation: bounce 0.6s ease-out 0.2s both;
}

.warning-text {
  display: block;
  font-size: 28rpx;
  color: #1F2937;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.warning-subtitle {
  display: block;
  font-size: 24rpx;
  color: #6B7280;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 40rpx;
}

/* 弹窗动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -15rpx, 0);
  }
  70% {
    transform: translate3d(0, -7rpx, 0);
  }
  90% {
    transform: translate3d(0, -2rpx, 0);
  }
}

/* 今日收入选项弹窗样式 */
.options-modal {
  animation: fadeIn 0.2s ease-out;
}

.options-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20rpx 20rpx 0 0;
  animation: slideUpFromBottom 0.3s ease-out;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.1);
}

.option-item {
  padding: 32rpx;
  text-align: center;
  border-bottom: 1rpx solid #F3F4F6;
  transition: background-color 0.2s;
}

.option-item:active {
  background-color: #F9FAFB;
}

.option-item:last-child {
  border-bottom: none;
}

.cancel-option {
  background-color: #F9FAFB;
  color: #6B7280;
}

.option-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #1F2937;
}

.cancel-option .option-text {
  color: #6B7280;
}

.option-divider {
  height: 16rpx;
  background-color: #F3F4F6;
}

/* 从底部上滑动画 */
@keyframes slideUpFromBottom {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
