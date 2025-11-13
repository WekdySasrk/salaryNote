<template>
  <view class="app">
    <router-view />
  </view>
</template>

<script>
export default {
  name: 'App',
  onLaunch: function() {
    console.log('App Launch')
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
@import './uni.scss';

.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* 重置样式 */
* {
  box-sizing: border-box;
}

page {
  background-color: #f5f5f5;
  height: 100%;
}
</style>
