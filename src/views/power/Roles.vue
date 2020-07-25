<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 主体内容 -->
    <el-card>
      <!-- 添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格信息 -->
      <el-table :data="rolesData" border stripe>
        <el-table-column type="expand">
          <!-- 角色管理展开列表 -->
          <template slot-scope="scope">
            <el-row
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
              :class="['borderBottom', index1 === 0 ? 'borderTop' : '']"
            >
              <!-- 一级权限信息 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 二级权限信息 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  :class="[index2 !==0 ? 'borderTop' : '']"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 三级权限信息 -->
                    <el-tag
                      type="warning"
                      closable
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300">
          <template v-slot="scope">
            <el-button icon="el-icon-edit" type="primary" size="mini">编辑</el-button>
            <el-button icon="el-icon-delete" type="danger" size="mini">删除</el-button>
            <el-button
              icon="el-icon-setting"
              type="warning"
              size="mini"
              @click="setRolesDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog title="提示" 
    :visible.sync="setRolesDialogVisible" 
    width="50%"
    @close="setRolesDialogClosed()"
    >
      <el-tree 
      :data="setRolesData" 
      :props="setRolesProps" 
      show-checkbox
      node-key="id"
      default-expand-all
      :default-checked-keys="defKeys"
      ref="setRolesRef"
    ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRolesInfo()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesData: [],
      // 分配权限弹框显示和隐藏
      setRolesDialogVisible: false,
      // 分配权限数据
      setRolesData: [],
      setRolesProps: {
        label: "authName",
        children: "children"
      },
      // 选中的三级id
      defKeys: [],
      // 角色id
      roleId: ''
    };
  },
  created() {
    this.getRolesData();
  },
  methods: {
    // 获取角色列表信息
    async getRolesData() {
      let { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("角色列表信息获取错误!");
      this.rolesData = res.data;
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      let confirm = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirm === "cancel") return this.$message.info("取消删除");

      let { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) return this.$message.error("删除失败");
      this.$message.success("删除成功!");
      role.children = res.data;
    },

    // 点击分配权限打开对话框
    async setRolesDialog(row) {
      this.roleId = row.id;
      let { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200)
        return this.$message.error("获取树形列表数据错误");

      this.setRolesData = res.data;
      
      this.getLeafKeys(row, this.defKeys);
      
      this.setRolesDialogVisible = true;
    },

    // 关闭分配权限对话框
    setRolesDialogClosed() {
      this.defKeys = [];
    },

    // 角色授权
    async setRolesInfo() {
      let halfCheckedKeys = this.$refs.setRolesRef.getHalfCheckedKeys();
      let checkedKeys = this.$refs.setRolesRef.getCheckedKeys();
      // 以英文逗号分割的id值
      let rids = [...checkedKeys, ...halfCheckedKeys].join(',');
      let {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids});
      if(res.meta.status !== 200) return this.$message.error('分配角色失败!');
      this.$message.success('分配角色成功!');
      this.setRolesDialogVisible = false;
      this.getRolesData();
    },

    // 递归默认节点数
    getLeafKeys(nodes, arr) {
      if(!nodes.children) {
        return arr.push(nodes.id);
      }

      nodes.children.forEach(item => this.getLeafKeys(item, arr));
    }
  }
};
</script>

<style lang="scss" scoped>
.el-row {
  display: flex;
  align-items: center;
}
.el-tag {
  margin: 10px 5px;
}
.borderTop {
  border-top: 1px solid #eee;
}
.borderBottom {
  border-bottom: 1px solid #eee;
}
</style>