<template>
  <view class="container">
    <!-- 类型切换 -->
    <view class="type-tabs">
      <view
        class="tab-item"
        :class="{ active: recordType === '支出' }"
        @click="recordType = '支出'"
      >
        <text class="tab-icon">💸</text>
        <text class="tab-text">支出</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: recordType === '收入' }"
        @click="recordType = '收入'"
      >
        <text class="tab-icon">💰</text>
        <text class="tab-text">收入</text>
      </view>
    </view>

    <!-- 金额输入 -->
    <view class="amount-section">
      <view class="amount-display">
        <text class="currency">¥</text>
        <text class="amount">{{ displayAmount }}</text>
      </view>
      <view class="amount-input">
        <input
          class="hidden-input"
          type="number"
          v-model="amount"
          @input="onAmountInput"
          placeholder="0.00"
        />
      </view>
    </view>

    <!-- 分类选择 -->
    <view class="category-section">
      <view class="section-title">
        <text>{{ showSubCategories ? '选择子分类' : '选择分类' }}</text>
        <text v-if="showSubCategories" class="back-btn" @tap="backToMainCategories">返回</text>
        <text v-else class="add-category" @tap="showAddCategory = true">+ 添加</text>
      </view>

      <!-- 一级分类 -->
      <view v-if="!showSubCategories" class="category-grid">
        <view
          v-for="category in currentCategories"
          :key="category.id"
          class="category-item"
          :class="{ active: selectedCategory?.id === category.id }"
          @tap="selectCategory(category)"
        >
          <text class="category-icon">{{ category.icon }}</text>
          <text class="category-name">{{ category.name }}</text>
          <text v-if="category.children && category.children.length > 0" class="has-children">›</text>
        </view>
      </view>

      <!-- 二级分类 -->
      <view v-if="showSubCategories && selectedCategory" class="category-grid">
        <view
          v-for="subCategory in selectedCategory.children"
          :key="subCategory.id"
          class="category-item"
          :class="{ active: selectedSubCategory?.id === subCategory.id }"
          @tap="selectSubCategory(subCategory)"
        >
          <text class="category-icon">{{ subCategory.icon }}</text>
          <text class="category-name">{{ subCategory.name }}</text>
        </view>

        <!-- 添加自定义子分类 -->
        <view class="category-item add-sub-category" @tap="showAddSubCategory = true">
          <text class="category-icon">➕</text>
          <text class="category-name">添加</text>
        </view>
      </view>
    </view>

    <!-- 备注输入 -->
    <view class="note-section">
      <view class="section-title">
        <text>备注</text>
      </view>
      <textarea
        class="note-input"
        v-model="note"
        placeholder="添加备注信息..."
        maxlength="100"
      />
    </view>

    <!-- 日期时间 -->
    <view class="datetime-section">
      <view class="datetime-item" @click="showDatePicker = true">
        <text class="datetime-label">日期</text>
        <text class="datetime-value">{{ selectedDate }}</text>
      </view>
      <view class="datetime-item" @click="showTimePicker = true">
        <text class="datetime-label">时间</text>
        <text class="datetime-value">{{ selectedTime }}</text>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <button class="save-btn" @click="saveRecord" :disabled="!canSave">
        保存记录
      </button>
    </view>

    <!-- 数字键盘 -->
    <view class="keyboard">
      <view class="keyboard-row">
        <view class="key" @click="inputNumber('1')">1</view>
        <view class="key" @click="inputNumber('2')">2</view>
        <view class="key" @click="inputNumber('3')">3</view>
        <view class="key delete" @click="deleteNumber">⌫</view>
      </view>
      <view class="keyboard-row">
        <view class="key" @click="inputNumber('4')">4</view>
        <view class="key" @click="inputNumber('5')">5</view>
        <view class="key" @click="inputNumber('6')">6</view>
        <view class="key" @click="inputNumber('+')">+</view>
      </view>
      <view class="keyboard-row">
        <view class="key" @click="inputNumber('7')">7</view>
        <view class="key" @click="inputNumber('8')">8</view>
        <view class="key" @click="inputNumber('9')">9</view>
        <view class="key" @click="inputNumber('-')">-</view>
      </view>
      <view class="keyboard-row">
        <view class="key" @click="inputNumber('.')">.</view>
        <view class="key" @click="inputNumber('0')">0</view>
        <view class="key clear" @click="clearAmount">C</view>
        <view class="key confirm" @click="saveRecord">✓</view>
      </view>
    </view>

    <!-- 添加分类弹窗 -->
    <view class="modal" v-if="showAddCategory" @click="showAddCategory = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加分类</text>
          <text class="close-btn" @click="showAddCategory = false">✕</text>
        </view>
        <view class="form-group">
          <text class="label">分类名称</text>
          <input
            class="input"
            v-model="newCategory.name"
            placeholder="请输入分类名称"
          />
        </view>
        <view class="form-group">
          <text class="label">选择图标</text>
          <view class="icon-grid">
            <view
              v-for="icon in availableIcons"
              :key="icon"
              class="icon-item"
              :class="{ active: newCategory.icon === icon }"
              @click="newCategory.icon = icon"
            >
              <text>{{ icon }}</text>
            </view>
          </view>
        </view>
        <button class="save-btn" @click="addCategory">保存分类</button>
      </view>
    </view>

    <!-- 日期选择器 -->
    <picker
      mode="date"
      :value="selectedDate"
      @change="onDateChange"
      @cancel="showDatePicker = false"
      v-if="showDatePicker"
    >
      <view class="picker-placeholder"></view>
    </picker>

    <!-- 时间选择器 -->
    <picker
      mode="time"
      :value="selectedTime"
      @change="onTimeChange"
      @cancel="showTimePicker = false"
      v-if="showTimePicker"
    >
      <view class="picker-placeholder"></view>
    </picker>
  </view>
