<script setup>
import {onMounted, ref} from 'vue';

import { bgImageBase64 } from '@/assets/images';
import ChatApp from "@/components/ChatApp.vue";

const showModal = ref(false)

const toggleModal = () => {
  showModal.value = !showModal.value
}

</script>

<template>
  <button id="button-email-small" @click="toggleModal"
          :style="{
          backgroundImage: `url(${bgImageBase64})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#1a1a1a'
        }"
  >
    Unlock 10% off
  </button>
  <ChatApp v-model="showModal"/>
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

button#button-email-small {
  position: fixed;
  bottom: 3.5rem;
  right: 0.5rem;
  background-color: black;
  color: white;
  padding: 0.5rem;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  border: 0;
  outline: 0;
  z-index: 10000;
  line-height: 1rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
</style>