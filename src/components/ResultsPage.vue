<template>
  <div class="results-page page-shell">
    <div class="topbar glass-card">
      <div>
        <strong class="page-title">Project1 推荐结果页</strong>
        <div class="page-desc">第一版已经接入真实后端接口，不再使用随机模拟数据。</div>
      </div>
      <div class="quick-links">
        <router-link class="action-btn secondary" to="/">返回首页</router-link>
        <router-link class="action-btn secondary" to="/analytics">查看统计页</router-link>
      </div>
    </div>

    <section class="summary glass-card">
      <div class="score-badge">{{ queryTypeLabel }}</div>
      <h1 class="query-title">{{ queryTitle }}</h1>
      <p class="query-reason">{{ recommendationReason }}</p>
      <div class="summary-grid">
        <div class="summary-panel">
          <strong>系统理解</strong>
          <p>{{ systemNote }}</p>
          <div class="summary-meta">
            共返回 {{ filteredProducts.length }} 件候选商品，当前排序方式：{{ sortLabel }}
          </div>
        </div>
        <div v-if="queryImagePreview" class="summary-panel">
          <strong>上传图片预览</strong>
          <img :src="queryImagePreview" alt="查询图片">
        </div>
      </div>
    </section>

    <section class="layout">
      <aside class="sidebar glass-card">
        <h3>筛选与排序</h3>
        <label>排序方式</label>
        <select v-model="sortBy">
          <option value="score">按匹配度</option>
          <option value="price-asc">价格从低到高</option>
          <option value="price-desc">价格从高到低</option>
        </select>

        <label>类目筛选</label>
        <select v-model="selectedCategory">
          <option value="">全部类目</option>
          <option v-for="item in categoryOptions" :key="item" :value="item">{{ item }}</option>
        </select>

        <label>品牌筛选</label>
        <select v-model="selectedBrand">
          <option value="">全部品牌</option>
          <option v-for="item in brandOptions" :key="item" :value="item">{{ item }}</option>
        </select>

        <label>最高价格</label>
        <input v-model.number="maxPrice" type="number" min="0" placeholder="例如 250">

        <div class="filter-actions">
          <button class="action-btn primary" @click="reloadSearch">重新查询</button>
          <button class="action-btn secondary" @click="resetFilters">重置</button>
        </div>
      </aside>

      <main>
        <div class="toolbar">
          <small>接口地址：{{ apiBase }}/api/recommend/*</small>
          <small v-if="lastUpdated">最近更新：{{ lastUpdated }}</small>
        </div>

        <div v-if="loading" class="state-card">正在请求后端接口，请稍候...</div>
        <div v-else-if="error" class="state-card error-card">{{ error }}</div>
        <div v-else-if="filteredProducts.length === 0" class="state-card">当前筛选条件下没有商品，试试重置筛选或换一个查询词。</div>
        <div v-else class="result-grid">
          <article v-for="item in filteredProducts" :key="item.product_id" class="product-card glass-card">
            <img :src="resolveImage(item.image_url)" :alt="item.name">
            <div class="card-body">
              <div class="meta">
                <span>{{ item.brand }} / {{ item.category }}</span>
                <span class="score-badge">{{ item.similarity }}%</span>
              </div>
              <h3>{{ item.name }}</h3>
              <div class="meta">
                <span>￥{{ formatPrice(item.price) }}</span>
                <span>综合分 {{ formatScore(item.score) }}</span>
              </div>
              <div class="tags">
                <span class="tag">{{ item.attributes.color }}</span>
                <span class="tag">{{ item.attributes.style }}</span>
                <span class="tag">{{ item.attributes.material }}</span>
                <span class="tag">{{ item.attributes.pattern }}</span>
              </div>
              <p class="reason">{{ item.reason }}</p>
            </div>
          </article>
        </div>
      </main>
    </section>
  </div>
</template>

<script>
var API_BASE = 'http://127.0.0.1:8000'

export default {
  name: 'ResultsPage',
  data() {
    return {
      apiBase: API_BASE,
      loading: true,
      error: '',
      items: [],
      recommendationReason: '等待查询结果中...',
      queryType: '',
      queryTitle: '未检测到查询内容',
      queryImagePreview: '',
      systemNote: '第一版先完成真实接口返回和页面联调，后续再替换为 YOLO、图谱和向量检索。',
      lastUpdated: '',
      sortBy: 'score',
      selectedCategory: '',
      selectedBrand: '',
      maxPrice: null
    }
  },
  computed: {
    queryTypeLabel() {
      return this.queryType === 'image' ? '图片检索' : '文本检索'
    },
    sortLabel() {
      if (this.sortBy === 'price-asc') return '价格从低到高'
      if (this.sortBy === 'price-desc') return '价格从高到低'
      return '按匹配度'
    },
    categoryOptions() {
      return Array.from(new Set(this.items.map(function (item) { return item.category })))
    },
    brandOptions() {
      return Array.from(new Set(this.items.map(function (item) { return item.brand })))
    },
    filteredProducts() {
      var products = this.items.slice()
      if (this.selectedCategory) {
        products = products.filter((item) => item.category === this.selectedCategory)
      }
      if (this.selectedBrand) {
        products = products.filter((item) => item.brand === this.selectedBrand)
      }
      if (this.maxPrice) {
        products = products.filter((item) => item.price <= this.maxPrice)
      }
      if (this.sortBy === 'price-asc') {
        products.sort(function (a, b) { return a.price - b.price })
      } else if (this.sortBy === 'price-desc') {
        products.sort(function (a, b) { return b.price - a.price })
      } else {
        products.sort(function (a, b) { return b.score - a.score })
      }
      return products
    }
  },
  mounted() {
    this.reloadSearch()
  },
  methods: {
    formatPrice(value) {
      return Number(value || 0).toFixed(2)
    },
    formatScore(value) {
      return Number(value || 0).toFixed(2)
    },
    resolveImage(url) {
      if (!url) return this.apiBase + '/static/placeholder-product.svg'
      if (url.indexOf('http') === 0) return url
      return this.apiBase + url
    },
    resetFilters() {
      this.sortBy = 'score'
      this.selectedCategory = ''
      this.selectedBrand = ''
      this.maxPrice = null
    },
    reloadSearch() {
      this.loading = true
      this.error = ''
      var mode = localStorage.getItem('project1_search_mode') || 'text'
      var task = mode === 'image' ? this.fetchByImage() : this.fetchByText()
      Promise.resolve(task).then(() => {
        this.lastUpdated = new Date().toLocaleString()
      }).catch((error) => {
        this.error = (error.response && error.response.data && error.response.data.detail) || error.message || '查询失败，请确认后端已启动。'
      }).finally(() => {
        this.loading = false
      })
    },
    fetchByText() {
      var query = localStorage.getItem('project1_search_keyword') || '白色复古连衣裙'
      this.queryType = 'text'
      this.queryTitle = '文本查询：' + query
      this.queryImagePreview = ''
      return this.$axios.post('/api/recommend/by-text', {
        query: query,
        top_k: 8
      }).then((response) => {
        var payload = response.data.data || {}
        this.items = payload.items || []
        this.recommendationReason = payload.recommendation_reason || '系统已完成文本推荐。'
        this.systemNote = '当前评分由文本语义、类目、颜色、风格和材质等规则综合得到。'
      })
    },
    fetchByImage() {
      var dataUrl = sessionStorage.getItem('project1_search_image_data')
      var originalName = sessionStorage.getItem('project1_search_image_name') || 'upload.jpg'
      if (!dataUrl) {
        return Promise.reject(new Error('没有找到上传图片，请返回首页重新上传。'))
      }
      this.queryType = 'image'
      this.queryTitle = '图片查询：' + originalName
      this.queryImagePreview = dataUrl
      var formData = new FormData()
      formData.append('file', this.dataUrlToFile(dataUrl, originalName))
      formData.append('top_k', '8')
      return this.$axios.post('/api/recommend/by-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then((response) => {
        var payload = response.data.data || {}
        this.items = payload.items || []
        this.recommendationReason = payload.recommendation_reason || '系统已完成图片推荐。'
        var profile = payload.image_profile || {}
        this.systemNote = '当前图片推荐使用第一版 YOLO 占位层：已提取主色调 ' +
          (profile.dominant_color || '未知') +
          (profile.inferred_category ? ('，同时猜测类目为 ' + profile.inferred_category) : '') +
          '。'
      })
    },
    dataUrlToFile(dataUrl, fileName) {
      var parts = dataUrl.split(',')
      var mime = parts[0].match(/:(.*?);/)[1]
      var binary = atob(parts[1])
      var length = binary.length
      var array = new Uint8Array(length)
      while (length--) {
        array[length] = binary.charCodeAt(length)
      }
      return new File([array], fileName, { type: mime })
    }
  }
}
</script>

<style scoped>
.results-page {
  max-width: 1240px;
  margin: 0 auto;
  padding: 26px 18px 46px;
}

.topbar,
.summary,
.sidebar,
.product-card {
  border-radius: 22px;
}

.topbar {
  padding: 18px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.1rem;
}

.page-desc,
.query-reason,
.summary-panel p,
.summary-meta,
.toolbar small,
.meta {
  color: #6b5a4d;
}

.summary {
  margin-top: 20px;
  padding: 24px;
}

.query-title {
  margin: 12px 0 8px;
  font-size: 2rem;
}

.query-reason {
  margin: 0;
  line-height: 1.8;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 18px;
  align-items: start;
  margin-top: 14px;
}

.summary-panel {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255,255,255,0.74);
  border: 1px solid rgba(47, 36, 31, 0.08);
}

.summary-panel img {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
  max-height: 280px;
  margin-top: 12px;
}

.layout {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 18px;
}

.sidebar {
  padding: 20px;
  align-self: start;
  position: sticky;
  top: 18px;
}

.sidebar h3 {
  margin-top: 0;
}

.sidebar select,
.sidebar input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(47, 36, 31, 0.12);
  background: white;
  margin-top: 6px;
  margin-bottom: 12px;
}

.filter-actions,
.quick-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-actions {
  margin-top: 16px;
}

.filter-actions .action-btn {
  flex: 1;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.product-card {
  overflow: hidden;
}

.product-card img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  background: #f2ece3;
}

.card-body {
  padding: 18px;
}

.card-body h3 {
  margin: 0 0 10px;
  font-size: 1.08rem;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 0.92rem;
}

.score-badge,
.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.88rem;
}

.score-badge {
  background: rgba(185, 95, 53, 0.1);
  color: var(--accent-color);
  font-weight: 700;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.tag {
  background: rgba(47, 36, 31, 0.06);
}

.reason {
  margin: 10px 0 0;
  line-height: 1.7;
  color: #57453a;
  font-size: 0.94rem;
}

.state-card {
  padding: 28px;
  text-align: center;
  border-radius: 18px;
  background: rgba(255,255,255,0.72);
  border: 1px dashed rgba(47, 36, 31, 0.16);
}

.error-card {
  color: #a33a2a;
}

@media (max-width: 960px) {
  .summary-grid,
  .layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}
</style>
