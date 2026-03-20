<template>
  <div class="max-w-6xl mx-auto px-6 py-12">
    <h1 class="text-2xl font-bold text-gray-900 tracking-tight mb-8">Your Shopping Cart</h1>

    <!-- Loading -->
    <div v-if="cartLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <div v-for="n in 3" :key="n" class="bg-white rounded-2xl p-5 border border-gray-100 flex gap-4">
          <div class="w-24 h-24 rounded-xl bg-gray-100 animate-pulse shrink-0"></div>
          <div class="flex-1 space-y-2 py-1">
            <div class="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
            <div class="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
            <div class="h-3 bg-gray-100 rounded w-1/4 animate-pulse"></div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-6 border border-gray-100 h-fit space-y-3">
        <div class="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
        <div class="h-3 bg-gray-100 rounded w-full animate-pulse"></div>
        <div class="h-10 bg-gray-100 rounded-xl animate-pulse mt-4"></div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="cartItems.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      </div>
      <div class="text-center">
        <p class="font-semibold text-gray-900 mb-1">Your cart is empty</p>
        <p class="text-sm text-gray-400">Browse our products and add something you love</p>
      </div>
      <NuxtLink
        to="/products"
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
      >
        Start Shopping
      </NuxtLink>
    </div>

    <!-- Cart content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Items -->
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="item in cartItems"
          :key="item.id"
          class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4 items-start"
        >
          <!-- Image -->
          <div class="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
            <img
              v-if="item.product?.image"
              :src="item.product.image"
              :alt="item.product?.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-gray-100"></div>
          </div>

          <!-- Details -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 truncate mb-1">{{ item.product?.name }}</h3>
            <p class="text-indigo-600 font-bold text-base mb-3">
              ${{ Number(item.product?.price).toFixed(2) }}
            </p>

            <div class="flex items-center justify-between">
              <!-- Qty -->
              <div class="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden">
                <button
                  @click="updateQty(item, item.quantity - 1)"
                  :disabled="item.quantity <= 1"
                  class="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >−</button>
                <span class="px-3 text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                  {{ item.quantity }}
                </span>
                <button
                  @click="updateQty(item, item.quantity + 1)"
                  :disabled="item.quantity >= item.product?.stock"
                  class="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >+</button>
              </div>

              <!-- Line total -->
              <span class="text-sm font-semibold text-gray-500">
                ${{ (item.quantity * Number(item.product?.price || 0)).toFixed(2) }}
              </span>

              <!-- Remove -->
              <button
                @click="removeItem(item)"
                class="text-sm text-red-400 hover:text-red-600 hover:underline transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-fit sticky top-24">
        <h2 class="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

        <div class="space-y-3 mb-5">
          <div class="flex justify-between text-sm text-gray-500">
            <span>Subtotal ({{ cartItems.length }} items)</span>
            <span>${{ cartTotal }}</span>
          </div>
          <div class="flex justify-between text-sm text-gray-500">
            <span>Shipping</span>
            <span class="text-emerald-600 font-medium">Free</span>
          </div>
        </div>

        <div class="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-100 pt-4 mb-6">
          <span>Total</span>
          <span>${{ cartTotal }}</span>
        </div>

        <button
          @click="checkout"
          :disabled="checkingOut"
          class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
        >
          {{ checkingOut ? 'Placing Order...' : 'Proceed to Checkout' }}
        </button>

        <p v-if="checkoutError" class="text-xs text-red-500 text-center mt-3">{{ checkoutError }}</p>
        <p v-if="checkoutSuccess" class="text-xs text-emerald-600 font-medium text-center mt-3">{{ checkoutSuccess }}</p>

        <NuxtLink
          to="/products"
          class="block text-center text-sm text-gray-400 hover:text-indigo-600 transition-colors mt-4"
        >
          ← Continue Shopping
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { API_BASE } from '../services/api';

const router = useRouter();

const cartItems      = ref([]);
const cartLoading    = ref(true);
const checkingOut    = ref(false);
const checkoutError  = ref(null);
const checkoutSuccess = ref(null);

const cartTotal = computed(() =>
  cartItems.value
    .reduce((sum, item) => sum + item.quantity * Number(item.product?.price || 0), 0)
    .toFixed(2)
);

async function api(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers = { "Content-Type": "application/json", "Accept": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res  = await fetch(`${API_BASE}${path}`, { headers, ...options });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function fetchCart() {
  cartLoading.value = true;
  try {
    const data      = await api('/customer/cart');
    cartItems.value = data.data?.items ?? [];
  } catch (err) {
    if (err.message === "Unauthenticated.") router.push('/');
  } finally {
    cartLoading.value = false;
  }
}

async function updateQty(item, newQty) {
  if (newQty < 1) return;
  try {
    await api('/customer/cart/update', {
      method: "PUT",
      body: JSON.stringify({ product_id: item.product_id, quantity: newQty }),
    });
    await fetchCart();
  } catch (err) {
    console.error("Could not update quantity.", err);
  }
}

async function removeItem(item) {
  try {
    await api('/customer/cart/remove', {
      method: "DELETE",
      body: JSON.stringify({ product_id: item.product_id }),
    });
    await fetchCart();
  } catch (err) {
    console.error("Could not remove item.", err);
  }
}

async function checkout() {
  checkingOut.value   = true;
  checkoutError.value = null;
  try {
    const data        = await api('/customer/checkout', { method: "POST" });
    cartItems.value   = [];
    checkoutSuccess.value = `Order #${data.data.id} placed successfully! 🎉`;
  } catch (err) {
    checkoutError.value = err.message || "Checkout failed. Please try again.";
  } finally {
    checkingOut.value = false;
  }
}

onMounted(() => { fetchCart(); });
</script>