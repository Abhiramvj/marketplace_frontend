<script setup>
import { ref, onMounted } from "vue";
import { API_BASE } from "~/services/api";

definePageMeta({ name: "store-detail" });

const router = useRouter();
const route = useRoute();

const storeLoading = ref(true);
const productsLoading = ref(true);
const store = ref(null);
const products = ref([]);
const error = ref(null);

const thumbColors = ["#EEF0FF", "#FFF0F5", "#EFF8FF", "#EDFFF4", "#FFF8EE", "#F5EEFF", "#EEFFFC", "#FFF3EE"];
const iconColors = ["#818CF8", "#F472B6", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA", "#2DD4BF", "#FB923C"];

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", "Accept": "application/json" };
  const res = await fetch(`${API_BASE}${path}`, { headers, ...options });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function fetchStore() {
  const slug = route.params.slug;
  try {
    const sData = await api(`/stores/${slug}`);
    const payload = sData.data ?? sData;
    
    if (payload.store) {
      store.value = payload.store;
      products.value = payload.products?.data ?? payload.products ?? [];
    } else {
      store.value = payload;
    }
  } catch (err) {
    console.error("Failed to load store", err);
    error.value = "Store not found.";
  } finally {
    storeLoading.value = false;
    productsLoading.value = false;
  }
}

function viewProduct(product) {
  router.push(`/products/${product.slug}`);
}

onMounted(async () => {
  await fetchStore();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Back button -->
    <div class="max-w-7xl mx-auto px-6 pt-8">
      <button @click="router.back()"
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </button>
    </div>

    <!-- Error state -->
    <div v-if="error" class="max-w-7xl mx-auto px-6 py-20 text-center">
      <p class="text-gray-400 text-lg">{{ error }}</p>
      <button @click="router.push('/stores')"
        class="mt-4 text-indigo-600 text-sm font-medium hover:underline">Browse all stores →</button>
    </div>

    <template v-else>
      <!-- Store Header Skeleton -->
      <div v-if="storeLoading" class="max-w-7xl mx-auto px-6">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-10">
          <div class="flex items-start gap-6">
            <div class="w-20 h-20 rounded-2xl bg-gray-100 animate-pulse shrink-0"></div>
            <div class="flex-1 space-y-3">
              <div class="h-6 bg-gray-100 rounded w-1/3 animate-pulse"></div>
              <div class="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
              <div class="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Store Header -->
      <div v-else-if="store" class="max-w-7xl mx-auto px-6">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-10">
          <div class="flex flex-col sm:flex-row items-start gap-6">
            <!-- Avatar / Logo -->
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0 overflow-hidden"
              :style="{ background: thumbColors[0], color: iconColors[0] }">
              <img v-if="store.logo" :src="store.logo" :alt="store.store_name"
                class="w-full h-full object-cover" @error="e => e.target.style.display='none'" />
              <span v-else>{{ store.store_name?.charAt(0) }}</span>
            </div>

            <!-- Info -->
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ store.store_name }}</h1>

              <p class="text-gray-500 text-sm leading-relaxed mb-4 max-w-2xl">
                {{ store.description || 'Discover unique products and amazing deals from this store.' }}
              </p>

              <span class="inline-flex items-center gap-1.5 text-sm text-indigo-600 font-semibold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                {{ store.products_count ?? products.length }} products
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div class="max-w-7xl mx-auto px-6 pb-16">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Store Products</h2>
          <span v-if="!productsLoading" class="text-sm text-gray-400">
            {{ products.length }} item{{ products.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Skeletons -->
          <template v-if="productsLoading">
            <div v-for="n in 8" :key="'psk-' + n"
              class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div class="h-44 bg-gray-100 animate-pulse"></div>
              <div class="p-4 space-y-2">
                <div class="h-3 bg-gray-100 rounded w-2/5 animate-pulse"></div>
                <div class="h-4 bg-gray-100 rounded w-4/5 animate-pulse"></div>
                <div class="h-3 bg-gray-100 rounded w-3/5 animate-pulse"></div>
              </div>
            </div>
          </template>

          <!-- Empty state -->
          <template v-else-if="products.length === 0">
            <div class="col-span-4 py-20 text-center">
              <svg class="mx-auto mb-4 text-gray-200" width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.4">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              <p class="text-gray-400 text-sm">No products found for this store.</p>
            </div>
          </template>

          <!-- Products -->
          <template v-else>
            <div v-for="(product, i) in products" :key="product.id"
              class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer relative"
              @click="viewProduct(product)">
              <span v-if="product.stock === 0"
                class="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 z-10">
                Sold Out
              </span>
              <span v-else-if="product.stock <= 5"
                class="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 z-10">
                Low Stock
              </span>

              <div class="h-44 flex items-center justify-center overflow-hidden"
                :style="{ background: thumbColors[i % thumbColors.length] }">
                <img v-if="product.image" :src="product.image" :alt="product.name" loading="lazy"
                  class="w-full h-full object-cover" @error="e => e.target.style.display = 'none'" />
                <svg v-else width="44" height="44" viewBox="0 0 24 24" fill="none"
                  :stroke="iconColors[i % iconColors.length]" stroke-width="1.4">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </div>

              <div class="p-4">
                <p class="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">
                  {{ product.category?.name ?? '—' }}
                </p>
                <h3 class="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
                  {{ product.name }}
                </h3>
                <div class="flex items-center justify-between mt-3">
                  <span class="text-base font-bold text-gray-900">
                    ${{ Number(product.price).toFixed(2) }}
                  </span>
                  <span class="text-xs font-medium"
                    :class="product.stock === 0 ? 'text-red-400' : product.stock <= 5 ? 'text-amber-500' : 'text-emerald-500'">
                    {{ product.stock === 0 ? 'Out of stock' : product.stock + ' in stock' }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>