</template>

<script>
export default {
  data() {
    return {
      recordType: '支出',
      amount: '',
      displayAmount: '0.00',
      selectedCategory: null,
      selectedSubCategory: null,
      showSubCategories: false,
      note: '',
      selectedDate: '',
      selectedTime: '',
      showAddCategory: false,
      showDatePicker: false,
      showTimePicker: false,

      // 新分类
      newCategory: {
        name: '',
        icon: '📝'
      },

      // 可用图标
      availableIcons: [
        '🍔', '🍕', '🍜', '☕', '🚗', '🚌', '🚇', '⛽',
        '🏠', '💡', '📱', '👕', '👟', '🎬', '🎮', '📚',
        '💊', '🏥', '✈️', '🏨', '🎁', '💰', '📈', '💼'
      ],

      // 默认分类
      defaultCategories: {
        支出: [
          { id: 1, name: '餐饮', icon: '🍔', type: '支出' },
          { id: 2, name: '交通', icon: '🚗', type: '支出' },
          { id: 3, name: '购物', icon: '🛍️', type: '支出' },
          { id: 4, name: '娱乐', icon: '🎬', type: '支出' },
          { id: 5, name: '医疗', icon: '💊', type: '支出' },
          { id: 6, name: '住房', icon: '🏠', type: '支出' }
        ],
        收入: [
          { id: 101, name: '工资', icon: '💰', type: '收入' },
          { id: 102, name: '奖金', icon: '🎁', type: '收入' },
          { id: 103, name: '投资', icon: '📈', type: '收入' },
          { id: 104, name: '兼职', icon: '💼', type: '收入' }
        ]
      }
    }
  },

  computed: {
    currentCategories() {
      const stored = uni.getStorageSync('categories') || this.defaultCategories
      return stored[this.recordType] || []
    },

    canSave() {
      return this.amount && parseFloat(this.amount) > 0 && this.selectedCategory
    }
  },

  onLoad(options) {
    if (options.type) {
      this.recordType = options.type
    }
    this.initDateTime()
    this.loadCategories()
  },

  methods: {
    initDateTime() {
      const now = new Date()
      this.selectedDate = now.toISOString().split('T')[0]
      this.selectedTime = now.toTimeString().split(' ')[0].substring(0, 5)
    },

    loadCategories() {
      try {
        const stored = uni.getStorageSync('categories')
        if (!stored) {
          uni.setStorageSync('categories', this.defaultCategories)
        }
      } catch (e) {
        console.error('加载分类失败:', e)
      }
    },

    inputNumber(num) {
      if (num === '+' || num === '-') {
        // 处理加减运算
        if (this.amount && !isNaN(parseFloat(this.amount))) {
          const currentAmount = parseFloat(this.amount)
          this.amount = num === '+' ? (currentAmount + 1).toString() : Math.max(0, currentAmount - 1).toString()
        }
      } else if (num === '.') {
        if (!this.amount.includes('.')) {
          this.amount += num
        }
      } else {
        if (this.amount === '0') {
          this.amount = num
        } else {
          this.amount += num
        }
      }
      this.updateDisplayAmount()
    },

    deleteNumber() {
      if (this.amount.length > 0) {
        this.amount = this.amount.slice(0, -1)
        if (this.amount === '') {
          this.amount = '0'
        }
      }
      this.updateDisplayAmount()
    },

    clearAmount() {
      this.amount = '0'
      this.updateDisplayAmount()
    },

    updateDisplayAmount() {
      const num = parseFloat(this.amount) || 0
      this.displayAmount = num.toFixed(2)
    },

    onAmountInput() {
      this.updateDisplayAmount()
    },

    selectCategory(category) {
      this.selectedCategory = category
      this.selectedSubCategory = null

      // 如果有子分类，显示子分类选择
      if (category.children && category.children.length > 0) {
        this.showSubCategories = true
      }
    },

    selectSubCategory(subCategory) {
      this.selectedSubCategory = subCategory
    },

    backToMainCategories() {
      this.showSubCategories = false
      this.selectedSubCategory = null
    },

    addCategory() {
      if (!this.newCategory.name.trim()) {
        uni.showToast({
          title: '请输入分类名称',
          icon: 'none'
        })
        return
      }

      try {
        const categories = uni.getStorageSync('categories') || this.defaultCategories
        const newId = Date.now()
        const category = {
          id: newId,
          name: this.newCategory.name.trim(),
          icon: this.newCategory.icon,
          type: this.recordType
        }

        if (!categories[this.recordType]) {
          categories[this.recordType] = []
        }
        categories[this.recordType].push(category)

        uni.setStorageSync('categories', categories)

        this.newCategory = { name: '', icon: '📝' }
        this.showAddCategory = false

        uni.showToast({
          title: '分类添加成功',
          icon: 'success'
        })
      } catch (e) {
        console.error('添加分类失败:', e)
        uni.showToast({
          title: '添加失败',
          icon: 'error'
        })
      }
    },

    onDateChange(e) {
      this.selectedDate = e.detail.value
      this.showDatePicker = false
    },

    onTimeChange(e) {
      this.selectedTime = e.detail.value
      this.showTimePicker = false
    },

    saveRecord() {
      if (!this.canSave) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }

      try {
        const records = uni.getStorageSync('records') || []
        // 确定最终使用的分类（优先使用子分类）
        const finalCategory = this.selectedSubCategory || this.selectedCategory

        const record = {
          id: Date.now(),
          type: this.recordType,
          amount: parseFloat(this.amount),
          category: finalCategory,
          parentCategory: this.selectedSubCategory ? this.selectedCategory : null,
          note: this.note.trim(),
          date: this.selectedDate,
          time: this.selectedTime,
          timestamp: new Date(`${this.selectedDate} ${this.selectedTime}`).getTime()
        }

        records.unshift(record)
        uni.setStorageSync('records', records)

        // 更新物品消费统计
        this.updateItemStatistics(record)

        uni.showToast({
          title: '记录保存成功',
          icon: 'success'
        })

        // 重置表单
        this.resetForm()

        // 返回首页
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)

      } catch (e) {
        console.error('保存记录失败:', e)
        uni.showToast({
          title: '保存失败',
          icon: 'error'
        })
      }
    },

    updateItemStatistics(record) {
      try {
        const statistics = uni.getStorageSync('itemStatistics') || {}
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

        uni.setStorageSync('itemStatistics', statistics)
      } catch (e) {
        console.error('更新统计失败:', e)
      }
    },

    resetForm() {
      this.amount = '0'
      this.displayAmount = '0.00'
      this.selectedCategory = null
      this.note = ''
      this.initDateTime()
    }
  }
}
</script>

