<script setup lang="ts">
import * as echarts from "echarts";
import { ref, onMounted, watch } from "vue";
import deps from "analyze:dep";

type EChartsOption = echarts.EChartsOption;

const data = ref(deps);

console.log(data.value);

let option: EChartsOption = {
  title: {
    text: "npm analyze~~~",
  },
  tooltip: {
    trigger: "item",
    triggerOn: "mousemove",
    formatter: function (params) {
      return (
        "<div>" +
        (params.data.detailName ? params.data.detailName : params.data.name) +
        "<br>" +
        '<span style="color: #00B83F;">' +
        (params.data.success
          ? params.data.success
          : params.data.warn.split("\n").join("<br>")) +
        "</span>" +
        "<br>" +
        '<span style="color: #00B83F;">' +
        "该包的大小为" +
        '<span style="color: skyblue;">' +
        (params.data.size ? params.data.size : "未知") +
        "</span>" +
        "</span>" +
        "</div>"
      );
    },
  },
  series: [
    {
      type: "tree",
      data: [data.value[0]],
      top: "1%",
      left: "7%",
      bottom: "1%",
      right: "20%",

      symbolSize: 7,

      label: {
        position: "left",
        verticalAlign: "middle",
        align: "right",
        fontSize: 9,
      },

      leaves: {
        label: {
          position: "right",
          verticalAlign: "middle",
          align: "left",
        },
      },

      emphasis: {
        focus: "descendant",
      },

      expandAndCollapse: true,
      animationDuration: 550,
      animationDurationUpdate: 750,
    },
  ],
};

onMounted(() => {
  let chartDom = document.getElementById("canvas")!;

  chartDom.style.height = data.value[0]?.children?.length * 450 + "px";
  chartDom.style.width = data.value[0]?.children?.length * 100 + "px";

  let myChart = echarts.init(chartDom);

  myChart.setOption(option);
});
</script>

<template>
  <div id="canvas"></div>
</template>

<style scoped>
#canvas {
  width: 1500px;
  height: 3000px;
}
</style>
