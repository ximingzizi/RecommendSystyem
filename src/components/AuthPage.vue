<template>
  <div class="auth-page">
    <section class="auth-hero">
      <div class="hero-copy">
        <p class="eyebrow">Project1 Recommend System</p>
        <h1>统一登录入口，连接推荐、收藏与行为分析</h1>
        <p class="lead">
          当前页面用于前后端认证联调。你可以先完成登录与注册流程，后续再接入验证码、MFA 与更完整的账号安全策略。
        </p>
        <ul class="hero-list">
          <li>登录建议使用 Access Token + Refresh Token 组合。</li>
          <li>注册建议至少配置邮箱或短信验证码，避免批量恶意注册。</li>
          <li>生产环境建议开启登录限流、失败锁定和设备风险识别。</li>
        </ul>
        <div class="hero-actions">
          <router-link class="ghost-btn" to="/">返回系统首页</router-link>
          <router-link class="ghost-btn" to="/results">查看结果页</router-link>
        </div>
      </div>
    </section>

    <section class="auth-workspace">
      <div class="mode-switch" role="tablist" aria-label="登录与注册切换">
        <button type="button" :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</button>
        <button type="button" :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</button>
      </div>

      <form v-if="mode === 'login'" class="auth-form" @submit.prevent="submitLogin">
        <label>
          账号
          <input
            v-model.trim="loginForm.account"
            type="text"
            autocomplete="username"
            placeholder="邮箱或用户名"
          >
        </label>
        <label>
          密码
          <input
            v-model="loginForm.password"
            type="password"
            autocomplete="current-password"
            placeholder="输入密码"
          >
        </label>

        <div class="form-foot">
          <label class="remember-line">
            <input v-model="loginForm.remember" type="checkbox">
            记住我
          </label>
          <span>忘记密码建议走独立重置流程</span>
        </div>

        <button class="submit-btn" :disabled="pending" type="submit">
          {{ pending ? '登录中...' : '登录账号' }}
        </button>
        <p class="status" :class="statusLogin.type">{{ statusLogin.text }}</p>
      </form>

      <form v-else class="auth-form" @submit.prevent="submitRegister">
        <div class="input-grid">
          <label>
            用户名
            <input
              v-model.trim="registerForm.username"
              type="text"
              autocomplete="username"
              placeholder="3-20 位字母数字下划线"
            >
          </label>
          <label>
            邮箱
            <input
              v-model.trim="registerForm.email"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
            >
          </label>
        </div>

        <div class="input-grid">
          <label>
            密码
            <input
              v-model="registerForm.password"
              type="password"
              autocomplete="new-password"
              placeholder="至少 8 位"
            >
          </label>
          <label>
            确认密码
            <input
              v-model="registerForm.confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="再次输入密码"
            >
          </label>
        </div>

        <button class="submit-btn" :disabled="pending" type="submit">
          {{ pending ? '注册中...' : '创建账号' }}
        </button>
        <p class="status" :class="statusRegister.type">{{ statusRegister.text }}</p>
      </form>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AuthPage',
  data() {
    return {
      mode: 'login',
      pending: false,
      loginForm: {
        account: '',
        password: '',
        remember: false
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      statusLogin: {
        type: '',
        text: ''
      },
      statusRegister: {
        type: '',
        text: ''
      }
    }
  },
  methods: {
    switchMode(nextMode) {
      this.mode = nextMode
      this.clearStatus()
    },
    clearStatus() {
      this.statusLogin = { type: '', text: '' }
      this.statusRegister = { type: '', text: '' }
    },
    setStatus(panel, text, type) {
      if (panel === 'login') {
        this.statusLogin = { type: type, text: text }
      } else {
        this.statusRegister = { type: type, text: text }
      }
    },
    async submitLogin() {
      var account = (this.loginForm.account || '').trim()
      var password = this.loginForm.password || ''
      this.clearStatus()

      if (!account || !password) {
        this.setStatus('login', '请填写完整登录信息。', 'warn')
        return
      }

      this.pending = true
      try {
        var response = await this.$axios.post('/api/auth/login', {
          account: account,
          password: password,
          remember: this.loginForm.remember
        })

        if (response && response.data && response.data.code === 0) {
          this.setStatus('login', '登录成功，建议下一步跳转首页或结果页。', 'success')
          return
        }
        this.setStatus('login', '登录失败，请检查账号和密码。', 'error')
      } catch (error) {
        if (error && error.response && error.response.status === 404) {
          this.setStatus('login', '后端暂未实现 /api/auth/login，可先用此页做前端联调。', 'warn')
          return
        }

        var message = '登录失败，请稍后重试。'
        if (error && error.response && error.response.data) {
          message = error.response.data.detail || error.response.data.message || message
        }
        this.setStatus('login', message, 'error')
      } finally {
        this.pending = false
      }
    },
    async submitRegister() {
      var username = (this.registerForm.username || '').trim()
      var email = (this.registerForm.email || '').trim()
      var password = this.registerForm.password || ''
      var confirmPassword = this.registerForm.confirmPassword || ''
      this.clearStatus()

      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        this.setStatus('register', '用户名需为 3-20 位字母、数字或下划线。', 'warn')
        return
      }
      if (!email) {
        this.setStatus('register', '请输入邮箱地址。', 'warn')
        return
      }
      if (password.length < 8) {
        this.setStatus('register', '密码长度至少 8 位。', 'warn')
        return
      }
      if (password !== confirmPassword) {
        this.setStatus('register', '两次输入的密码不一致。', 'warn')
        return
      }

      this.pending = true
      try {
        var response = await this.$axios.post('/api/auth/register', {
          username: username,
          email: email,
          password: password
        })

        if (response && response.data && response.data.code === 0) {
          this.setStatus('register', '注册成功，请使用新账号登录。', 'success')
          this.registerForm = {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
          }
          this.mode = 'login'
          return
        }
        this.setStatus('register', '注册失败，请稍后重试。', 'error')
      } catch (error) {
        if (error && error.response && error.response.status === 404) {
          this.setStatus('register', '后端暂未实现 /api/auth/register，可先用此页做前端联调。', 'warn')
          return
        }

        var message = '注册失败，请稍后重试。'
        if (error && error.response && error.response.data) {
          message = error.response.data.detail || error.response.data.message || message
        }
        this.setStatus('register', message, 'error')
      } finally {
        this.pending = false
      }
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  background:
    radial-gradient(circle at 15% 10%, rgba(255, 206, 153, 0.52), transparent 34%),
    radial-gradient(circle at 86% 20%, rgba(165, 201, 255, 0.42), transparent 42%),
    linear-gradient(130deg, #f8f2e8 0%, #ecf1ff 100%);
  color: #1f2533;
}

.auth-hero {
  display: grid;
  align-items: center;
  padding: 56px 52px;
  border-right: 1px solid rgba(31, 37, 51, 0.12);
}

.hero-copy {
  max-width: 620px;
  animation: fadeUp 0.6s ease both;
}

.eyebrow {
  display: inline-block;
  margin: 0 0 20px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #1255cd;
  background: rgba(18, 85, 205, 0.09);
}

h1 {
  margin: 0;
  font-size: clamp(32px, 4.4vw, 52px);
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.lead {
  margin: 18px 0 0;
  max-width: 36em;
  color: #5a657a;
  line-height: 1.82;
  font-size: 15px;
}

.hero-list {
  margin: 26px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
}

.hero-list li {
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(31, 37, 51, 0.12);
  border-radius: 14px;
  padding: 12px 14px;
  line-height: 1.65;
  font-size: 14px;
  color: #263252;
  transform: translateY(10px);
  opacity: 0;
  animation: reveal 0.45s ease forwards;
}

.hero-list li:nth-child(2) {
  animation-delay: 80ms;
}

.hero-list li:nth-child(3) {
  animation-delay: 140ms;
}

.hero-actions {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(31, 37, 51, 0.12);
  color: #2f3b55;
  transition: all 0.18s ease;
}

.ghost-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.88);
}

.auth-workspace {
  display: grid;
  align-content: center;
  padding: 44px 36px;
  gap: 20px;
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(9px);
}

.mode-switch {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(31, 37, 51, 0.12);
}

.mode-switch button {
  border: none;
  border-radius: 999px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 700;
  color: #55617a;
  background: transparent;
  transition: all 0.18s ease;
}

.mode-switch button.active {
  background: #0f5fe6;
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(15, 95, 230, 0.28);
}

.auth-form {
  display: grid;
  gap: 14px;
}

.input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

label {
  display: grid;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  color: #3b4460;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(31, 37, 51, 0.16);
  padding: 11px 12px;
  font-size: 14px;
  color: #1f2533;
  background: rgba(255, 255, 255, 0.96);
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #0f5fe6;
  box-shadow: 0 0 0 3px rgba(15, 95, 230, 0.16);
}

.form-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: #6c7388;
}

.remember-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.remember-line input {
  width: 16px;
  height: 16px;
}

.submit-btn {
  border: none;
  border-radius: 14px;
  padding: 12px 14px;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
  background: linear-gradient(120deg, #0f5fe6, #307af8);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.submit-btn:hover:enabled {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(15, 95, 230, 0.24);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.status {
  min-height: 20px;
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
}

.status.success {
  color: #0b8447;
}

.status.error {
  color: #cb3030;
}

.status.warn {
  color: #9e551a;
}

@media (max-width: 980px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-hero {
    padding: 36px 24px;
    border-right: none;
    border-bottom: 1px solid rgba(31, 37, 51, 0.12);
  }

  .auth-workspace {
    padding: 30px 20px;
  }

  .input-grid {
    grid-template-columns: 1fr;
  }
}

@keyframes fadeUp {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes reveal {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
