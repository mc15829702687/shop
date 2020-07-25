<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
      <!-- 进度条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top">
        <!-- 标签页 -->
        <el-tabs
          v-model="activeIndex"
          @tab-click="handleTabsClick"
          tab-position="left"
          :before-leave="tabsBeforeLeave"
        >
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateListprops"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyList" :label="item.attr_name" :key="item.attr_id">
              <!-- <el-checkbox 
              v-for="(checkItem, i) in item.attr_vals" 
              :key="i" 
              :label="checkItem.val" 
              border
              v-model="checkItem.checked" @change="checkBoxChange(checkItem, item.attr_vals, i)"></el-checkbox>-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyList" :label="item.attr_name" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <!-- 上传图片 -->
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="imgUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="uploadSuccsess"
              list-type="picture"
              :headers="uploadHeadr"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>

          <!-- 商品内容 -->
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="addGoodsInfo()">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览弹框 -->
    <el-dialog title="图片预览" :visible.sync="addVialogVisible" width="50%">
      <img :src="showImgSrc" alt style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 当前步骤条激活状态
      activeIndex: "0",
      // 表单信息
      addForm: {
        goods_name: "",
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        goods_introduce: "",
        pics: [],
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      // 商品分类数据
      cateList: [],
      cateListprops: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      // 商品参数
      manyList: [],
      // 商品属性
      onlyList: [],
      // 上传图片路径
      imgUrl: "https://www.liulongbin.top:8888/api/private/v1/upload",
      uploadHeadr: {
        Authorization: window.sessionStorage.getItem("token")
      },
      // 控制图片预览
      addVialogVisible: false,
      showImgSrc: ""
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取级联选择器的值
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: {
          type: 3
        }
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取级联选择器数据失败！");
      this.cateList = res.data;
    },
    // 标签页切换
    async handleTabsClick() {
      // 商品参数
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "many"
            }
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error("商品参数数据获取错误！");
        let newArr;
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.split(" ");
          // newArr = [];
          // item.attr_vals.forEach(item2 => {
          //   newArr.push({
          //     val: item2,
          //     checked: true
          //   });
          // })
          // item.attr_vals = newArr;
        });

        return (this.manyList = res.data);
      }

      // 商品属性
      if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "only"
            }
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error("商品属性数据获取错误！");
        return (this.onlyList = res.data);
      }
    },
    // 监听图片预览
    handlePreview(file) {
      this.showImgSrc = file.response.data.url;
      this.addVialogVisible = true;
    },
    // 监听图片移除
    handleRemove(file, fileList) {
      const i = this.addForm.pics.findIndex(val => {
        return val.pic === file.response.data.tmp_path;
      });
      this.addForm.pics.splice(i, 1);
    },
    // 图片上传成功
    uploadSuccsess(response) {
      if (response.meta.status !== 200)
        return this.$message.error("图片上传失败");
      this.addForm.pics.push({
        pic: response.data.tmp_path
      });
    },
    // 删除复选框值
    checkBoxChange(val, item, i) {
      if (!val.checked) {
        item = item.splice(i, 1);
      }
    },
    // 级联选择器选值
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        return (this.addForm.goods_cat = []);
      }
    },
    tabsBeforeLeave(activeName, oldActiveName) {
      if (this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类！");
        return false;
      }
    },
    // 添加商品
    addGoodsInfo() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return this.$message.error('请填写全表单信息！')
        let form = JSON.parse(JSON.stringify(this.addForm))
        
        this.manyList.forEach(item => {
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          })
        })
        this.onlyList.forEach(item => {
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          })
        })
        form.goods_cat = form.goods_cat.join(',')
        
        const {data: res} = await this.$http.post('goods', form)
        if(res.meta.status !== 201) return this.$message.error('创建商品失败')
        this.$message.success('创建商品成功！')
        this.$router.push('/goods') 
      })
    }
  },
  computed: {
    cateId() {
      return this.addForm.goods_cat.length === 3
        ? this.addForm.goods_cat[2]
        : null;
    }
  }
};
</script>

<style lang="scss" scoped>
.el-steps {
  margin: 15px 0;
}
/deep/.el-step__title {
  font-size: 12px;
}
/deep/.el-checkbox {
  margin: 5px 0;
}
/deep/.ql-editor {
  min-height: 200px;
}
.el-button {
  margin-top: 15px;
}
</style>