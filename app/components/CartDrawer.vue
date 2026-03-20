<template>
  <!-- Overlay -->
  <div
    class="fixed inset-0 z-50 transition-all duration-300"
    :class="cartOpen ? 'pointer-events-auto bg-black/40' : 'pointer-events-none bg-transparent'"
    @click.self="$emit('close')"
  >
    <!-- Drawer -->
    <div
      class="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl flex flex-col transition-transform duration-300"
      :class="cartOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <h2 class="text-lg font-bold text-gray-900">Your Cart</h2>
        <button
          @click="$emit('close')"
          class="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="cartLoading" class="flex-1 flex items-center justify-center text-sm text-gray-400">
        Loading cart...
      </div>

      <!-- Empty -->
      <div v-else-if="cartItems.length === 0" class="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <div>
          <p class="font-semibold text-gray-900 mb-1">Your cart is empty</p>
          <p class="text-sm text-gray-400">Add some products to get started</p>
        </div>
        <button
          @click="$emit('close')"
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          Start Shopping
        </button>
      </div>

      <!-- Items -->
      <div v-else class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <div
          v-for="item in cartItems"
          :key="item.id"
          class="flex items-start gap-3"
        >
          <!-- Product image -->
          <div class="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
            <img
              v-if="item.product?.image"
              :src="item.product.image"
              :alt="item.product?.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-gray-100"></div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate mb-0.5">{{ item.product?.name }}</p>
            <p class="text-sm font-bold text-indigo-600 mb-2">${{ Number(item.product?.price).toFixed(2) }}</p>

            <!-- Qty controls -->
            <div class="flex items-center gap-2">
              <button
                @click="$emit('updateCartItem', item, item.quantity - 1)"
                :disabled="item.quantity <= 1"
                class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >−</button>
              <span class="text-sm font-semibold text-gray-900 min-w-[20px] text-center">{{ item.quantity }}</span>
              <button
                @click="$emit('updateCartItem', item, item.quantity + 1)"
                :disabled="item.quantity >= item.product?.stock"
                class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >+</button>
            </div>
          </div>

          <!-- Remove -->
          <button
            @click="$emit('removeFromCart', item)"
            class="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors mt-0.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="cartItems.length > 0" class="px-6 py-5 border-t border-gray-100 space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">Total</span>
          <strong class="text-xl font-bold text-gray-900">${{ cartTotal }}</strong>
        </div>
        <button
          @click="$emit('checkout')"
          :disabled="checkingOut"
          class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
        >
          {{ checkingOut ? 'Placing Order...' : 'Checkout' }}
        </button>
        <p v-if="checkoutError" class="text-xs text-red-500 text-center">{{ checkoutError }}</p>
        <p v-if="checkoutSuccess" class="text-xs text-emerald-600 text-center">{{ checkoutSuccess }}</p>
      </div>

    </div>
  </div>
</template>

<script setup>
defineProps({
  cartOpen:        { type: Boolean,         default: false },
  cartLoading:     { type: Boolean,         default: false },
  cartItems:       { type: Array,           default: () => [] },
  cartTotal:       { type: [String, Number], default: 0 },
  checkingOut:     { type: Boolean,         default: false },
  checkoutError:   { type: String,          default: null },
  checkoutSuccess: { type: String,          default: null },
});
defineEmits(['close', 'updateCartItem', 'removeFromCart', 'checkout']);
</script>