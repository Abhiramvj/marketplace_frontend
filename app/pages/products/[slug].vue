<script setup>
import { ref, onMounted } from "vue";
import { API_BASE, api, shopState } from "~/services/api";

const router = useRouter();
const route = useRoute();

const productLoading = ref(true);
const product = ref(null);
const error = ref(null);




async function fetchProduct() {
  const slug = route.params.slug;
  try {
    const res = await api(`/products/${slug}`);
    product.value = res.data ?? res;
  } catch (err) {
    console.error("Failed to load product", err);
    error.value = "Product not found.";
  } finally {
    productLoading.value = false;
  }
}

async function addToCart() {
  if (!product.value) return;
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
        alert("Please login first.");
        return;
    }
    const data = await api("/customer/cart/store", {
      method: "POST",
      body: JSON.stringify({ product_id: product.value.id, quantity: 1 }),
    });
    // Refresh cart count
    if (data.data?.items) {
      shopState.cartCount = data.data.items.reduce((sum, i) => sum + i.quantity, 0);
    } else {
        const cart = await api("/customer/cart");
        shopState.cartCount = cart.data?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
    }
    alert(`"${product.value.name}" added to cart.`);
  } catch (err) {
    alert(err.message ?? "Could not add to cart.");
  }
}

onMounted(() => {
  fetchProduct();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="max-w-7xl mx-auto px-6 pt-8">
      <button @click="router.back()"
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to browsing
      </button>

      <div v-if="error" class="text-center py-20">
        <p class="text-gray-400 text-lg mb-4">{{ error }}</p>
        <NuxtLink to="/products" class="text-indigo-600 font-medium hover:underline">Explore all products</NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        
        <!-- Image Section -->
        <div v-if="productLoading" class="aspect-square bg-gray-100 animate-pulse rounded-2xl"></div>
        <div v-else class="aspect-square rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
            <img v-if="product.image" :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                </svg>
            </div>
        </div>

        <!-- Info Section -->
        <div class="flex flex-col">
            <template v-if="productLoading">
                <div class="h-4 bg-gray-100 rounded w-1/4 animate-pulse mb-4"></div>
                <div class="h-10 bg-gray-100 rounded w-3/4 animate-pulse mb-6"></div>
                <div class="h-6 bg-gray-100 rounded w-1/2 animate-pulse mb-8"></div>
                <div class="space-y-3 mb-10">
                    <div class="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                    <div class="h-4 bg-gray-100 rounded w-5/6 animate-pulse"></div>
                </div>
            </template>
            <template v-else-if="product">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                        {{ product.category?.name ?? 'General' }}
                    </span>
                    <span class="text-sm font-medium" :class="product.stock > 5 ? 'text-emerald-500' : 'text-amber-500'">
                        {{ product.stock }} items available
                    </span>
                </div>

                <h1 class="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                    {{ product.name }}
                </h1>

                <div class="flex items-center gap-2 mb-8 group cursor-pointer" @click="router.push(`/stores/${product.vendor?.store_slug}`)">
                    <div class="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {{ product.vendor?.store_name?.charAt(0) }}
                    </div>
                    <span class="text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">
                        Sold by <span class="font-bold text-gray-700 group-hover:text-indigo-600">{{ product.vendor?.store_name }}</span>
                    </span>
                </div>

                <div class="text-3xl font-black text-gray-900 mb-10">
                    ${{ Number(product.price).toFixed(2) }}
                </div>

                <div class="prose prose-sm text-gray-500 mb-12 flex-1">
                    <p>{{ product.description || 'No description provided for this product.' }}</p>
                </div>

                <div class="flex gap-4">
                    <button 
                        @click="addToCart"
                        class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
                        :disabled="product.stock === 0"
                    >
                        {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
                    </button>
                    <button class="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors border border-gray-100">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </button>
                </div>
            </template>
        </div>
      </div>
    </div>
  </div>
</template>
