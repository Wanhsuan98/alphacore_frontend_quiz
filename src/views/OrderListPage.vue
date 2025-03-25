<!-- OrderTable.vue -->
<template>
  <div class="q-pa-md">
    <div class="q-mb-md row q-gutter-md">
      <!-- Address filter dropdown -->
      <q-select
        v-model="filters.city"
        :options="cityOptions"
        label="Filter by City"
        multiple
        clearable
        style="width: 200px"
        @update:model-value="fetchOrders"
      />
      <!-- Date filter dropdown-->
      <q-input
        v-model="filters.delivery_date"
        label="Delivery Date"
        clearable
        style="width: 200px"
        @update:model-value="fetchOrders"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy>
              <q-date
                v-model="filters.delivery_date"
                mask="YYYY-MM-DD"
                @update:model-value="fetchOrders"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <!-- Order status filter dropdown -->
      <q-select
        v-model="filters.order_status"
        :options="statusOptions"
        label="Order Status"
        clearable
        style="width: 200px"
        @update:model-value="fetchOrders"
      />
      <!-- Financial status filter dropdown  -->
      <q-select
        v-model="filters.financial_status"
        :options="financialStatusOptions"
        label="Financial Status"
        clearable
        style="width: 200px"
        @update:model-value="fetchOrders"
      />
      <!-- Fulfillment status dropdown -->
      <q-select
        v-model="filters.fulfillment_status"
        :options="fulfillmentStatusOptions"
        label="Fulfillment Status"
        clearable
        style="width: 200px"
        @update:model-value="fetchOrders"
      />
    </div>

    <!-- Table displaying order data -->
    <q-table
      :rows="orders"
      :columns="columns"
      row-key="id"
      :loading="loading"
      v-model:pagination="pagination"
      @request="onRequest"
      dense
      :rows-per-page-options="[]"
    >
    <!-- Custom top pagination control slot -->
      <template v-slot:top>
        <div class="custom-pagination-top">
          <q-select
            v-if="rowsPerPageOptions.length > 1"
            v-model="pagination.rowsPerPage"
            :options="rowsPerPageOptions"
            label="每頁行數"
            dense
            style="width: 150px"
            @update:model-value="onRowsPerPageChange"
          />
          <q-pagination
            v-model="pagination.page"
            :max="totalPages"
            :max-pages="7"
            direction-links
            boundary-links
            @update:model-value="onPageChange"
          />
        </div>
      </template>

      <template v-slot:pagination>
        <div class="q-pa-md row items-center q-gutter-md">
          <q-select
            v-if="rowsPerPageOptions.length > 1"
            v-model="pagination.rowsPerPage"
            :options="rowsPerPageOptions"
            label="每頁行數"
            dense
            style="width: 150px"
            @update:model-value="onRowsPerPageChange"
          />
          <q-pagination
            v-model="pagination.page"
            :max="totalPages"
            :max-pages="7"
            direction-links
            boundary-links
            @update:model-value="onPageChange"
          />
        </div>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from "vue";
import { api } from "../boot/axios";

export default {
  name: "OrderTable",
  setup() {
    // Define table columns with labels, fields, and alignment
    const columns = [
      { name: "order_name", label: "Order", field: "order_name", sortable: false, align: "left" },
      { name: "customer_name", label: "Customer", field: "customer_name", sortable: false, align: "left" },
      { name: "total_price", label: "Price", field: "total_price", sortable: false, align: "left" },
      { name: "receiver_address", label: "Address", field: "receiver_address", sortable: false, align: "left" },
      { name: "delivery_date", label: "Delivery Date", field: "delivery_date", sortable: false, align: "left" },
      { name: "created_at", label: "Time", field: "created_at", sortable: false, align: "left" },
      { name: "order_status", label: "Status", field: "order_status", sortable: false, align: "left" },
      { name: "financial_status", label: "Payment", field: "financial_status", sortable: false, align: "left" },
      { name: "fulfillment_status", label: "Fulfillment", field: "fulfillment_status", sortable: false, align: "left" },
    ];

    const orders = ref([]);
    const loading = ref(false);

    const pagination = reactive({
      sortBy: "created_at",
      descending: true,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 0,
    });

    const totalPages = computed(() => Math.ceil(pagination.rowsNumber / pagination.rowsPerPage) || 1);

    const rowsPerPageOptions = ref([5, 10, 20, 50, 100]);

    const filters = reactive({
      order_status: null,
      city: [],
      delivery_date: null,
      fulfillment_status: null,
      financial_status: null,
    });

    const statusOptions = ["open", "cancelled", "closed"];
    const cityOptions = ["台北市", "新北市", "新竹市", "台南市", "高雄市"];
    const fulfillmentStatusOptions = ["received", "preparing"];
    const financialStatusOptions = ["paid", "pending", "refunded"];

    // Function to fetch orders from the API based on filters and pagination
    const fetchOrders = async () => {
      loading.value = true;
      try {
        const params = {
          page: pagination.page - 1,
          size: pagination.rowsPerPage,
          sort_by: pagination.sortBy,
          descending: pagination.descending,
        };
        // Add filters to params
        if (filters.order_status) params.order_status = filters.order_status;
        if (filters.city && filters.city.length > 0) params.city = filters.city;
        if (filters.delivery_date) params.delivery_date = filters.delivery_date.replace(/-/g, "/");
        if (filters.fulfillment_status) params.fulfillment_status = filters.fulfillment_status;
        if (filters.financial_status) params.financial_status = filters.financial_status;

        const response = await api.get("/orders", { params });
        orders.value = response.data.content || [];
        pagination.rowsNumber = response.data.total_elements || 0;
      } catch (error) {
        console.error("Failed to fetch orders:", error.response?.data || error.message);
      } finally {
        loading.value = false;
      }
    };

    // Handle table request events based on pagination, sorting
    const onRequest = (props) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      pagination.page = page;
      pagination.rowsPerPage = rowsPerPage;
      pagination.sortBy = sortBy;
      pagination.descending = descending;
      fetchOrders();
    };

    const onRowsPerPageChange = (val) => {
      pagination.rowsPerPage = val;
      pagination.page = 1;
      fetchOrders();
    };

    const onPageChange = (val) => {
      if (val < 1 || val > totalPages.value) {
        console.warn('頁碼超出範圍:', val);
        return;
      }
      pagination.page = val;
      fetchOrders();
    };

    onMounted(() => {
      fetchOrders();
    });

    return {
      columns,
      orders,
      loading,
      pagination,
      totalPages,
      rowsPerPageOptions, // 返回 rowsPerPageOptions 以供模板使用
      filters,
      statusOptions,
      cityOptions,
      fulfillmentStatusOptions,
      financialStatusOptions,
      fetchOrders,
      onRequest,
      onRowsPerPageChange,
      onPageChange,
    };
  },
};
</script>

<style scoped>
.q-table {
  width: 100%;
}

.q-table .q-pagination .q-btn {
  margin: 0 2px;
  padding: 2px 4px;
}
</style>