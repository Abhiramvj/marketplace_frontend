<template>
  <div class="page-container">
    <Stores
      :storesLoading="storesLoading"
      :stores="stores"
      @viewStore="viewStore"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { API_BASE } from "../services/api";
import { useRouter } from 'vue-router';
import Stores from "../components/Stores.vue";

const router = useRouter();

// State
const stores          = ref([]);
const storesLoading   = ref(true);

async function api(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers = { "Content-Type": "application/json", "Accept": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}${path}`, { headers, ...options });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function fetchStores() {
  storesLoading.value = true;
  try {
    const data  = await api("/stores?per_page=20");
    stores.value = data.data.data ?? data.data;
  } catch (err) {
    console.error("Failed to load stores");
  } finally {
    storesLoading.value = false;
  }
}

function viewStore(store) {
  router.push(`/stores/${store.store_slug}`);
}

onMounted(() => {
  fetchStores();
});
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
