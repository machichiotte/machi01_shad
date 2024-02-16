<!-- src/components/Cmc.vue -->

<template>
  <div class="page">
    <h1>CMC</h1>
    <div id="table">

      <DataTable
        :value="rows"
        :rows="itemsPerPage"
        :paginator="true"
      >
        <Column
          v-for="(col, index) in cols"
          :key="index"
          :field="col.field"
          :header="col.header"
        ></Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import { cmcColumns } from "../js/columns.js";
import { getCmc } from "../js/getter.js";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

export default {
  components: {
    DataTable,
    Column
  },
  name: "CmcPage",
  data() {
    return {
      items: [],
      itemsPerPage: 13,
      currentPage: 1,
      cols: cmcColumns,
    };
  },
  computed: {
    rows() {
      return this.items.map((item) => {
        return {
          rank: item["cmc_rank"],
          name: item["name"],
          symbol: item["symbol"],
        };
      });
    },
  },
  methods: {
    async getData() {
      this.items = await getCmc();
    },
  },
  mounted() {
    this.getData();
  },
};
</script>

<style scoped>
.page {
  overflow-x: auto;
}

#table {
  height: 700px;
  width: auto;
}
</style>