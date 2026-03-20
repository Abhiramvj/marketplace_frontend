<template>
  <header class="flex flex-col lg:flex-row items-center gap-16 max-w-7xl mx-auto px-6 py-16">

    <!-- Left -->
    <div class="flex-1 max-w-xl">
      <span class="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
        Over 10,000+ Products Available
      </span>

      <h1 class="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 mb-5">
        Discover Amazing<br />Products From<br />
        <span class="text-indigo-600">Trusted Vendors</span>
      </h1>

      <p class="text-gray-500 text-base leading-relaxed mb-8">
        Shop thousands of items from independent sellers around the world.
        Find unique products, great deals, and support small businesses.
      </p>

      <div class="flex gap-3 mb-10">
        <button
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors"
          @click="$emit('scrollToProducts')"
        >
          Browse Products →
        </button>
        <button
          class="border-2 border-gray-200 hover:border-indigo-400 hover:text-indigo-600 text-gray-700 font-semibold px-6 py-3.5 rounded-xl text-base transition-colors"
          @click="$emit('scrollToStores')"
        >
          Explore Stores
        </button>
      </div>

      <div class="flex gap-10">
        <div class="flex flex-col">
          <strong class="text-2xl font-extrabold text-gray-900">{{ totalProducts }}+</strong>
          <span class="text-xs text-gray-400 mt-0.5">Products</span>
        </div>
        <div class="flex flex-col">
          <strong class="text-2xl font-extrabold text-gray-900">{{ totalStores }}+</strong>
          <span class="text-xs text-gray-400 mt-0.5">Vendors</span>
        </div>
        <div class="flex flex-col">
          <strong class="text-2xl font-extrabold text-gray-900">50K+</strong>
          <span class="text-xs text-gray-400 mt-0.5">Happy Customers</span>
        </div>
      </div>
    </div>

    <!-- Right -->
    <div class="flex-1 relative flex justify-center w-full max-w-md">
      <div class="grid grid-cols-2 gap-3 w-full">

        <!-- Skeleton cards -->
        <template v-if="heroProducts.length === 0">
          <div
            v-for="n in 4" :key="'sk-'+n"
            class="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm"
          >
            <div class="h-24 rounded-xl bg-gray-100 animate-pulse mb-3"></div>
            <div class="h-3 bg-gray-100 rounded w-4/5 animate-pulse mb-2"></div>
            <div class="h-3 bg-indigo-50 rounded w-2/5 animate-pulse"></div>
          </div>
        </template>

        <!-- Real product mini-cards -->
        <div
          v-for="p in heroProducts"
          :key="p.id"
          class="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm"
        >
          <div class="h-24 rounded-xl overflow-hidden bg-gray-50 mb-3">
            <img v-if="p.image" :src="p.image" :alt="p.name" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gray-100"></div>
          </div>
          <p class="text-xs text-gray-600 font-medium truncate mb-1">{{ p.name }}</p>
          <p class="text-xs font-bold text-indigo-600">${{ p.price }}</p>
        </div>
      </div>

      <!-- Toast -->
      <div class="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 border border-gray-50">
        <span class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center">✓</span>
        <div>
          <p class="text-xs font-semibold text-gray-900 leading-none mb-0.5">Order Delivered!</p>
          <p class="text-xs text-gray-400">2 mins ago</p>
        </div>
      </div>
    </div>

  </header>
</template>

<script setup>
defineProps({
  totalProducts: { type: Number, default: 0 },
  totalStores:   { type: Number, default: 0 },
  heroProducts:  { type: Array,  default: () => [] },
});
defineEmits(['scrollToProducts', 'scrollToStores']);
</script>