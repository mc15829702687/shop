import Vue from 'vue'
import VueRouter from 'vue-router'
// 进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const Login = () => import( /* webpackChunkName: "group-login-main-welcome" */ 'views/Login')
const Main = () => import( /* webpackChunkName: "group-login-main-welcome" */ 'views/Main')
const Welcome = () => import( /* webpackChunkName: "group-login-main-welcome" */ 'views/Welcome')

// 导入用户页面组件
const User = () => import( /* webpackChunkName: "group-user" */ 'views/users/User')

const Right = () => import( /* webpackChunkName: "group-power" */ 'views/power/Right')
const Roles = () => import( /* webpackChunkName: "group-power" */ 'views/power/Roles')

const Cate = () => import( /* webpackChunkName: "group-goods" */ 'views/goods/Catergory')
const Params = () => import( /* webpackChunkName: "group-goods" */ 'views/goods/Params')
const Goods = () => import( /* webpackChunkName: "group-goods" */ 'views/goods/Goods')
const Add = () => import( /* webpackChunkName: "group-goods" */ 'views/goods/Add')

const Order = () => import( /* webpackChunkName: "group-orders" */ 'views/orders/Order')
const Report = () => import( /* webpackChunkName: "group-report" */ 'views/report/Reports')

Vue.use(VueRouter)

const routes = [{
    path: '',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/main',
    component: Main,
    redirect: '/welcome',
    children: [{
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: User
      },
      {
        path: '/rights',
        component: Right
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: Goods
      },
      {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/orders',
        component: Order
      },
      {
        path: '/reports',
        component: Report
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 导航守卫来拦截直接跳转主页面
router.beforeEach((to, from, next) => {
  
  NProgress.start()
  // 打开的页面是登录页
  if (to.path === '/login') {
    next();
    return;
  }

  let token = window.sessionStorage.getItem('token');
  // 没有token跳转到登录页
  if (!token) {
    next('/login');
    return;
  }
  next();
});
router.afterEach((to, from) => {
  NProgress.done()
})

export default router