<template>
  <view class="container">
    <!-- 统计概览 -->
    <view class="overview-section">
      <view class="overview-card">
        <view class="overview-item">
          <text class="overview-amount">¥{{ totalExpense.toFixed(2) }}</text>
          <text class="overview-label">总支出</text>
        </view>
        <view class="overview-item">
          <text class="overview-amount">¥{{ totalIncome.toFixed(2) }}</text>
          <text class="overview-label">总收入</text>
        </view>
        <view class="overview-item">
          <text class="overview-amount" :class="{ negative: balance < 0 }">
            ¥{{ balance.toFixed(2) }}
          </text>
          <text class="overview-label">净收入</text>
        </view>
      </view>
    </view>

    <!-- 时间筛选 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view
          v-for="period in timePeriods"
          :key="period.key"
          class="filter-tab"
          :class="{ active: selectedPeriod === period.key }"
          @click="selectPeriod(period.key)"
        >
          <text>{{ period.label }}</text>
        </view>
      </view>
    </view>

    <!-- 物品消费统计 -->
    <view class="statistics-section">
      <view class="section-header">
        <text class="section-title">📊 消费统计</text>
        <view class="sort-options">
          <text
            class="sort-option"
            :class="{ active: sortBy === 'count' }"
            @click="sortBy = 'count'"
          >
            按次数
          </text>
          <text
            class="sort-option"
            :class="{ active: sortBy === 'amount' }"
            @click="sortBy = 'amount'"
          >
            按金额
          </text>
        </view>
      </view>

      <view class="statistics-list">
        <view
          v-for="item in sortedStatistics"
          :key="item.key"
          class="statistic-item"
          @click="showItemDetail(item)"
        >
          <view class="item-info">
            <text class="item-icon">{{ item.icon }}</text>
            <view class="item-details">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-type" :class="item.type">{{ item.type }}</text>
            </view>
          </view>
          <view class="item-stats">
            <text class="item-amount">¥{{ item.totalAmount.toFixed(2) }}</text>
            <text class="item-count">{{ item.count }}次</text>
          </view>
        </view>
      </view>

      <view v-if="sortedStatistics.length === 0" class="empty-state">
        <text class="empty-icon">📈</text>
        <text class="empty-text">暂无消费记录</text>
        <text class="empty-desc">开始记账后这里会显示统计信息</text>
      </view>
    </view>

    <!-- 最近记录 -->
    <view class="recent-section">
      <view class="section-header">
        <text class="section-title">📝 最近记录</text>
        <text class="view-all" @click="viewAllRecords">查看全部</text>
      </view>

      <view class="recent-list">
        <view
          v-for="record in recentRecords"
          :key="record.id"
          class="record-item"
        >
          <view class="record-info">
            <text class="record-icon">{{ record.category.icon }}</text>
            <view class="record-details">
              <text class="record-category">{{ record.category.name }}</text>
              <text class="record-note" v-if="record.note">{{ record.note }}</text>
              <text class="record-time">{{ formatDateTime(record.date, record.time) }}</text>
            </view>
          </view>
          <view class="record-amount" :class="record.type">
            {{ record.type === '收入' ? '+' : '-' }}¥{{ record.amount.toFixed(2) }}
          </view>
        </view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <view class="modal" v-if="showDetail" @click="showDetail = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ selectedItem?.name }} 详情</text>
          <text class="close-btn" @click="showDetail = false">✕</text>
        </view>

        <view class="detail-stats">
          <view class="detail-item">
            <text class="detail-label">总消费</text>
            <text class="detail-value">¥{{ selectedItem?.totalAmount.toFixed(2) }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">消费次数</text>
            <text class="detail-value">{{ selectedItem?.count }}次</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">平均每次</text>
            <text class="detail-value">
              ¥{{ selectedItem ? (selectedItem.totalAmount / selectedItem.count).toFixed(2) : '0.00' }}
            </text>
          </view>
        </view>

        <view class="detail-records">
          <text class="detail-section-title">相关记录</text>
          <view
            v-for="record in itemRecords"
            :key="record.id"
            class="detail-record"
          >
            <view class="detail-record-info">
              <text class="detail-record-note">{{ record.note || '无备注' }}</text>
              <text class="detail-record-time">{{ formatDateTime(record.date, record.time) }}</text>
            </view>
            <text class="detail-record-amount">¥{{ record.amount.toFixed(2) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedPeriod: 'all',
      sortBy: 'amount',
      showDetail: false,
      selectedItem: null,
      itemRecords: [],

      timePeriods: [
        { key: 'all', label: '全部' },
        { key: 'today', label: '今日' },
        { key: 'week', label: '本周' },
        { key: 'month', label: '本月' },
        { key: 'year', label: '今年' }
      ]
    }
  },

  computed: {
    filteredRecords() {
      const records = uni.getStorageSync('records') || []
      const now = new Date()

      return records.filter(record => {
        const recordDate = new Date(record.date)

        switch (this.selectedPeriod) {
          case 'today':
            return recordDate.toDateString() === now.toDateString()
          case 'week':
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
            return recordDate >= weekStart
          case 'month':
            return recordDate.getMonth() === now.getMonth() &&
                   recordDate.getFullYear() === now.getFullYear()
          case 'year':
            return recordDate.getFullYear() === now.getFullYear()
          default:
            return true
        }
      })
    },

    totalExpense() {
      return this.filteredRecords
        .filter(record => record.type === '支出')
        .reduce((sum, record) => sum + record.amount, 0)
    },

    totalIncome() {
      return this.filteredRecords
        .filter(record => record.type === '收入')
        .reduce((sum, record) => sum + record.amount, 0)
    },

    balance() {
      return this.totalIncome - this.totalExpense
    },

    statistics() {
      const stats = {}

      this.filteredRecords.forEach(record => {
        const key = `${record.category.name}_${record.type}`

        if (!stats[key]) {
          stats[key] = {
            key,
            name: record.category.name,
            icon: record.category.icon,
            type: record.type,
            count: 0,
            totalAmount: 0
          }
        }

        stats[key].count += 1
        stats[key].totalAmount += record.amount
      })

      return Object.values(stats)
    },

    sortedStatistics() {
      return [...this.statistics].sort((a, b) => {
        if (this.sortBy === 'count') {
          return b.count - a.count
        } else {
          return b.totalAmount - a.totalAmount
        }
      })
    },

    recentRecords() {
      const records = uni.getStorageSync('records') || []
      return records.slice(0, 5)
    }
  },

  onLoad() {
    // 页面加载时的初始化
  },

  methods: {
    selectPeriod(period) {
      this.selectedPeriod = period
    },

    showItemDetail(item) {
      this.selectedItem = item
      this.loadItemRecords(item)
      this.showDetail = true
    },

    loadItemRecords(item) {
      const records = uni.getStorageSync('records') || []
      this.itemRecords = records.filter(record =>
        record.category.name === item.name && record.type === item.type
      )
    },

    viewAllRecords() {
      // 这里可以跳转到详细记录页面
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },

    formatDateTime(date, time) {
      const recordDate = new Date(date)
      const today = new Date()
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

      let dateStr = ''
      if (recordDate.toDateString() === today.toDateString()) {
        dateStr = '今天'
      } else if (recordDate.toDateString() === yesterday.toDateString()) {
        dateStr = '昨天'
      } else {
        dateStr = `${recordDate.getMonth() + 1}/${recordDate.getDate()}`
      }

      return `${dateStr} ${time}`
    }
  }
}
</script>

