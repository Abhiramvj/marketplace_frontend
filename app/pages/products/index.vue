<template>
  <div class="page-container">
    <Products
      :categories="categories"
      :selectedCategoryId="selectedCategoryId"
      :productsLoading="productsLoading"
      :pagination="pagination"
      :sortOrder="sortOrder"
      :productsError="productsError"
      :products="products"
      :thumbColors="thumbColors"
      :iconColors="iconColors"
      :addingToCart="addingToCart"
      @selectCategory="selectCategory"
      @update:sortOrder="sortOrder = $event; fetchProducts(1)"
      @retry="fetchProducts(1)"
      @viewProduct="viewProduct"
      @addToCart="addToCart"
      @goToPage="goToPage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { API_BASE, api, shopState } from "../../services/api";
import { useRouter } from 'vue-router';
import Products from "../../components/Products.vue";

const router = useRouter();

// State
const products        = ref([]);
const productsLoading = ref(true);
const productsError   = ref(null);
const pagination      = ref({ current_page: 1, last_page: 1, total: 0 });
const selectedCategoryId = ref(null);
const sortOrder       = ref("");
const categories      = ref([{ id: null, name: "All" }]);
const addingToCart    = ref(null);

// Visual config
const thumbColors = ["#EEF0FF","#FFF0F5","#EFF8FF","#EDFFF4","#FFF8EE","#F5EEFF","#EEFFFC","#FFF3EE"];
const iconColors  = ["#818CF8","#F472B6","#60A5FA","#34D399","#FBBF24","#A78BFA","#2DD4BF","#FB923C"];


async function fetchProducts(page = 1) {
  productsLoading.value = true;
  productsError.value   = null;
  try {
    const params = new URLSearchParams({ page, per_page: 12 });
    if (selectedCategoryId.value) params.set("category", selectedCategoryId.value);
    if (sortOrder.value) params.set("sort", sortOrder.value);
 
    const data = await api(`/products?${params}`);
    products.value  = data.data.data ?? data.data;
    pagination.value = {
      current_page: data.data.current_page ?? 1,
      last_page:    data.data.last_page ?? 1,
      total:        data.data.total ?? products.value.length,
    };
  } catch (err) {
    productsError.value = "Failed to load products.";
  } finally {
    productsLoading.value = false;
  }
}

async function fetchCategories() {
  try {
    const data = await api("/categories");
    if (data?.data) {
      categories.value = [{ id: null, name: "All" }, ...data.data];
    }
  } catch (_) {
    // Fallback if categories API doesn't exist
  }
}

function selectCategory(id) {
  selectedCategoryId.value = id;
  fetchProducts(1);
}

function goToPage(page) { fetchProducts(page); }
function viewProduct(product) { router.push(`/products/${product.slug}`); }

async function addToCart(product) {
  addingToCart.value = product.id;
  try {
    const data = await api("/customer/cart/store", {
      method: "POST",
      body: JSON.stringify({ product_id: product.id, quantity: 1 }),
    });
    // Refresh cart count
    if (data.data?.items) {
      shopState.cartCount = data.data.items.reduce((sum, i) => sum + i.quantity, 0);
    } else {
        const cart = await api("/customer/cart");
        shopState.cartCount = cart.data?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
    }
    alert(`"${product.name}" added to cart.`);
  } catch (err) {
    alert(err.message ?? "Could not add to cart.");
  } finally {
    addingToCart.value = null;
  }
}

onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
