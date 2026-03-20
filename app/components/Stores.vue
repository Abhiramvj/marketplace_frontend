<script setup>
import Card from 'primevue/card';

defineProps({
  storesLoading: { type: Boolean, default: false },
  stores: { type: Array, default: () => [] }
});
defineEmits(['viewStore']);
</script>

<template>
  <section id="stores" class="max-w-7xl mx-auto px-10 pb-16">

    <h2 class="text-2xl font-extrabold tracking-tight mb-5">Stores</h2>

    <!-- Skeleton state -->
    <div v-if="storesLoading" class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
      <Card v-for="n in 4" :key="'ssk-' + n"
      style="background: white; border: 1px solid #F3F4F6;"
      >
        <template #content>
          <div class="h-2.5 bg-gray-200 rounded w-11/12 animate-pulse mb-2"></div>
          <div class="h-2.5 bg-gray-200 rounded w-7/12 animate-pulse"></div>
        </template>
      </Card>
    </div>

    <!-- Loaded state -->
    <div v-else class="grid grid-cols-4 gap-4">
      <Card v-for="store in stores" :key="store.id"
        class="cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
        style="background: white; border: 1px solid #F3F4F6;"
        @click="$emit('viewStore', store)">
        <template #header>
          <div class="flex items-center justify-between px-4 pt-4">
            <div
              class="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 text-xl font-bold flex items-center justify-center">
              {{ store.store_name.charAt(0) }}
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        </template>

        <template #title>
          <div class="text-gray-700">
            {{ store.store_name }}
          </div>
        </template>

        <template #subtitle>
          <div class="text-gray-500">
            {{ store.description?.substring(0, 80) }}...
          </div>
        </template>

        <template #footer>
          <span class="text-xs font-semibold text-indigo-500">
            {{ store.products_count ?? store.products?.length ?? 0 }} products
          </span>
        </template>
      </Card>
    </div>

  </section>
</template>