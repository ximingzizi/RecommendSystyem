<template>
  <div class="analytics-page page-shell">
    <div class="header glass-card">
      <div>
        <strong class="header-title">Project1 统计分析页</strong>
        <div class="muted">已连接真实后端统计接口。</div>
      </div>
      <div class="header-actions">
        <router-link class="action-btn secondary" to="/">返回首页</router-link>
        <router-link class="action-btn secondary" to="/results">查看结果页</router-link>
      </div>
    </div>

    <div v-if="error" class="glass-card error-card">
      {{ error }}
    </div>

    <section v-if="!error" class="stats-grid">
      <div class="glass-card stat-card">
        <strong>{{ summary.total_products }}</strong>
        <div>商品数量</div>
      </div>
      <div class="glass-card stat-card">
        <strong>{{ summary.total_categories }}</strong>
        <div>类目数量</div>
      </div>
      <div class="glass-card stat-card">
        <strong>{{ summary.total_searches }}</strong>
        <div>累计查询</div>
      </div>
      <div class="glass-card stat-card">
        <strong>￥{{ formatPrice(summary.average_price) }}</strong>
        <div>平均价格</div>
      </div>
    </section>

    <section v-if="!error" class="charts-grid">
      <div class="glass-card chart-card">
        <h3>类目分布</h3>
        <div v-for="item in summary.category_distribution" :key="item.name" class="metric-row">
          <div class="metric-head">
            <span>{{ item.name }}</span>
            <span>{{ item.value }}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill orange" :style="{ width: toPercent(item.value, maxCategoryValue) }"></div>
          </div>
        </div>
      </div>

      <div class="glass-card chart-card">
        <h3>热门文本查询</h3>
        <div v-if="summary.hot_queries.length === 0" class="muted">当前还没有足够的文本查询记录。</div>
        <div v-for="item in summary.hot_queries" :key="item.name" class="metric-row">
          <div class="metric-head">
            <span>{{ item.name }}</span>
            <span>{{ item.value }}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill brown" :style="{ width: toPercent(item.value, maxQueryValue) }"></div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="!error" class="charts-grid">
      <div class="glass-card chart-card">
        <h3>风格分布</h3>
        <div v-for="item in summary.style_distribution" :key="item.name" class="metric-row">
          <div class="metric-head">
            <span>{{ item.name }}</span>
            <span>{{ item.value }}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill green" :style="{ width: toPercent(item.value, maxStyleValue) }"></div>
          </div>
        </div>
      </div>

      <div class="glass-card chart-card">
        <h3>最近查询记录</h3>
        <ul class="logs">
          <li v-for="log in summary.recent_logs" :key="log.created_at + '-' + log.query">
            <div><strong>{{ log.query_type === 'image' ? '图片检索' : '文本检索' }}</strong></div>
            <div class="muted query-line">{{ log.query }}</div>
            <div class="muted time-line">{{ log.created_at }}</div>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AnalyticsPage',
  data() {
    return {
      summary: {
        total_products: 0,
        total_categories: 0,
        total_searches: 0,
        average_price: 0,
        category_distribution: [],
        hot_queries: [],
        style_distribution: [],
        recent_logs: []
      },
      error: ''
    }
  },
  computed: {
    maxCategoryValue() {
      return this.maxValue(this.summary.category_distribution)
    },
    maxQueryValue() {
      return this.maxValue(this.summary.hot_queries)
    },
    maxStyleValue() {
      return this.maxValue(this.summary.style_distribution)
    }
  },
  mounted() {
    this.loadSummary()
  },
  methods: {
    formatPrice(value) {
      return Number(value || 0).toFixed(2)
    },
    maxValue(list) {
      if (!list.length) {
        return 1
      }
      return Math.max.apply(null, list.map(function (item) { return item.value || 0 }))
    },
    toPercent(value, max) {
      if (!max) {
        return '0%'
      }
      return ((value / max) * 100).toFixed(2) + '%'
    },
    loadSummary() {
      this.$axios.get('/api/analytics/summary').then((response) => {
        this.summary = response.data.data || this.summary
      }).catch((error) => {
        this.error = (error.response && error.response.data && error.response.data.detail) || error.message || '统计接口调用失败，请确认后端已启动。'
      })
    }
  }
}
</script>

<style scoped>
.analytics-page {
  max-width: 1220px;
  margin: 0 auto;
  padding: 28px 18px 44px;
}

.header,
.stat-card,
.chart-card,
.error-card {
  border-radius: 22px;
}

.header {
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.header-title {
  display: block;
  font-size: 1.3rem;
  margin-bottom: 6px;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.stats-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  padding: 20px;
}

.stat-card strong {
  display: block;
  font-size: 2rem;
  margin-bottom: 8px;
}

.charts-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.chart-card,
.error-card {
  padding: 20px;
}

.chart-card h3 {
  margin-top: 0;
}

.metric-row {
  margin-top: 14px;
}

.metric-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.bar-track {
  height: 12px;
  border-radius: 999px;
  background: rgba(47, 36, 31, 0.08);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
}

.bar-fill.orange {
  background: linear-gradient(90deg, #d47f49, #b95f35);
}

.bar-fill.brown {
  background: linear-gradient(90deg, #b98c62, #7d5a41);
}

.bar-fill.green {
  background: linear-gradient(90deg, #89a66d, #5f7c4c);
}

.logs {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
}

.logs li {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(47, 36, 31, 0.08);
}

.muted {
  color: #6b5a4d;
}

.query-line {
  margin-top: 6px;
}

.time-line {
  margin-top: 6px;
  font-size: 0.9rem;
}

.error-card {
  margin-top: 20px;
  color: #a33a2a;
}

@media (max-width: 960px) {
  .stats-grid,
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
