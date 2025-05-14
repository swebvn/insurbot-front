<template>
  <div class="relative">
    <div class="max-w-lg mt-10 md:fixed md:right-5 right-1 mx-2 bottom-[100px]">
      <!-- Header -->
      <div class="bg-gradient-to-r from-secondary/50 to-primary/100 rounded-t-xl px-3 py-2 flex justify-between items-center shadow-lg">
        <div class="text-white text-xl font-extrabold tracking-wide flex justify-center items-center">
          <img :src="insurbotLogo" alt="logo" class="w-[30px] mr-2"/>
          INSURBOT
        </div>
        <div class="flex gap-2">
          <button @click.prevent="reloadChat" class="text-white hover:text-gray-200 hover:scale-110 transition-all duration-200 text-2xl font-bold">
            ↻
          </button>
          <button @click.prevent="closePopup" class="text-white hover:text-gray-200 hover:scale-110 transition-all duration-200 text-3xl font-bold">
            –
          </button>
        </div>
      </div>

      <!-- Chat Container -->
      <div class="max-w-2xl w-full h-[550px] bg-white rounded-b-xl flex flex-col px-4 pb-2 md:min-w-[450px] border border-gray-200">
        <!-- Start Chat Screen -->
        <div v-if="!chatStarted" class="flex-1 flex items-center justify-center">
          <button
              @click="startChat"
              class="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            Bắt đầu đoạn chat
          </button>
        </div>

        <!-- Chat Interface -->
        <div v-else class="flex flex-col h-full">
          <!-- Chat box -->
          <div ref="chatBox" class="flex-1 overflow-y-auto space-y-2 pr-2 chat-scrollbar">
            <div
                v-for="(msg, idx) in messages"
                :key="idx"
                :class="[
              'flex',
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            ]"
            >
              <div
                  :class="[
                'px-4 py-3 rounded-xl break-words mt-3',
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white max-w-xs ml-5'
                  : 'bg-gradient-to-r from-secondary/10 to-primary/10 text-gray-700 max-w-xs mr-5'
              ]"
              >
                <div>
                  <!-- Sender name -->
                  <div
                      v-if="msg.sender === 'bot'"
                      class="text-primary text-left text-sm font-bold mb-1 flex items-center"
                  >
                    <img :src="insurbotLogo" alt="logo" class="w-[20px] inline mr-1" v-if="msg.sender === 'bot'"/>  Insurbot
                  </div>

                  <!-- Message content -->
                  <div
                      v-html="renderMarkdown(msg.text)"
                      class="prose prose-sm max-w-none leading-snug space-y-2"
                      :class="msg.sender === 'user' ? 'text-white' : 'text-gray-700'"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Loading indicator -->
            <div v-if="loading" class="text-gray-500 italic text-sm pl-2"><img :src="insurbotLogo" alt="logo" class="w-[20px] mr-2"/> Insurbot đang nhập...</div>
          </div>

          <!-- Input -->
          <div class="pt-4 relative flex items-center gap-2">
            <textarea
                rows="1"
                maxlength="200"
                v-model="message"
                @keyup.enter="sendMessage"
                placeholder="Nhập tin nhắn..."
                class="resize-none flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-primary/50 focus:ring focus:border-primary bg-white text-gray-800 placeholder-gray-500"
            />
            <button
                @click="sendMessage"
                class="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center"
                title="Send"
            >
              <div class="flex items-center justify-center">
                <img :src="IconSend" class="w-[30px] h-[25px]" alt="send"/>
              </div>
            </button>
          </div>
          <span class="text-[10px] mt-2 text-center text-gray-500">Thông tin chỉ mang tính tham khảo, được tư vấn bởi Trí Tuệ Nhân Tạo</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, watchEffect } from 'vue'
import axios from 'axios'
import echo from '../echo.js'
import { marked } from 'marked'
import insurbotLogo from '@/assets/imgs/insurbot-logo.png';
import IconSend from "@/assets/imgs/send-icon.svg";

// Generate UUID for conversation_id
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const emit = defineEmits(['close']);
const messages = ref([])
const message = ref('')
const loading = ref(false)
const chatBox = ref(null)
const chatStarted = ref(false)
const conversationId = ref('')

// Load messages from localStorage
const loadMessages = () => {
  const storedData = localStorage.getItem('chatData')
  if (storedData) {
    const { messages: storedMessages, conversationId: storedId } = JSON.parse(storedData)
    messages.value = storedMessages
    conversationId.value = storedId
    chatStarted.value = true
  }
}

const closePopup = () => {
  emit('close');
};

// Reload chat: clear messages and start new conversation
const reloadChat = () => {
  messages.value = []
  conversationId.value = generateUUID()
  localStorage.removeItem('chatData')
}

// Save messages to localStorage
const saveMessages = () => {
  localStorage.setItem('chatData', JSON.stringify({
    messages: messages.value,
    conversationId: conversationId.value
  }))
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBox.value) {
      const scrollHeight = chatBox.value.scrollHeight
      chatBox.value.scrollTop = scrollHeight
      // Retry scroll in case of rendering delay
      requestAnimationFrame(() => {
        if (chatBox.value && chatBox.value.scrollTop !== chatBox.value.scrollHeight) {
          chatBox.value.scrollTop = chatBox.value.scrollHeight
        }
      })
    }
  })
}

watchEffect(() => {
  scrollToBottom()
}, { deep: true })

const renderMarkdown = (text) => {
  return marked.parse(text || '')
}

const startChat = () => {
  conversationId.value = generateUUID()
  chatStarted.value = true
  messages.value = []
  saveMessages()
}

watch(chatStarted, (started) => {
  if (started) {
    nextTick(() => {
      scrollToBottom()
    })
  }
})

onMounted(async () => {
  loadMessages()
  await nextTick()
  scrollToBottom()

  setTimeout(() => {
    scrollToBottom()
  }, 200)
})

const sendMessage = async () => {
  const userMsg = message.value.trim()
  if (!userMsg) return

  messages.value.push({
    sender: 'user',
    text: userMsg
  })
  message.value = ''
  loading.value = true
  saveMessages()
  scrollToBottom()

  try {
    await axios.post('http://127.0.0.1:8000/api/chatbot', {
      prompt: userMsg,
      conversation_id: conversationId.value
    })
    // Bot reply will come through Echo
  } catch (error) {
    loading.value = false
    messages.value.push({
      sender: 'bot',
      text: '[Error]: Không thể gửi tin nhắn.'
    })
    saveMessages()
    scrollToBottom()
  }
}

echo.channel('chatroom').listen('MessageSent', (e) => {
  loading.value = false
  messages.value.push({
    sender: 'bot',
    text: e.message
  })
  saveMessages()
  scrollToBottom()
})
</script>