<style scoped>
.container {
  background: #F9FAFB;
  min-height: 100vh;
  padding-bottom: calc(400rpx + env(safe-area-inset-bottom));
}

.type-tabs {
  display: flex;
  background: #FFFFFF;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 8rpx;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.1), 0 1rpx 2rpx rgba(0,0,0,0.06);
  border: 1rpx solid #E5E7EB;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  border-radius: 12rpx;
  transition: all 0.3s;
}

.tab-item.active {
  background: #6B7280;
  color: white;
}

.tab-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.tab-text {
  font-size: 28rpx;
}

.amount-section {
  background: #FFFFFF;
  margin: 24rpx;
  border-radius: 20rpx;
  padding: 32rpx;
  text-align: center;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.1), 0 1rpx 2rpx rgba(0,0,0,0.06);
  border: 1rpx solid #E5E7EB;
}

.amount-display {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.currency {
  font-size: 36rpx;
  color: #6B7280;
  margin-right: 8rpx;
}

.amount {
  font-size: 72rpx;
  font-weight: 700;
  color: #1F2937;
}

.hidden-input {
  opacity: 0;
  height: 0;
}

.category-section {
  background: #FFFFFF;
  margin: 24rpx;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.1), 0 1rpx 2rpx rgba(0,0,0,0.06);
  border: 1rpx solid #E5E7EB;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
}

