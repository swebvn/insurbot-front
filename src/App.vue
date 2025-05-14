<script setup>
import { ref } from 'vue';
import ChatApp from "@/components/ChatApp.vue";
import insurbotLogo from '@/assets/imgs/logo.png';

const showModal = ref(false);

const toggleModal = () => {
  showModal.value = !showModal.value;
};

const handleClose = () => {
  showModal.value = false;
};
</script>

<template>
  <button
      id="button-email-small"
      @click="toggleModal"
      :class="[
      'fixed bottom-14 right-2 z-50',
      'p-2 font-bold cursor-pointer',
      'w-[100px] h-[100px] rounded-full',
      'transition-all duration-500 ease-in-out',
      showModal ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'
    ]"
  >
    <img :src="insurbotLogo" alt="logo" class="w-full"/>
  </button>

  <div
      :class="[
      'fixed bottom-0 right-0 w-full  h-screen z-50',
      'transition-all duration-500 ease-in-out overflow-hidden',
      showModal ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    ]"
  >
    <ChatApp v-if="showModal" @close="handleClose" />
  </div>
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#button-email-small {
  font-size: 10px;
  line-height: 1rem;
}
</style>