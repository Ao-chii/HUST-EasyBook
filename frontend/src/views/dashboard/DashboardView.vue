<!--
  仪表板页面
  系统总览和关键指标展示
-->
<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary">
          EasyBook 首页
        </h1>
        <p class="text-body-1 text-grey-darken-1 mt-1">
          欢迎回来，{{ user_display_name }}
        </p>
      </div>
      
      <div class="d-flex align-center">
        <v-btn
          prepend-icon="mdi-refresh"
          variant="outlined"
          color="primary"
          :loading="refreshing"
          @click="refresh_data"
        >
          刷新数据
        </v-btn>
      </div>
    </div>
    
    <!-- 关键指标卡片 -->
    <v-row class="mb-6">
      <v-col
        v-for="metric in key_metrics"
        :key="metric.title"
        cols="12"
        sm="6"
        md="3"
      >
        <MetricCard
          :title="metric.title"
          :value="metric.value"
          :subtitle="metric.subtitle"
          :icon="metric.icon"
          :icon-color="metric.color"
          :loading="loading"
          clickable
          @click="navigate_to(metric.route)"
        />
      </v-col>
    </v-row>
    
    <!-- 主要内容区域 -->
    <v-row>
      <!-- 实时事件流 -->
      <v-col
        cols="12"
        md="8"
      >
        <v-card
          title="最新订单"
          subtitle="待处理订单列表"
          class="h-100"
        >
          <template #append>
            <v-btn
              icon="mdi-open-in-new"
              variant="text"
              size="small"
              @click="$router.push('/orders')"
            />
          </template>

          <v-card-text>
            <div class="text-center py-8">
              <v-icon
                size="48"
                color="grey-lighten-1"
                class="mb-2"
              >
                mdi-package-variant
              </v-icon>
              <p class="text-body-2 text-grey-darken-1">
                暂无待处理订单
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 系统状态 -->
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          title="系统概览"
          subtitle="书店运营概况"
          class="h-100"
        >
          <v-card-text>
            <div class="system-status">
              <!-- 图书状态 -->
              <div class="status-section mb-4">
                <h4 class="text-subtitle-1 font-weight-medium mb-3">
                  图书库存
                </h4>

                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-body-2">在售图书</span>
                  <span class="font-weight-medium">
                    0 种
                  </span>
                </div>

                <div class="d-flex align-center justify-space-between">
                  <span class="text-body-2">缺货图书</span>
                  <span class="font-weight-medium">
                    0 种
                  </span>
                </div>
              </div>

              <v-divider class="my-4" />

              <!-- 客户统计 -->
              <div class="status-section">
                <h4 class="text-subtitle-1 font-weight-medium mb-3">
                  客户统计
                </h4>

                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-body-2">注册用户</span>
                  <span class="font-weight-medium">
                    0 人
                  </span>
                </div>

                <div class="d-flex align-center justify-space-between">
                  <span class="text-body-2">VIP用户</span>
                  <span class="font-weight-medium">
                    0 人
                  </span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { book_api, order_api, stats_api } from '../../api'
import StatusChip from '../../components/common/StatusChip.vue'
import MetricCard from '../../components/common/MetricCard.vue'

const router = useRouter()
const auth_store = useAuthStore()

// 状态
const loading = ref(true)
const refreshing = ref(false)
const recent_events = ref<any[]>([])
const system_status = ref({
  devices: {
    total: 0,
    online: 0,
    offline: 0,
  },
  drivers: {
    active: 0,
    high_risk: 0,
  },
})

// 用户显示名称
const user_display_name = computed(() => auth_store.user_display_name)

// 关键指标
const key_metrics = computed(() => [
  {
    title: '今日订单',
    value: system_status.value.devices.online,
    subtitle: `总计 ${system_status.value.devices.total} 单`,
    icon: 'mdi-cart',
    color: 'success',
    route: '/orders',
  },
  {
    title: '待发货',
    value: recent_events.value.length,
    subtitle: '需要处理',
    icon: 'mdi-package-variant',
    color: 'warning',
    route: '/orders',
  },
  {
    title: '在售图书',
    value: system_status.value.drivers.active,
    subtitle: '种类',
    icon: 'mdi-book-multiple',
    color: 'info',
    route: '/books',
  },
  {
    title: '注册用户',
    value: system_status.value.drivers.high_risk,
    subtitle: '累计',
    icon: 'mdi-account-group',
    color: 'error',
    route: '/customers',
  },
])

// 获取事件状态
const get_event_status = (event_type: string): 'normal' | 'warning' | 'danger' => {
  const danger_events = ['疲劳驾驶','危险行为']
  const warning_events = ['打哈欠', '闭眼','使用手机', '抽烟','饮食']
  
  if (danger_events.some(type => event_type.includes(type))) {
    return 'danger'
  } else if (warning_events.some(type => event_type.includes(type))) {
    return 'warning'
  }
  return 'normal'
}

// 获取事件颜色
const get_event_color = (event_type: string): string => {
  const status = get_event_status(event_type)
  switch (status) {
    case 'danger':
      return 'error'
    case 'warning':
      return 'warning'
    default:
      return 'success'
  }
}

// 格式化时间
const format_time = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }
}

// 导航到指定路由
const navigate_to = (route: string) => {
  router.push(route)
}

// 加载数据
const load_data = async () => {
  try {
    // TODO: 实现书店数据加载
    // 模拟数据
    recent_events.value = []
    system_status.value.devices.total = 0
    system_status.value.devices.online = 0
    system_status.value.devices.offline = 0
    system_status.value.drivers.active = 0
    system_status.value.drivers.high_risk = 0
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 刷新数据
const refresh_data = async () => {
  refreshing.value = true
  await load_data()
  refreshing.value = false
}

// 页面加载时获取数据
onMounted(async () => {
  await load_data()
  loading.value = false
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.system-status .status-section {
  padding: 0;
}

.v-timeline {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-100) transparent;
}

.v-timeline::-webkit-scrollbar {
  width: 6px;
}

.v-timeline::-webkit-scrollbar-track {
  background: transparent;
}

.v-timeline::-webkit-scrollbar-thumb {
  background: var(--primary-100);
  border-radius: 3px;
}

/* 主标题样式优化 - 使用新配色方案 */
h1 {
  background: linear-gradient(135deg, var(--primary-100) 0%, var(--accent-100) 50%, var(--primary-200) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 卡片样式优化 - 统一配色方案 */
:deep(.v-card) {
  transition: all 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
}

/* 按钮优化 - 统一配色 */
:deep(.v-btn) {
  border-radius: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-btn--variant-outlined) {
  border: 2px solid;
}

:deep(.v-btn:hover) {
  transform: translateY(-2px);
}

/* 时间线样式优化 - 统一配色 */
:deep(.v-timeline-item) {
  margin-bottom: 16px;
}

:deep(.v-timeline-item__body) {
  padding: 12px;
  background: var(--bg-200);
  border-radius: 12px;
  border-left: 3px solid transparent;
  transition: all 250ms ease;
}

:deep(.v-timeline-item:hover .v-timeline-item__body) {
  background: var(--accent-200);
  border-left-color: var(--primary-100);
  transform: translateX(4px);
}
</style>