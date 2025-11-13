<template>
  <view class="container">
    <!-- 类型切换 -->
    <view class="type-tabs">
      <view
        class="tab-item"
        :class="{ active: currentType === '支出' }"
        @click="switchType('支出')"
      >
        <text class="tab-icon">💸</text>
        <text class="tab-text">支出分类</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentType === '收入' }"
        @click="switchType('收入')"
      >
        <text class="tab-icon">💰</text>
        <text class="tab-text">收入分类</text>
      </view>
    </view>

    <!-- 添加分类按钮 -->
    <view class="add-section">
      <button class="add-btn" @click="showAddModal = true">
        <text class="add-icon">+</text>
        <text class="add-text">添加{{ currentType }}分类</text>
      </button>
    </view>

    <!-- 分类列表 -->
    <view class="category-section">
      <view class="section-header">
        <text class="section-title">{{ currentType }}分类 ({{ currentCategories.length }})</text>
        <text class="edit-toggle" @click="toggleEditMode">
          {{ editMode ? '完成' : '编辑' }}
        </text>
      </view>

      <view class="category-list">
        <view
          v-for="category in currentCategories"
          :key="category.id"
          class="category-item"
          :class="{ 'edit-mode': editMode }"
        >
          <view class="category-info">
            <text class="category-icon">{{ category.icon }}</text>
            <text class="category-name">{{ category.name }}</text>
            <text v-if="category.isDefault" class="default-tag">默认</text>
          </view>

          <view class="category-actions" v-if="editMode">
            <view class="action-btn edit" @click="editCategory(category)" v-if="!category.isDefault">
              <text>✏️</text>
            </view>
            <view class="action-btn delete" @click="deleteCategory(category)" v-if="!category.isDefault">
              <text>🗑️</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="currentCategories.length === 0" class="empty-state">
        <text class="empty-icon">🏷️</text>
        <text class="empty-text">暂无{{ currentType }}分类</text>
        <text class="empty-desc">点击上方按钮添加分类</text>
      </view>
    </view>

    <!-- 使用统计 -->
    <view class="usage-section">
      <view class="section-header">
        <text class="section-title">📊 使用统计</text>
      </view>

      <view class="usage-list">
        <view
          v-for="stat in categoryStats"
          :key="stat.categoryId"
          class="usage-item"
        >
          <view class="usage-info">
            <text class="usage-icon">{{ stat.icon }}</text>
            <view class="usage-details">
              <text class="usage-name">{{ stat.name }}</text>
              <text class="usage-count">使用 {{ stat.count }} 次</text>
            </view>
          </view>
          <text class="usage-amount">¥{{ stat.totalAmount.toFixed(2) }}</text>
        </view>
      </view>

      <view v-if="categoryStats.length === 0" class="empty-state">
        <text class="empty-icon">📈</text>
        <text class="empty-text">暂无使用记录</text>
        <text class="empty-desc">开始记账后这里会显示统计</text>
      </view>
    </view>

    <!-- 添加/编辑分类弹窗 -->
    <view class="modal" v-if="showAddModal || showEditModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">
            {{ showEditModal ? '编辑分类' : '添加' + currentType + '分类' }}
          </text>
          <text class="close-btn" @click="closeModal">✕</text>
        </view>

        <view class="form-group">
          <text class="label">分类名称</text>
          <input
            class="input"
            v-model="categoryForm.name"
            placeholder="请输入分类名称"
            maxlength="10"
          />
        </view>

        <view class="form-group">
          <text class="label">选择图标</text>
          <view class="icon-grid">
            <view
              v-for="icon in availableIcons"
              :key="icon"
              class="icon-item"
              :class="{ active: categoryForm.icon === icon }"
              @click="categoryForm.icon = icon"
            >
              <text>{{ icon }}</text>
            </view>
          </view>
        </view>

        <view class="modal-actions">
          <button class="cancel-btn" @click="closeModal">取消</button>
          <button class="confirm-btn" @click="saveCategory">
            {{ showEditModal ? '保存' : '添加' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <view class="modal" v-if="showDeleteModal" @click="showDeleteModal = false">
      <view class="modal-content delete-modal" @click.stop>
        <view class="delete-header">
          <text class="delete-icon">⚠️</text>
          <text class="delete-title">确认删除</text>
        </view>

        <view class="delete-content">
          <text class="delete-text">
            确定要删除分类"{{ deleteTarget?.name }}"吗？
          </text>
          <text class="delete-warning">
            删除后该分类下的所有记录将无法正常显示分类信息
          </text>
        </view>

        <view class="modal-actions">
          <button class="cancel-btn" @click="showDeleteModal = false">取消</button>
          <button class="delete-confirm-btn" @click="confirmDelete">删除</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentType: '支出',
      editMode: false,
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      deleteTarget: null,

      categoryForm: {
        name: '',
        icon: '📝'
      },

      editingCategory: null,

      availableIcons: [
        // 支出相关
        '🍔', '🍕', '🍜', '☕', '🥤', '🍰', '🍎', '🥗',
        '🚗', '🚌', '🚇', '⛽', '🚕', '✈️', '🚲', '🛵',
        '🏠', '💡', '🚿', '📱', '💻', '📺', '🔌', '🛏️',
        '👕', '👟', '👜', '💄', '💍', '🕶️', '⌚', '🎒',
        '🎬', '🎮', '📚', '🎵', '🏀', '⚽', '🎯', '🎪',
        '💊', '🏥', '🩺', '💉', '🦷', '👓', '🧴', '🧼',
        '🎁', '💐', '🎂', '🎈', '🎊', '🎉', '💌', '🎀',
        // 收入相关
        '💰', '💵', '💴', '💶', '💷', '💳', '💎', '🏆',
        '📈', '📊', '💼', '🏢', '🏭', '🏪', '🏬', '🏦',
        '🎯', '🎪', '🎨', '🎭', '🎪', '🎸', '🎤', '🎧',
        '📝', '📋', '📊', '📈', '📉', '📌', '📍', '📎'
      ],

      defaultCategories: {
        支出: [
          { id: 1, name: '餐饮', icon: '🍔', type: '支出', isDefault: true },
          { id: 2, name: '交通', icon: '🚗', type: '支出', isDefault: true },
          { id: 3, name: '购物', icon: '🛍️', type: '支出', isDefault: true },
          { id: 4, name: '娱乐', icon: '🎬', type: '支出', isDefault: true },
          { id: 5, name: '医疗', icon: '💊', type: '支出', isDefault: true },
          { id: 6, name: '住房', icon: '🏠', type: '支出', isDefault: true }
        ],
        收入: [
          { id: 101, name: '工资', icon: '💰', type: '收入', isDefault: true },
          { id: 102, name: '奖金', icon: '🎁', type: '收入', isDefault: true },
          { id: 103, name: '投资', icon: '📈', type: '收入', isDefault: true },
          { id: 104, name: '兼职', icon: '💼', type: '收入', isDefault: true }
        ]
      }
    }
  },

  computed: {
    allCategories() {
      return uni.getStorageSync('categories') || this.defaultCategories
    },

    currentCategories() {
      return this.allCategories[this.currentType] || []
    },

    categoryStats() {
      const records = uni.getStorageSync('records') || []
      const stats = {}

      records
        .filter(record => record.type === this.currentType)
        .forEach(record => {
          const categoryId = record.category.id
          if (!stats[categoryId]) {
            stats[categoryId] = {
              categoryId,
              name: record.category.name,
              icon: record.category.icon,
              count: 0,
              totalAmount: 0
            }
          }
          stats[categoryId].count += 1
          stats[categoryId].totalAmount += record.amount
        })

      return Object.values(stats).sort((a, b) => b.totalAmount - a.totalAmount)
    }
  },

  onLoad() {
    this.initCategories()
  },

  methods: {
    initCategories() {
      try {
        const stored = uni.getStorageSync('categories')
        if (!stored) {
          uni.setStorageSync('categories', this.defaultCategories)
        }
      } catch (e) {
        console.error('初始化分类失败:', e)
      }
    },

    switchType(type) {
      this.currentType = type
      this.editMode = false
    },

    toggleEditMode() {
      this.editMode = !this.editMode
    },

    editCategory(category) {
      this.editingCategory = category
      this.categoryForm = {
        name: category.name,
        icon: category.icon
      }
      this.showEditModal = true
    },

    deleteCategory(category) {
      this.deleteTarget = category
      this.showDeleteModal = true
    },

    confirmDelete() {
      if (!this.deleteTarget) return

      try {
        const categories = { ...this.allCategories }
        const typeCategories = categories[this.currentType] || []
        const index = typeCategories.findIndex(cat => cat.id === this.deleteTarget.id)

        if (index > -1) {
          typeCategories.splice(index, 1)
          categories[this.currentType] = typeCategories
          uni.setStorageSync('categories', categories)

          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      } catch (e) {
        console.error('删除分类失败:', e)
        uni.showToast({
          title: '删除失败',
          icon: 'error'
        })
      }

      this.showDeleteModal = false
      this.deleteTarget = null
    },

    saveCategory() {
      if (!this.categoryForm.name.trim()) {
        uni.showToast({
          title: '请输入分类名称',
          icon: 'none'
        })
        return
      }

      try {
        const categories = { ...this.allCategories }

        if (this.showEditModal && this.editingCategory) {
          // 编辑模式
          const typeCategories = categories[this.currentType] || []
          const index = typeCategories.findIndex(cat => cat.id === this.editingCategory.id)

          if (index > -1) {
            typeCategories[index] = {
              ...typeCategories[index],
              name: this.categoryForm.name.trim(),
              icon: this.categoryForm.icon
            }
          }
        } else {
          // 添加模式
          const newCategory = {
            id: Date.now(),
            name: this.categoryForm.name.trim(),
            icon: this.categoryForm.icon,
            type: this.currentType,
            isDefault: false
          }

          if (!categories[this.currentType]) {
            categories[this.currentType] = []
          }
          categories[this.currentType].push(newCategory)
        }

        uni.setStorageSync('categories', categories)

        uni.showToast({
          title: this.showEditModal ? '修改成功' : '添加成功',
          icon: 'success'
        })

        this.closeModal()
      } catch (e) {
        console.error('保存分类失败:', e)
        uni.showToast({
          title: '保存失败',
          icon: 'error'
        })
      }
    },

    closeModal() {
      this.showAddModal = false
      this.showEditModal = false
      this.editingCategory = null
      this.categoryForm = {
        name: '',
        icon: '📝'
      }
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

.type-tabs {
  display: flex;
  background: white;
  margin-bottom: 30rpx;
  border-radius: 15rpx;
  padding: 10rpx;
  box-shadow: 0 5rpx 15rpx rgba(0,0,0,0.1);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  border-radius: 10rpx;
  transition: all 0.3s;
}

.tab-item.active {
  background: #4CAF50;
  color: white;
}

.tab-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.tab-text {
  font-size: 28rpx;
}

.add-section {
  margin-bottom: 30rpx;
}

.add-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 5rpx 15rpx rgba(76, 175, 80, 0.3);
}

.add-icon {
  font-size: 40rpx;
}

.category-section {
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

.edit-toggle {
  color: #4CAF50;
  font-size: 28rpx;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  background: #f0f8f0;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
  border: 2rpx solid #e9ecef;
  transition: all 0.3s;
}

.category-item.edit-mode {
  border-color: #4CAF50;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.category-icon {
  font-size: 40rpx;
}

.category-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.default-tag {
  font-size: 20rpx;
  color: #666;
  background: #e9ecef;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
}

.category-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  font-size: 24rpx;
  transition: all 0.3s;
}

.action-btn.edit {
  background: #ffa726;
}

.action-btn.delete {
  background: #ff6b6b;
}

.action-btn:active {
  transform: scale(0.9);
}

.usage-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0,0,0,0.1);
}

.usage-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.usage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
}

.usage-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.usage-icon {
  font-size: 36rpx;
}

.usage-details {
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.usage-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.usage-count {
  font-size: 22rpx;
  color: #666;
}

.usage-amount {
  font-size: 28rpx;
  font-weight: bold;
  color: #4CAF50;
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

.delete-modal {
  max-width: 500rpx;
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
  margin-bottom: 15rpx;
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

.input:focus {
  border-color: #4CAF50;
  background: white;
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
  transition: all 0.3s;
}

.icon-item.active {
  background: #4CAF50;
  border-color: #4CAF50;
}

.icon-item:active {
  transform: scale(0.9);
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.cancel-btn {
  flex: 1;
  height: 80rpx;
  background: #f8f9fa;
  color: #666;
  border: 2rpx solid #e9ecef;
  border-radius: 10rpx;
  font-size: 28rpx;
}

.confirm-btn {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.delete-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}

.delete-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.delete-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.delete-content {
  text-align: center;
  margin-bottom: 30rpx;
}

.delete-text {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
}

.delete-warning {
  display: block;
  font-size: 24rpx;
  color: #ff6b6b;
}

.delete-confirm-btn {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(45deg, #ff6b6b, #ff5252);
  color: white;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
}
</style>
