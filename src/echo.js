import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: import.meta.env.VITE_WSBHOST,
    cluster: '',
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
})

export default echo
