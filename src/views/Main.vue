<template>
  <el-container class="main-container">
    <!-- 头部导航栏 -->
    <el-header>
      <div class="logo-box">
        <img src="../assets/images/heima.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <!-- 退出按钮 -->
      <el-button type="info" @click="signOut()">退出</el-button>
    </el-header>
    <!-- 主体容器 -->
    <el-container>
      <!-- 侧边栏 - -->
  
      <el-aside :width="getCollapseWidth">
        <!-- 收缩按钮 -->
        <div class="collapse-box" @click="collapse()">|||</div>
        <!-- 左侧列表菜单栏 -->
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#4f90e6"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <!-- 一级菜单图标 -->
              <i :class="iconList[item.id]"></i>
              <!-- 一级菜单文字 -->
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="getActivePath(subItem.path)"
            >
              <template slot="title">
                <!-- 二级菜单图标 -->
                <i class="el-icon-menu"></i>
                <!-- 二级菜单文字 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体页面 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconList: {
        "125": "iconfont icon-user",
        "103": "iconfont icon-tijikongjian",
        "101": "iconfont icon-shangpin",
        "102": "iconfont icon-danju",
        "145": "iconfont icon-baobiao"
      },
      isCollapse: false,
      activePath: ''
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath');
  },
  methods: {
    /**
     *  @description: 退出
     *  @method: signOut
     *  @param: null
     *  @return: void
     */
    signOut() {
      window.sessionStorage.removeItem("token");
      this.$router.push("/login");
    },

    /**
     *  @description: 获取左侧菜单栏数据
     *  @method: getMenuList
     *  @param: null
     *  @return: void
     */
    async getMenuList() {
      let _this = this;
      await this.$http.get("menus").then(data => {
        let { data: res } = data.data;
        _this.menuList = res;
      });
    },

    /**
     *  @description: 点击收缩按钮
     *  @method: collapse
     *  @param: null
     *  @return: void
     */
    collapse() {
      this.isCollapse = !this.isCollapse;
    },

    /**
     *  @description: 获取菜单激活的路径
     *  @method: getActivePath
     *  @param: path
     *  @return: void
     */
    getActivePath(path) {
      window.sessionStorage.setItem('activePath', path);
      this.activePath = path;
    }
  },
  computed: {
    /**
     *  @description: 获取左侧栏收缩的宽度
     *  @method: signOut
     *  @param: null
     *  @return: void
     */
    getCollapseWidth() {
      return this.isCollapse ? "64px" : "200px";
    }
  }
};
</script>

<style lang="scss" scoped>
.main-container {
  height: 100%;
}
.el-header {
  background-color: #363d40;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 10px;

  .logo-box {
    display: flex;
    align-items: center;

    > span {
      color: #fff;
      padding-left: 10px;
    }
  }
}
.el-aside {
  background-color: #313743;

  // 收缩按钮
  .collapse-box {
    background-color: #475163;
    text-align: center;
    letter-spacing: 2px;
    font-size: 12px;
    color: #fff;
    line-height: 24px;
    cursor: pointer;
  }

  .el-menu {
    border-right: none;
  }

  .iconfont {
    padding-right: 10px;
  }
}
.el-main {
  background-color: #e9edf1;
}
</style>