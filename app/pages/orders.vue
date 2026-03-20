<template>
  <div class="max-w-3xl mx-auto px-6 py-12">
    <h1 class="text-2xl font-bold text-gray-900 tracking-tight mb-8">Your Orders</h1>

    <!-- Loading -->
    <div v-if="ordersLoading" class="space-y-4">
      <div v-for="n in 4" :key="n" class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
        <div class="flex justify-between">
          <div class="h-4 bg-gray-100 rounded w-1/4 animate-pulse"></div>
          <div class="h-4 bg-gray-100 rounded w-1/5 animate-pulse"></div>
        </div>
        <div class="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
        <div class="h-6 bg-gray-100 rounded-full w-20 animate-pulse"></div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12h6M9 16h4"/>
        </svg>
      </div>
      <div class="text-center">
        <p class="font-semibold text-gray-900 mb-1">No orders yet</p>
        <p class="text-sm text-gray-400">When you place an order it will appear here</p>
      </div>
      <NuxtLink
        to="/products"
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
      >
        Start Shopping
      </NuxtLink>
    </div>

    <!-- Orders list -->
    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div>
            <span class="font-bold text-gray-900">Order #{{ order.id }}</span>
            <span class="text-sm text-gray-400 ml-3">
              {{ new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}
            </span>
          </div>
          <span class="font-bold text-indigo-600 text-base">
            ${{ Number(order.total_amount || order.total_price || 0).toFixed(2) }}
          </span>
        </div>

        <!-- Status + items preview -->
        <div class="px-6 py-4 flex items-center justify-between">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize"
            :class="{
              'bg-emerald-50 text-emerald-700': order.status === 'delivered' || order.status === 'completed',
              'bg-blue-50   text-blue-700':    order.status === 'shipped'   || order.status === 'processing',
              'bg-amber-50  text-amber-700':   order.status === 'pending'   || order.status === 'paid',
              'bg-red-50    text-red-700':     order.status === 'cancelled',
              'bg-gray-100  text-gray-600':    !['delivered','completed','shipped','processing','pending','paid','cancelled'].includes(order.status),
            }"
          >
            <!-- Status dot -->
            <span
              class="w-1.5 h-1.5 rounded-full mr-1.5"
              :class="{
                'bg-emerald-500': order.status === 'delivered' || order.status === 'completed',
                'bg-blue-500':   order.status === 'shipped'   || order.status === 'processing',
                'bg-amber-500':  order.status === 'pending'   || order.status === 'paid',
                'bg-red-500':    order.status === 'cancelled',
                'bg-gray-400':   !['delivered','completed','shipped','processing','pending','paid','cancelled'].includes(order.status),
              }"
            ></span>
            {{ order.status }}
          </span>

          <!-- Item count -->
          <span class="text-sm text-gray-400">
            {{ order.items?.length ?? 0 }} item{{ (order.items?.length ?? 0) !== 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Order items preview -->
        <div v-if="order.items?.length" class="px-6 pb-4 flex gap-2">
          <div
            v-for="item in order.items.slice(0, 4)"
            :key="item.id"
            class="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0"
          >
            <img
              v-if="item.product?.image"
              :src="item.product.image"
              :alt="item.product?.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
              ?
            </div>
          </div>
          <div
            v-if="order.items.length > 4"
            class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-semibold text-gray-400"
          >
            +{{ order.items.length - 4 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { API_BASE } from '../services/api';

const router       = useRouter();
const orders       = ref([]);
const ordersLoading = ref(true);

async function api(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers = { "Content-Type": "application/json", "Accept": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res  = await fetch(`${API_BASE}${path}`, { headers, ...options });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function fetchOrders() {
  ordersLoading.value = true;
  try {
    const data    = await api('/customer/orders');
    orders.value  = data.data?.data ?? data.data ?? [];
  } catch (err) {
    if (err.message === "Unauthenticated.") router.push('/');
    else console.error("Failed to fetch orders.", err);
  } finally {
    ordersLoading.value = false;
  }
}

onMounted(() => {
  if (typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
    router.push('/');
    return;
  }
  fetchOrders();
});
</script>