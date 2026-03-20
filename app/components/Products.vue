<template>
  <main id="products" class="max-w-7xl mx-auto px-6 py-12">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h2 class="text-2xl font-bold text-gray-900 tracking-tight">All Products</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="$emit('selectCategory', cat.id)"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
            selectedCategoryId === cat.id
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- Results bar -->
    <div class="flex items-center justify-between mb-6">
      <span class="text-sm text-gray-500">
        <template v-if="productsLoading">Loading...</template>
        <template v-else>{{ pagination.total }} products found</template>
      </span>
      <select
        :value="sortOrder"
        @change="$emit('update:sortOrder', $event.target.value)"
        class="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none bg-white cursor-pointer hover:border-indigo-400 transition-colors"
      >
        <option value="">Sort: Featured</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="newest">Newest</option>
      </select>
    </div>

    <!-- Error state -->
    <div v-if="productsError" class="flex items-center justify-between bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6">
      <span class="text-sm text-red-600">⚠️ {{ productsError }}</span>
      <button
        @click="$emit('retry')"
        class="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Product grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

      <!-- Skeletons -->
      <template v-if="productsLoading">
        <div v-for="n in 8" :key="'psk-'+n" class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
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
        <div
          v-for="(product, i) in products"
          :key="product.id"
          class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer relative flex flex-col"
          @click="$emit('viewProduct', product)"
        >
          <!-- Badge -->
          <span v-if="product.stock === 0"
            class="absolute top-3 left-3 z-10 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
            Sold Out
          </span>
          <span v-else-if="product.stock <= 5"
            class="absolute top-3 left-3 z-10 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
            Low Stock
          </span>

          <!-- Image -->
          <div
            class="h-44 flex items-center justify-center overflow-hidden"
            :style="{ background: thumbColors[i % thumbColors.length] }"
          >
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              loading="lazy"
              class="w-full h-full object-cover"
              @error="e => e.target.style.display='none'"
            />
            <svg v-else width="44" height="44" viewBox="0 0 24 24" fill="none"
              :stroke="iconColors[i % iconColors.length]" stroke-width="1.4">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
          </div>

          <!-- Info -->
          <div class="p-4 flex flex-col flex-1">
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">
              {{ product.vendor?.store_name ?? '—' }}
            </p>
            <h3 class="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
              {{ product.name }}
            </h3>
            <p class="text-xs text-gray-400 mb-3">{{ product.category?.name }}</p>

            <div class="flex items-center justify-between mb-4 mt-auto">
              <span class="text-base font-bold text-gray-900">
                ${{ Number(product.price).toFixed(2) }}
              </span>
              <span class="text-xs font-medium" :class="product.stock <= 5 ? 'text-amber-500' : 'text-emerald-500'">
                {{ product.stock }} in stock
              </span>
            </div>

            <button
              :disabled="product.stock === 0 || addingToCart === product.id"
              @click.stop="$emit('addToCart', product)"
              :class="[
                'w-full py-2.5 rounded-xl text-sm font-semibold transition-colors',
                product.stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              ]"
            >
              <template v-if="addingToCart === product.id">Adding...</template>
              <template v-else-if="product.stock === 0">Out of Stock</template>
              <template v-else>Add to Cart</template>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.last_page > 1 && !productsLoading" class="flex items-center justify-center gap-4 mt-10">
      <button
        :disabled="pagination.current_page === 1"
        @click="$emit('goToPage', pagination.current_page - 1)"
        class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← Prev
      </button>
      <span class="text-sm text-gray-500">
        Page {{ pagination.current_page }} of {{ pagination.last_page }}
      </span>
      <button
        :disabled="pagination.current_page === pagination.last_page"
        @click="$emit('goToPage', pagination.current_page + 1)"
        class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>

  </main>
</template>

<script setup>
defineProps({
  categories:         { type: Array,          default: () => [] },
  selectedCategoryId: { type: [Number, String], default: null },
  productsLoading:    { type: Boolean,         default: false },
  pagination:         { type: Object,          default: () => ({ total: 0, current_page: 1, last_page: 1 }) },
  sortOrder:          { type: String,          default: "" },
  productsError:      { type: String,          default: null },
  products:           { type: Array,           default: () => [] },
  thumbColors:        { type: Array,           default: () => [] },
  iconColors:         { type: Array,           default: () => [] },
  addingToCart:       { type: [Number, String], default: null },
});

defineEmits(['selectCategory', 'update:sortOrder', 'retry', 'viewProduct', 'addToCart', 'goToPage']);
</script>