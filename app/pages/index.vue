<script setup>
import { ref, onMounted } from "vue";
import {api, shopState } from "../services/api";
import { useRouter } from 'vue-router';
import Hero from "../components/Hero.vue";

const router = useRouter();

const productsLoading = ref(true);
const storesLoading = ref(true);
const featuredProducts = ref([]);
const heroProducts = ref([]);
const stores = ref([]);
const totalProducts = ref(0);
const totalStores = ref(0);

const thumbColors = ["#EEF0FF", "#FFF0F5", "#EFF8FF", "#EDFFF4", "#FFF8EE", "#F5EEFF", "#EEFFFC", "#FFF3EE"];
const iconColors = ["#818CF8", "#F472B6", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA", "#2DD4BF", "#FB923C"];


async function fetchHomeData() {
  try {
    const pData = await api(`/products?per_page=4`);
    featuredProducts.value = pData.data.data ?? pData.data;
    heroProducts.value = featuredProducts.value;
    totalProducts.value = pData.data.total ?? featuredProducts.value.length;
  } catch (err) {
    console.error("Failed to load products", err);
  } finally {
    productsLoading.value = false;
  }

  try {
    const sData = await api("/stores?per_page=4");
    stores.value = sData.data.data ?? sData.data;
    totalStores.value = sData.data.total ?? stores.value.length;
  } catch (err) {
    console.error("Failed to load stores", err);
  } finally {
    storesLoading.value = false;
  }
}

function scrollToProducts() { document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }
function navigateToStores() { router.push('/stores'); }
function viewProduct(product) { router.push(`/products/${product.slug}`); }
function viewStore(store) { router.push(`/stores/${store.store_slug}`); }

async function addToCart(product) {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      alert("Please login first.");
      return;
    }
    const data = await api("/customer/cart/store", {
      method: "POST",
      body: JSON.stringify({ product_id: product.id, quantity: 1 }),
    });
    if (data.data?.items) {
      shopState.cartCount = data.data.items.reduce((sum, i) => sum + i.quantity, 0);
    } else {
        const cart = await api("/customer/cart");
        shopState.cartCount = cart.data?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
    }
    alert(`"${product.name}" added to cart.`);
  } catch (err) {
    alert(err.message ?? "Could not add to cart.");
  }
}

onMounted(() => { fetchHomeData(); });
</script>

<template>
  <div>
    <Hero :totalProducts="totalProducts" :totalStores="totalStores" :heroProducts="heroProducts"
      @scrollToProducts="scrollToProducts" @scrollToStores="navigateToStores" />

    <!-- Featured Products -->
    <main id="products" class="max-w-7xl mx-auto px-6 py-12">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Featured Products</h2>
        <NuxtLink to="/products" class="text-indigo-600 text-sm font-medium hover:underline">
          View All Products →
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Skeletons -->
        <template v-if="productsLoading">
          <div v-for="n in 4" :key="'psk-' + n"
            class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div class="h-44 bg-gray-100 animate-pulse"></div>
            <div class="p-4 space-y-2">
              <div class="h-3 bg-gray-100 rounded w-2/5 animate-pulse"></div>
              <div class="h-4 bg-gray-100 rounded w-4/5 animate-pulse"></div>
              <div class="h-3 bg-gray-100 rounded w-3/5 animate-pulse"></div>
            </div>
          </div>
        </template>

        <!-- Products -->
        <template v-else>
          <div v-for="(product, i) in featuredProducts" :key="product.id"
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
                {{ product.vendor?.store_name ?? '—' }}
              </p>
              <h3 class="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
                {{ product.name }}
              </h3>
              <p class="text-xs text-gray-400 mb-3">{{ product.category?.name }}</p>
              <div class="flex items-center justify-between mt-3 gap-2">
                <span class="text-base font-bold text-gray-900">
                  ${{ Number(product.price).toFixed(2) }}
                </span>
                <button 
                  class="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors group/btn" 
                  title="Add to Cart"
                  @click.stop="addToCart(product)"
                >
                  Add To Cart
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>

    <!-- Top Stores -->
    <section id="stores" class="max-w-7xl mx-auto px-6 pb-16">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Top Stores</h2>
        <NuxtLink to="/stores" class="text-indigo-600 text-sm font-medium hover:underline">
          View All Stores →
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Skeletons -->
        <template v-if="storesLoading">
          <div v-for="n in 4" :key="'ssk-' + n"
            class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-gray-100 animate-pulse shrink-0"></div>
              <div class="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
            </div>
            <div class="h-3 bg-gray-100 rounded w-full animate-pulse"></div>
            <div class="h-3 bg-gray-100 rounded w-5/6 animate-pulse"></div>
          </div>
        </template>

        <!-- Stores -->
        <template v-else>
          <div v-for="(store, i) in stores" :key="store.id"
            class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col"
            @click="viewStore(store)">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                :style="{ background: thumbColors[i % thumbColors.length], color: iconColors[i % iconColors.length] }">
                {{ store.store_name.charAt(0) }}
              </div>
              <h3 class="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {{ store.store_name }}
              </h3>
            </div>

            <p class="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4 flex-1">
              {{ store.description || 'Discover unique products and amazing deals.' }}
            </p>

            <div class="flex items-center justify-between pt-3 border-t border-gray-50">
              <span class="text-xs font-semibold text-indigo-500">
                {{ store.products_count ?? store.products?.length ?? 0 }} products
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>
