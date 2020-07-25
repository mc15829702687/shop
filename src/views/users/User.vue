<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 主体内容区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" @clear="getUserList()" clearable v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="search()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeStatus(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetUserDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 7]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户弹框 -->
    <el-dialog title="添加用户" :visible.sync="addVisible" width="50%" @close="addDialogClose()">
      <!-- 添加用户表单 -->
      <el-form
        :model="addUserForm"
        label-width="80px"
        ref="addUserFormRef"
        :rules="addUserFormRules"
      >
        <el-form-item label="姓名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户弹框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <!-- 添加用户表单 -->
      <el-form :model="editForm" label-width="80px" ref="editFormRef" :rules="editFormRules">
        <el-form-item label="姓名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormInfo()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色弹框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setUserdialogVisible"
      width="50%"
      @close="setUserClosed()"
    >
      <div>
        <p>当前的用户：{{curName}}</p>
        <p>当前的角色：{{curRoleName}}</p>
        <p>
          分配新角色：
          <el-select v-model="setUserVal" placeholder="请选择">
            <el-option
              v-for="item in setUserOptions"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setUserdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setUserInfo()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const checkEmail = (rule, value, cb) => {
  const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
  // 验证邮箱的正则表达式
  if (regEmail.test(value)) {
    // 合法的邮箱
    return cb();
  }

  cb(new Error("请输入合法的邮箱"));
};
const checkMobile = (rule, value, cb) => {
  // 验证手机号的正则表达式
  const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

  if (regMobile.test(value)) {
    return cb();
  }

  cb(new Error("请输入合法的手机号"));
};

export default {
  created() {
    this.getUserList();
  },
  data() {
    return {
      // 用户列表信息参数
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      addVisible: false,
      // 添加用户的表单
      addUserForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 校验规则
      addUserFormRules: {
        username: [
          { required: true, message: "请输入姓名", trigger: "blur" },
          { min: 5, max: 10, message: "长度在 5 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 10, message: "长度在 6 到 10 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入电话号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },

      // 修改用户表单信息
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入电话号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },

      // 控制分配角色弹框显示隐藏
      setUserdialogVisible: false,
      // 下拉框的值
      setUserVal: "",
      setUserOptions: [],
      // 当前的用户
      curName: "",
      // 当前角色
      curRoleName: "",
      // 用户角色id
      userId: ""
    };
  },
  methods: {
    // 获取用户列表信息
    async getUserList() {
      let { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        this.$message.error("获取用户列表信息错误！");
        return;
      }

      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 改变开关状态
    async changeStatus(row) {
      let { data: res } = await this.$http.put(
        `users/${row.id}/state/${row.mg_state}`
      );
      if (res.meta.status !== 200) {
        this.$message.error("用户状态修改失败!");
        return;
      }
      this.$message.success("用户状态修改成功");
      this.getUserList();
    },

    // 搜索功能
    search() {
      this.getUserList();
    },

    // 分页
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize;
      this.getUserList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 添加用户
    addUser() {
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) return;
        let { data: res } = await this.$http.post("users", this.addUserForm);
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg);
        }

        this.$message.success(res.meta.msg);
        this.addVisible = false;

        this.getUserList();
      });
    },

    // 监听添加用户弹框关闭事件
    addDialogClose() {
      this.$refs.addUserFormRef.resetFields();
    },

    // 监听 修改用户事件
    async showEditDialog(id) {
      let { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200)
        return this.$message.error("修改数据获取错误!");

      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 监听修改用户弹框关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    editFormInfo() {
      this.$refs.editFormRef.validate(async valid => {
        let { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          this.editForm
        );
        if (res.meta.status !== 200) return this.$message.error("更新失败!");

        this.editDialogVisible = false;
        this.getUserList();
      });
    },

    // 删除单个用户
    async deleteUser(id) {
      let confirm = await this.$confirm(
        "此操作将永久该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirm === "cancel") return this.$message.info("取消删除");
      let { data: res } = await this.$http.delete("users/" + id);
      // 删除失败
      if (res.meta.status !== 200) return this.$message.error("删除失败!");
      this.$message.success("删除成功!");
      this.getUserList();
    },

    // 分配角色弹框显示
    async showSetUserDialog(role) {
      this.userId = role.id;
      this.curName = role.username;
      this.curRoleName = role.role_name;

      let { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色数据失败!");
      this.setUserOptions = res.data;
      this.setUserdialogVisible = true;
    },

    // 分配角色确认
    async setUserInfo() {
      if (!this.setUserVal) {
        return this.$message.success("请选择分配的角色!");
      }
      let { data: res } = await this.$http.put(`users/${this.userId}/role`, {
        rid: this.setUserVal
      });
      if (res.meta.status !== 200) return this.$message.error("分配角色失败");
      this.setUserdialogVisible = false;
      this.$message.success("分配角色成功！");
      this.getUserList();
    },

    // 监听分配角色关闭事件
    setUserClosed() {
      this.setUserVal = "";
    }
  }
};
</script>

<style>
</style>