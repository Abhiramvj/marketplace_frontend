<script setup>
import { ShoppingCart, Search, Store } from 'lucide-vue-next';

defineProps({
  searchQuery: { type: String, default: "" },
  isLoggedIn:  { type: Boolean, default: false },
  cartCount:   { type: Number, default: 0 },
  user:        { type: Object, default: () => null }
});

const emit = defineEmits([
  'update:searchQuery',
  'debouncedFetch',
  'openLoginModal',
  'openRegisterModal',
  'logout'
]);

function onSearchInput(event) {
  emit('update:searchQuery', event.target.value);
  emit('debouncedFetch');
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">

      <!-- Brand -->
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-gray-900 text-lg shrink-0 hover:text-indigo-600 transition-colors">
        <Store class="text-indigo-600" :size="22" />
        MarketHub
      </NuxtLink>

      <!-- Search -->
      <div class="flex-1 max-w-md flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
        <Search :size="16" class="text-gray-400 shrink-0" />
        <input
          :value="searchQuery"
          @input="onSearchInput"
          type="text"
          placeholder="Search products"
          class="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
        />
      </div>

      <!-- Nav links -->
      <div class="flex items-center gap-1 ml-auto">
        <NuxtLink
          to="/"
          exact-active-class="text-indigo-600 font-semibold"
          class="text-sm text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Home
        </NuxtLink>
        <NuxtLink
          to="/products"
          active-class="text-indigo-600 font-semibold"
          class="text-sm text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Products
        </NuxtLink>
        <NuxtLink
          to="/stores"
          active-class="text-indigo-600 font-semibold"
          class="text-sm text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Stores
        </NuxtLink>
        <NuxtLink
          v-if="isLoggedIn"
          to="/orders"
          active-class="text-indigo-600 font-semibold"
          class="text-sm text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Orders
        </NuxtLink>

        <!-- Cart -->
        <NuxtLink to="/cart" aria-label="Cart" class="relative p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-indigo-600 transition-colors ml-1">
          <ShoppingCart :size="20" />
          <span
            v-if="cartCount > 0"
            class="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
          >
            {{ cartCount }}
          </span>
        </NuxtLink>

        <!-- Auth -->
        <template v-if="!isLoggedIn">
          <button
            class="text-sm text-gray-600 border border-gray-200 hover:border-indigo-400 hover:text-indigo-600 px-4 py-2 rounded-xl transition-colors ml-1"
            @click="$emit('openLoginModal')"
          >
            Login
          </button>
          <button
            class="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
            @click="$emit('openRegisterModal')"
          >
            Register
          </button>
        </template>
        <template v-else>
          <span class="text-sm text-gray-700 font-medium px-2">
            Hi, {{ user?.name?.split(' ')[0] }}
          </span>
          <button
            class="text-sm text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-500 px-4 py-2 rounded-xl transition-colors"
            @click="$emit('logout')"
          >
            Logout
          </button>
        </template>
      </div>

    </div>
  </nav>
</template>