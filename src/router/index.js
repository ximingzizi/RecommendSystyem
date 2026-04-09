import Vue from 'vue'
import Router from 'vue-router'
import HomePage from '@/components/HomePage'
import ResultsPage from '@/components/ResultsPage'
import AnalyticsPage from '@/components/AnalyticsPage'
import AuthPage from '@/components/AuthPage'

Vue.use(Router)

export default new Router({
  mode: 'history',

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthPage
    },
    {
      path: '/results',
      name: 'results',
      component: ResultsPage
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: AnalyticsPage
    },
    // {
    //   path: '*',
    //   redirect: '/'
    // }
  ]
})
