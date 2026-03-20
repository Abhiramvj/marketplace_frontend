<template>
  <div class="markethub">
    <Topbar
      :searchQuery="searchQuery"
      :isLoggedIn="isLoggedIn"
      :cartCount="cartCount"
      :user="user"
      @update:searchQuery="searchQuery = $event"
      @debouncedFetch="debouncedFetch"
      @openLoginModal="openLoginModal"
      @openRegisterModal="openRegisterModal"
      @logout="logout"
    />

    <slot />

    <!-- ── AUTH MODAL ── -->
    <AuthModal
      :authModal="authModal"
      :authForm="authForm"
      :authError="authError"
      :authLoading="authLoading"
      @close="authModal = null"
      @update:authForm="authForm = $event"
      @submitLogin="login"
      @submitRegister="register"
      @switchMode="authModal = $event; authError = null"
    />

    <!-- ── TOAST NOTIFICATIONS ── -->
    <div class="toasts">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]">
        {{ toast.message }}
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { API_BASE } from "../services/api";

import Topbar from "../components/Topbar.vue";
import AuthModal from "../components/AuthModal.vue";

// ── State ────────────────────────────────────────────────────────────────────
const token         = ref(typeof window !== "undefined" ? localStorage.getItem("auth_token") ?? null : null);
const user          = ref(typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth_user") ?? "null") : null);
const isLoggedIn    = computed(() => !!token.value);

const searchQuery   = ref("");
const cartItems     = ref([]);

// Auth
const authModal  = ref(null);
const authForm   = ref({ name: "", email: "", password: "" });
const authError  = ref(null);
const authLoading = ref(false);

const toasts = ref([]);

// ── Helpers ───────────────────────────────────────────────────────────────────
function authHeaders() {
  const headers = { "Content-Type": "application/json", "Accept": "application/json" };
  if (token.value) headers["Authorization"] = `Bearer ${token.value}`;
  return headers;
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: authHeaders(),
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

function showToast(message, type = "success") {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id); }, 3500);
}

let debounceTimer = null;
function debouncedFetch() {
  // Can be caught by child pages if they watch search query,
  // or via a global state store like Pinia. For now, we emit from Topbar.
}

const cartCount = computed(() =>
  cartItems.value.reduce((sum, i) => sum + i.quantity, 0)
);

// ── Auth ──────────────────────────────────────────────────────────────────────
function openLoginModal() { authModal.value = "login"; authError.value = null; }
function openRegisterModal() { authModal.value = "register"; authError.value = null; }

async function login() {
  authLoading.value = true;
  authError.value   = null;
  try {
    const data = await api("/login", {
      method: "POST",
      body: JSON.stringify({ email: authForm.value.email, password: authForm.value.password }),
    });
    token.value = data.token;
    user.value  = data.user;
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    authModal.value = null;
    showToast(`Welcome back, ${data.user.name.split(" ")[0]}!`);
    await fetchCart();
  } catch (err) {
    authError.value = err.message ?? "Invalid credentials.";
  } finally {
    authLoading.value = false;
  }
}

async function register() {
  authLoading.value = true;
  authError.value   = null;
  try {
    const data = await api("/register", {
      method: "POST",
      body: JSON.stringify({ name: authForm.value.name, email: authForm.value.email, password: authForm.value.password }),
    });
    token.value = data.token;
    user.value  = data.user;
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    authModal.value = null;
    showToast("Account created! Welcome to MarketHub.");
    await fetchCart();
  } catch (err) {
    authError.value = err.message ?? "Registration failed.";
  } finally {
    authLoading.value = false;
  }
}

async function logout() {
  try { await api("/logout", { method: "POST" }); } catch (_) {}
  token.value = null;
  user.value  = null;
  cartItems.value = [];
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  showToast("Logged out successfully.", "info");
}

async function fetchCart() {
  if (!isLoggedIn.value) return;
  try {
    const data = await api("/customer/cart");
    cartItems.value = data.data?.items ?? [];
  } catch (_) {
    cartItems.value = [];
  }
}

onMounted(async () => {
  if (isLoggedIn.value) await fetchCart();
});
</script>
