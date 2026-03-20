<template>
  <div 
    v-if="authModal"
    class="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300"
    @click.self="$emit('close')"
  >
    <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in slide-in-from-bottom-4">
      <!-- Header -->
      <div class="relative p-8 pb-4 text-center">
        <button 
          @click="$emit('close')"
          class="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
          <svg v-if="authModal === 'login'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
        </div>
        
        <h2 class="text-2xl font-bold text-gray-900 tracking-tight">
          {{ authModal === 'login' ? 'Welcome Back' : 'Create Account' }}
        </h2>
        <p class="text-sm text-gray-500 mt-2 px-4">
          {{ authModal === 'login' ? 'Sign in to access your orders and saved items' : 'Join our marketplace to start shopping and selling' }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-8 pt-4 space-y-4">
        <div v-if="authModal === 'register'" class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <input 
              :value="authForm.name" 
              @input="updateForm('name', $event.target.value)" 
              type="text" 
              placeholder="John Doe" 
              required 
              class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <input 
              :value="authForm.email" 
              @input="updateForm('email', $event.target.value)" 
              type="email" 
              placeholder="you@example.com" 
              required 
              class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-gray-700 ml-1">Password</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <input 
              :value="authForm.password" 
              @input="updateForm('password', $event.target.value)" 
              type="password" 
              placeholder="••••••••" 
              required 
              class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        <p v-if="authError" class="text-xs text-rose-500 font-semibold px-1 py-1 bg-rose-50 rounded-lg text-center animate-pulse">
          {{ authError }}
        </p>

        <button 
          type="submit" 
          :disabled="authLoading"
          class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-95 transition-all duration-200"
        >
          <span v-if="!authLoading">{{ authModal === 'login' ? 'Sign In' : 'Create Account' }}</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        </button>
      </form>

      <!-- Footer -->
      <div class="p-6 bg-gray-50 text-center border-t border-gray-100 mt-2">
        <p class="text-sm text-gray-500">
          {{ authModal === 'login' ? "Don't have an account?" : "Already have an account?" }}
          <button 
            @click="$emit('switchMode', authModal === 'login' ? 'register' : 'login')"
            class="ml-1 font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
          >
            {{ authModal === 'login' ? 'Register here' : 'Sign in' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  authModal: { type: String, default: null },
  authForm: { type: Object, default: () => ({ name: "", email: "", password: "" }) },
  authError: { type: String, default: null },
  authLoading: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'submitLogin', 'submitRegister', 'switchMode', 'update:authForm']);

function updateForm(field, value) {
  emit('update:authForm', { ...props.authForm, [field]: value });
}

function handleSubmit() {
  if (props.authModal === 'login') {
    emit('submitLogin');
  } else {
    emit('submitRegister');
  }
}
</script>
