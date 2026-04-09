// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
// 引入axios
import axios from 'axios'
import ElementUI from 'element-ui';
import './components/styles.css'

import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

// 配置服务器请求前缀
axios.defaults.baseURL = "https://recommendserver-920l.onrender.com";
// 设置cookie,session跨域配置,后端允许源必须写明
axios.defaults.withCredentials=true;
// 设置post请求数据格式
axios.defaults.headers.post['Content-Type'] = 'application/json'
// 设置put请求数据格式
axios.defaults.headers.put['Content-Type'] = 'application/json'
// 设置全局 axios 写法
Vue.prototype.$axios = axios

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
