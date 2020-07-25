<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 主体内容 -->
    <el-card>
      <!-- 警告信息 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类 -->
      <el-row>
        <el-col>
          <label for>选择商品分类：</label>
          <el-cascader
            v-model="cateListKeys"
            :options="cateListOptions"
            :props="cateListProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="cateTabsClick()">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isDisabled"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  closable
                  :key="index"
                  @close="deleteSingleTag(scope.row, index)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.newTagVisible"
                  v-model="newTagValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit">修改</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isDisabled"
            @click="addDialogVisible=true"
          >添加属性</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  closable
                  :key="index"
                  @close="deleteSingleTag(scope.row, index)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.newTagVisible"
                  v-model="newTagValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit">修改</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加属性 -->
    <el-dialog
      :title="'添加' + dialogTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addClosed()"
    >
      <!-- 表单信息 -->
      <el-form ref="addRef" :model="addForm" label-width="80px" :rules="addRules">
        <el-form-item :label="dialogTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFormInfo()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateListKeys: [],
      cateListOptions: [],
      // 格式
      cateListProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      // 激活的标签页值
      activeName: "many",
      // 控制添加弹框的显示与隐藏
      addDialogVisible: false,
      // 表单信息
      addForm: {
        attr_name: ""
      },
      addRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      // 动态参数表格数据
      manyTableData: [],
      // new tag数值
      newTagValue: ""
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        this.$message.error("商品分类数据获取错误！");
      this.cateListOptions = res.data;
      console.log(this.cateListOptions);
    },
    // 获取表格数据
    async getTableData() {
      const { data: res } = await this.$http.get(
        `categories/${this.paramsId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      );
      if (res.meta.status !== 200) this.$message.error("参数列表数据获取失败");

      res.data.forEach(val => {
        val.attr_vals !== ""
          ? (val.attr_vals = val.attr_vals.split(" "))
          : (val.attr_vals = []);
        val.newTagVisible = false;
      });
      this.manyTableData = res.data;
    },
    // 级联选择框选择事件
    handleChange() {
      if (this.cateListKeys.length !== 3) {
        this.cateListKeys = [];
        this.manyTableData = [];
        return;
      }
      this.getTableData();
    },

    // 确认添加
    addFormInfo() {
      this.$refs.addRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.paramsId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) this.$message.error("创建失败！");
        this.$message.success("创建成功！");
        this.addDialogVisible = false;
        this.getTableData();
      });
    },
    // 关闭弹框
    addClosed() {
      this.$refs.addRef.resetFields();
    },
    // 标签页切换
    cateTabsClick() {
      if (this.cateListKeys.length === 3) this.getTableData();
    },
    async changeTagsData(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.paramsId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(" ")
        }
      );
      if (res.meta.status !== 200) this.$message.error("删除标签失败！");
    },
    // 删除单个标签
    deleteSingleTag(row, index) {
      row.attr_vals.splice(index, 1);
      this.changeTagsData(row);
    },
    // 点击new Tag按钮
    showInput(row) {
      row.newTagVisible = true;

      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 失焦或回车事件
    handleInputConfirm(row) {
      if (this.newTagValue.length === 0) {
        this.newTagValue = "";
        row.newTagVisible = false;
        return;
      }
      row.attr_vals.push(this.newTagValue.trim());
      this.changeTagsData(row);
      this.newTagValue = "";
      row.newTagVisible = false;
    }
  },
  computed: {
    isDisabled() {
      return this.cateListKeys.length !== 3 ? true : false;
    },
    dialogTitle() {
      return this.activeName === "many" ? "动态参数" : "静态属性";
    },
    paramsId() {
      return this.cateListKeys.length === 3 ? this.cateListKeys[2] : "";
    }
  }
};
</script>

<style lang="scss" scoped>
.el-alert {
  margin: 15px 0;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 150px;
}
</style>