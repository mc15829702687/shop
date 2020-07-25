<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像 -->
      <div class="avatar-box">
        <img src="../assets/logo.png" alt class="img" />
      </div>

      <!-- 登录表单 -->
      <el-form
        label-width="0"
        class="loginForm"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginForm"
      >
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-setting" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item class="loginFormBtns">
          <el-button type="primary" class="signIn" @click="signIn()">登录</el-button>
          <el-button type="info" @click="reset()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表单信息
      loginForm: {
        username: "admin",
        password: "123456"
      },

      // 校验规则
      loginFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 5, max: 10, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    reset() {
      this.$refs.loginForm.resetFields();
    },
    signIn() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) return;
        this.$http.post("login", this.loginForm).then(res => {
          if (res.data.meta.status !== 200) {
            this.$message({
              showClose: true,
              message: "登录失败",
              type: "error"
            });
            return;
          }

          this.$message({
            showClose: true,
            message: "登录成功",
            type: "success"
          });
          let { data } = res.data;
          // 存储token
          window.sessionStorage.setItem("token", data.token);
          // 跳转主页面
          this.$router.push("main");
        });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: #264a6b;
  width: 100%;

  .login-box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: relative;

    // 头像
    .avatar-box {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background-color: #fff;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 10px;
      border: 1px solid #eee;
      box-shadow: 0 0 10px #eee;

      .img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eceeeb;
      }
    }

    // 登录表单
    .loginForm {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;

      .loginFormBtns {
        display: flex;
        justify-content: flex-end;

        .signIn {
          margin-right: 10px;
        }
      }
    }
  }
}
</style>