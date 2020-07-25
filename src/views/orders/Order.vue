<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="searchVal" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格内容 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="300"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="80"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay" width="80">
          <template v-slot="scope">
            <el-tag type="danger" v-if="scope.row.order_pay === '0'">未付款</el-tag>
            <el-tag v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="80"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template v-slot="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editOrder()"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="watchLocation()"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 编辑的弹框 -->
    <el-dialog
      title="修改地址"
      @close="editDialogClosed()"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <el-form ref="editFormRef" :model="editForm" label-width="100px" :rules="editFormRules">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="editForm.address1" :options="cityData" @change="handleChange"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 查看物流进度弹框 -->
    <el-dialog title="查看物流进度" :visible.sync="watchDialogVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in locationList"
          :key="index"
          :timestamp="activity.time"
          placement="top"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "../orders/citydata";

export default {
  data() {
    return {
      // 搜索框值
      searchVal: "",
      // 表格数据
      orderList: [],
      // 请求参数
      queryInfo: {
        query: "",
        pagesize: 10,
        pagenum: 1
      },
      total: 0,
      editDialogVisible: false,
      editForm: {
        address1: [],
        address2: ""
      },
      cityData,
      editFormRules: {
        address1: [
          { required: true, message: "请选择省市区/县", trigger: "blur" }
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" }
        ]
      },
      watchDialogVisible: false,
      // 物流信息
      locationList: []
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    // 获取订单列表数据
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      });

      if (res.meta.status !== 200)
        return this.$message.error("订单列表数据获取错误！");
      this.orderList = res.data.goods;
      this.total = res.data.total;
      console.log(res.data);
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    // 编辑
    editOrder() {
      this.editDialogVisible = true;
    },
    // 级联选择器选择内容
    handleChange() {},
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
      this.editForm.address1 = [];
    },
    // 点击定位图标
    async watchLocation() {
      const {data: res} = await this.$http.get('/kuaidi/1106975712662')
      if(res.meta.status !== 200) return this.$message.error('获取物流信息失败')
      this.locationList = res.data
     this.watchDialogVisible = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.el-table {
  font-size: 12px;
}
.el-cascader {
  width: 100%;
}
.el-timeline {
  font-size: 12px;
}
</style>