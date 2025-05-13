<template>
  <div class="max-w-2xl mx-auto mt-10" v-if="isShow">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl px-6 py-4 flex justify-between items-center shadow-lg">
      <div class="text-white text-xl font-extrabold tracking-wide">INSURBOT</div>
      <button @click.prevent="closePopup" class="text-white hover:text-gray-200 hover:scale-110 transition-all duration-200 text-3xl font-bold">
        –
      </button>
    </div>

    <!-- Chat Container -->
    <div class="max-w-2xl h-[550px] bg-gray-800 rounded-b-xl flex flex-col p-4">
      <!-- Start Chat Screen -->
      <div v-if="!chatStarted" class="flex-1 flex items-center justify-center">
        <button
            @click="startChat"
            class="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          Start Chat
        </button>
      </div>

      <!-- Chat Interface -->
      <div v-else class="flex flex-col h-full">
        <!-- Chat box -->
        <div ref="chatBox" class="flex-1 overflow-y-auto space-y-2 pr-2">
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
                'px-4 py-2 rounded-xl break-words mt-3',
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white max-w-xs'
                  : 'bg-gray-200 text-gray-800 max-w-md'
              ]"
            >
              <div>
                <!-- Sender name -->
                <div
                    class="text-sm font-bold mb-1"
                    :class="msg.sender === 'user' ? 'text-white text-right' : 'text-purple-600 text-left'"
                >
                  {{ msg.sender === 'user' ? '🧑 You' : '🤖 Insurbot' }}
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
          <div v-if="loading" class="text-gray-300 italic text-sm pl-2">🤖 Insurbot is typing...</div>
        </div>

        <!-- Input -->
        <div class="pt-4 relative flex items-center gap-2">
          <input
              v-model="message"
              @keyup.enter="sendMessage"
              placeholder="Nhập tin nhắn..."
              class="flex-1 px-4 py-2 rounded-xl border border-gray-500 focus:outline-none focus:ring focus:border-blue-300 bg-gray-700 text-white placeholder-gray-400"
          />
          <button
              @click="sendMessage"
              class="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, nextTick, watch, watchEffect} from 'vue'
import axios from 'axios'
import echo from '../echo.js'
import { marked } from 'marked'

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
  const storedData = sessionStorage.getItem('chatData')
  if (storedData) {
    const { messages: storedMessages, conversationId: storedId } = JSON.parse(storedData)
    messages.value = storedMessages
    conversationId.value = storedId
    chatStarted.value = true
  }
}

// Save messages to localStorage
const saveMessages = () => {
  sessionStorage.setItem('chatData', JSON.stringify({
    messages: messages.value,
    conversationId: conversationId.value
  }))
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBox.value) {
      const scrollHeight = chatBox.value.scrollHeight
      chatBox.value.scrollTop = scrollHeight
      console.log('Scrolled to bottom, scrollHeight:', scrollHeight, 'scrollTop:', chatBox.value.scrollTop)
      // Retry scroll in case of rendering delay
      requestAnimationFrame(() => {
        if (chatBox.value && chatBox.value.scrollTop !== chatBox.value.scrollHeight) {
          chatBox.value.scrollTop = chatBox.value.scrollHeight
          console.log('Retry scroll, scrollHeight:', chatBox.value.scrollHeight, 'scrollTop:', chatBox.value.scrollTop)
        }
      })
    }
  })
}


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
  scrollToBottom()
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
    await axios.post(import.meta.env.VITE_API_URL + '/chatbot', {
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
  console.log(e.message)
  messages.value.push({
    sender: 'bot',
    text: e.message
  })
  saveMessages()
  scrollToBottom()
})


const isShow = defineModel()

// watch xem khi nao popup bat thi scroll xuong . mounted ở đây gen trước khi cái popup chạy nên nó k nhận hàm scroll to bottom
watchEffect(() => {
  if (isShow.value) {
    scrollToBottom()
  }
})

const closePopup = () => {
  isShow.value = false
}
</script>