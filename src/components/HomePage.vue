<template>
  <div class="home-page page-shell">
    <section class="hero">
      <div class="hero-main glass-card">
        <span class="eyebrow">Project1 / Vue2 First Version</span>
        <h1>逐步接入 YOLO、图谱和向量检索（更新中...）</h1>
        <p class="subtext">
          这一版系统先解决演示问题。从文本检索或图片检索进入推荐结果页，
          后端提供了 API、演示商品数据和基础推荐逻辑，后面再继续替换成数据库、图谱和真实 YOLO 检测。
        </p>
        <div class="mini-grid">
          <div class="mini-card">
            <strong>FastAPI</strong>
            <span>后端接口</span>
          </div>
          <div class="mini-card">
            <strong>15 条</strong>
            <span>演示商品</span>
          </div>
          <div class="mini-card">
            <strong>已预留</strong>
            <span>YOLO 接入位</span>
          </div>
        </div>
      </div>

      <aside class="hero-side glass-card">
        <h2>当前版本包含</h2>
        <div class="tip-card">文本推荐接口已可用，适合先验证结果页和推荐理由展示。</div>
        <div class="tip-card">图片推荐接口已可用，当前使用主色调分析与类目猜测作为 YOLO 占位层。</div>
        <div class="tip-card">统计分析页已可用，能展示商品分布和查询记录。</div>
      </aside>
    </section>

    <section class="panel glass-card">
      <h2>第一版系统体验</h2>
      <div class="search-grid">
        <div class="search-card">
          <label class="label" for="keyword">文本语义检索</label>
          <div class="search-row">
            <input
              id="keyword"
              v-model="keyword"
              type="text"
              placeholder="例如：白色复古连衣裙 / 蓝色通勤衬衫"
              @keyup.enter="searchByKeyword"
            >
            <button class="action-btn primary" @click="searchByKeyword">查询推荐</button>
          </div>
          <div class="nav-actions">
            <button class="action-btn secondary" @click="fillDemo('白色复古连衣裙')">试试：白色复古连衣裙</button>
            <button class="action-btn secondary" @click="fillDemo('蓝色通勤衬衫')">试试：蓝色通勤衬衫</button>
          </div>
          <div class="status">{{ statusText }}</div>
        </div>

        <div class="search-card">
          <label class="label">图片检索</label>
          <div class="upload-box">
            <p>上传一张商品图片，第一版会先做图片保存与主色调分析。</p>
            <input ref="fileInput" type="file" accept="image/*" @change="handleFileUpload">
            <img v-if="imagePreview" :src="imagePreview" alt="预览图">
          </div>
        </div>
      </div>

      <div class="tips-grid">
        <div class="tip-card">先验证文本查询、结果展示和推荐理由这条主链路。</div>
        <div class="tip-card">如果图片查询能返回列表，再考虑后面替换成 YOLO。</div>
        <div class="tip-card">统计页中的查询记录会随着使用接口更新。</div>
      </div>

      <div class="nav-actions">
        <router-link class="action-btn primary" to="/auth">登录 / 注册</router-link>
        <router-link class="action-btn secondary" to="/results">直接打开结果页</router-link>
        <router-link class="action-btn secondary" to="/analytics">查看统计分析</router-link>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      keyword: '',
      imagePreview: '',
      statusText: '先从文本检索开始，把前后端跑通。'
    }
  },
  methods: {
    fillDemo(text) {
      this.keyword = text
      this.statusText = '已填充示例查询：' + text
    },
    searchByKeyword() {
      var query = (this.keyword || '').trim()
      if (!query) {
        this.statusText = '请输入查询词后再搜索。'
        return
      }
      localStorage.setItem('project1_search_mode', 'text')
      localStorage.setItem('project1_search_keyword', query)
      sessionStorage.removeItem('project1_search_image_data')
      sessionStorage.removeItem('project1_search_image_name')
      this.$router.push('/results')
    },
    handleFileUpload(event) {
      var file = event.target.files[0]
      if (!file) {
        return
      }
      var reader = new FileReader()
      reader.onload = (loadEvent) => {
        this.imagePreview = loadEvent.target.result
        localStorage.setItem('project1_search_mode', 'image')
        sessionStorage.setItem('project1_search_image_data', this.imagePreview)
        sessionStorage.setItem('project1_search_image_name', file.name)
        this.statusText = '已选择图片：' + file.name + '，即将进入结果页。'
        setTimeout(() => {
          this.$router.push('/results')
        }, 400)
      }
      reader.readAsDataURL(file)
    }
  }
}
</script>

<style scoped>
.home-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 20px 48px;
}

.hero {
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;
  gap: 24px;
  align-items: stretch;
}

.hero-main,
.hero-side,
.panel {
  border-radius: 24px;
}

.hero-main {
  padding: 40px;
}

.hero-side {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  justify-content: center;
}

.hero-side h2,
.panel h2 {
  margin-top: 0;
}

.eyebrow {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(185, 95, 53, 0.1);
  color: var(--accent-color);
  font-weight: 600;
  margin-bottom: 20px;
}

h1 {
  margin: 0 0 16px;
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.subtext {
  margin: 0;
  color: #6c5a4c;
  font-size: 1.05rem;
  line-height: 1.8;
  max-width: 90%;
}

.mini-grid,
.tips-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 24px;
}

.mini-card,
.tip-card,
.search-card {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(47, 36, 31, 0.08);
  line-height: 1.7;
}

.mini-card strong {
  display: block;
}

.panel {
  margin-top: 24px;
  padding: 28px;
}

.search-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 20px;
  margin-top: 18px;
}

.label {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 12px;
  display: block;
}

.search-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

input[type="text"] {
  flex: 1;
  min-width: 240px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(47, 36, 31, 0.14);
  font-size: 1rem;
}

.upload-box {
  border: 1px dashed rgba(47, 36, 31, 0.2);
  border-radius: 18px;
  padding: 18px;
  text-align: center;
  background: rgba(247, 241, 234, 0.72);
}

.upload-box p {
  margin: 0 0 10px;
}

.upload-box img {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 14px;
  margin-top: 12px;
}

.nav-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.status {
  margin-top: 12px;
  color: #8a5b2f;
  font-size: 0.95rem;
}

@media (max-width: 900px) {
  .hero,
  .search-grid,
  .tips-grid,
  .mini-grid {
    grid-template-columns: 1fr;
  }

  .hero-main,
  .hero-side,
  .panel {
    padding: 24px;
  }

  .subtext {
    max-width: 100%;
  }
}
</style>
