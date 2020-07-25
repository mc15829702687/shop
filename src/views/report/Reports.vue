<template>
  <div>
    <div id="main" style="width: 600px;height:400px;"></div>
  </div>
</template>

<script>
import echarts from "echarts";
export default {
  data() {
    return {
      option: {
        tooltip: {
          show: true,
          type: 'axis'
        }
      }
    };
  },
  created() {},
  mounted() {
    this.drawEcharts();
  },
  methods: {
    async getOptionData() {
      const { data: res } = await this.$http.get("reports/type/1");
      if (res.meta.status !== 200)
        return this.$messagee.error("数据报表数据获取错误！");
      return Object.assign({}, this.option, res.data);
    },
    drawEcharts() {
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById("main"));

      this.getOptionData().then(res => {
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(res);
      });
    }
  }
};
</script>

<style>
</style>