.add-category {
  color: #6B7280;
  font-size: 26rpx;
  font-weight: 500;
}

.category-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #F9FAFB;
  border: 1rpx solid #E5E7EB;
  min-width: 100rpx;
  transition: all 0.3s;
  position: relative;
}

.category-item.active {
  background: #6B7280;
  color: white;
  border-color: #6B7280;
}

.category-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.category-name {
  font-size: 24rpx;
}

.has-children {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  font-size: 20rpx;
  color: #9CA3AF;
  font-weight: bold;
}

.back-btn {
  color: #6B7280;
  font-size: 26rpx;
  font-weight: 500;
}

.add-sub-category {
  border: 2rpx dashed #E5E7EB !important;
  background: transparent !important;
}

.note-section {
  background: white;
  margin: 20rpx;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0,0,0,0.1);
}

.note-input {
  width: 100%;
  min-height: 120rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background: #f9f9f9;
}

.datetime-section {
  background: white;
  margin: 20rpx;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0,0,0,0.1);
}

.datetime-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.datetime-item:active {
  background-color: #f5f5f5;
}

.datetime-item:last-child {
  border-bottom: none;
}

.datetime-label {
  font-size: 28rpx;
  color: #666;
}

.datetime-value {
  font-size: 28rpx;
  color: #333;
}

.save-section {
  padding: 20rpx;
  margin-bottom: 40rpx;
}

.save-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.save-btn:disabled {
  background: #ccc;
}

.keyboard {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 120rpx);
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-top: 1rpx solid #E5E7EB;
  padding: 24rpx;
  box-shadow: 0 -4rpx 6rpx rgba(0,0,0,0.07), 0 -2rpx 4rpx rgba(0,0,0,0.06);
  z-index: 1001;
}

.keyboard-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.keyboard-row:last-child {
  margin-bottom: 0;
}

.key {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2937;
  transition: all 0.2s;
  border: 1rpx solid #E5E7EB;
}

.key:active {
  background: #F3F4F6;
  transform: translateY(1rpx);
}

.key.delete {
  background: #EF4444;
  color: white;
  border-color: #EF4444;
}

.key.clear {
  background: #F59E0B;
  color: white;
  border-color: #F59E0B;
}

.key.confirm {
  background: #10B981;
  color: white;
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

.form-group {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background: #f9f9f9;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.icon-item {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  font-size: 32rpx;
}

.icon-item.active {
  background: #4CAF50;
  border-color: #4CAF50;
}

/* 适配不同设备的底部导航栏高度 */
@media screen and (max-height: 667px) {
  .keyboard {
    bottom: calc(env(safe-area-inset-bottom) + 100rpx);
  }
}

@media screen and (min-height: 812px) {
  .keyboard {
    bottom: calc(env(safe-area-inset-bottom) + 140rpx);
  }
}
</style>