<style scoped>
.container {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 20rpx;
}

.overview-section {
  margin-bottom: 30rpx;
}

.overview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.1);
}

.overview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

.overview-amount {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.overview-amount.negative {
  color: #ff6b6b;
}

.overview-label {
  font-size: 24rpx;
  opacity: 0.9;
}

.filter-section {
  margin-bottom: 30rpx;
}

.filter-tabs {
  display: flex;
  background: white;
  border-radius: 15rpx;
  padding: 10rpx;
  box-shadow: 0 5rpx 15rpx rgba(0,0,0,0.1);
}

.filter-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.3s;
}

.filter-tab.active {
  background: #4CAF50;
  color: white;
}

.statistics-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.sort-options {
  display: flex;
  gap: 20rpx;
}

.sort-option {
  font-size: 24rpx;
  color: #666;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  background: #f8f9fa;
  transition: all 0.3s;
}

.sort-option.active {
  background: #4CAF50;
  color: white;
}

.statistics-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.statistic-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
  border: 2rpx solid #e9ecef;
  transition: all 0.3s;
}

.statistic-item:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.item-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.item-icon {
  font-size: 40rpx;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.item-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.item-type {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  color: white;
}

.item-type.支出 {
  background: #ff6b6b;
}

.item-type.收入 {
  background: #4CAF50;
}

.item-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5rpx;
}

.item-amount {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.item-count {
  font-size: 22rpx;
  color: #666;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  color: #999;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  margin-bottom: 10rpx;
}

.empty-desc {
  font-size: 24rpx;
}

.recent-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0,0,0,0.1);
}

.view-all {
  color: #4CAF50;
  font-size: 24rpx;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.record-icon {
  font-size: 36rpx;
}

.record-details {
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.record-category {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.record-note {
  font-size: 24rpx;
  color: #666;
}

.record-time {
  font-size: 22rpx;
  color: #999;
}

.record-amount {
  font-size: 28rpx;
  font-weight: bold;
}

.record-amount.支出 {
  color: #ff6b6b;
}

.record-amount.收入 {
  color: #4CAF50;
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
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin: 40rpx;
  max-width: 700rpx;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
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

.detail-stats {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 10rpx;
}

.detail-label {
  font-size: 28rpx;
  color: #666;
}

.detail-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.detail-records {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 30rpx;
}

.detail-section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.detail-record {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-record:last-child {
  border-bottom: none;
}

.detail-record-info {
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.detail-record-note {
  font-size: 26rpx;
  color: #333;
}

.detail-record-time {
  font-size: 22rpx;
  color: #999;
}

.detail-record-amount {
  font-size: 26rpx;
  font-weight: bold;
  color: #4CAF50;
}
</style>
