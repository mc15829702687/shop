<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 主体内容 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog()">添加分类按钮</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="cateList" row-key="cat_id" border :tree-props="{children: 'children'}">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="cat_name" label="日期"></el-table-column>
        <el-table-column label="是否有效">
          <template v-slot="scope">
            <i
              class="el-icon-success"
              v-if="scope.row.cat_deleted === false"
              style="color: rgb(32, 178, 170);"
            ></i>
            <i class="el-icon-error" v-else style="color: red;"></i>
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template v-slot="scope">
            <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template v-slot="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 20, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类弹框 -->
    <el-dialog title="添加分类" 
    :visible.sync="addCatedialogVisible" 
    width="50%"
    @close="addCatedialogClosed()"
    >
      <el-form ref="addCateRef" 
      :model="addCateForm" 
      label-width="80px"
      :rules="addCateRules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" ></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="addCateOptions"
            clearable
            :props="{ 
            checkStrictly: true, 
            expandTrigger: 'hover', 
            label: 'cat_name', 
            value: 'cat_id',
            children: 'children' }"
            @change="addCateChange"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateInfo()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类数据
      cateList: [],
      columns: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      // 添加分类弹框
      addCatedialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_level: 0,
        cat_pid: 0
      },
      addCateRules: {
        cat_name: [
           { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 级联下拉框数据
      addCateOptions: [],
      selectedKeys: []
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      let { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("商品分类数据获取错误");
      }
      this.cateList = res.data.result;
      console.log(res.data.result);
      this.total = res.data.total;
    },
    // 监听每页显示几条
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听当前多少页
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 添加分类弹框的显示和隐藏
    async showAddCateDialog() {
      this.queryInfo.type = 2;
      let { data: res } = await this.$http.get("categories",{
        params: this.queryInfo 
      })
    
      if (res.meta.status !== 200) {
        return this.$message.error("商品分类数据获取错误");
      }
      this.addCateOptions = res.data.result;

      this.addCatedialogVisible = true;
    },
    // 确定添加分类 
     addCateInfo() {
      this.$refs.addCateRef.validate(async valid => {
        if(!valid) return;
        let {data: res} = await this.$http.post('categories', this.addCateForm);
        if(res.meta.status !== 201) return this.$message.error('添加分类失败');
        this.addCatedialogVisible = false;
        this.getCateList();
      })
    },
    // 级联下拉框改变数据
    addCateChange(val) {
      if(val.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      }
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    addCatedialogClosed() {
      this.$refs.addCateRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    }
  }
};
</script>

<style lang="scss" scoped>
  .el-cascader {
    width: 100%;
  }
</style>