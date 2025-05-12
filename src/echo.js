import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: window.location.hostname,
    cluster: '',
    wsPort: 8080,
    forceTLS: false,
    disableStats: true,
})

export default echo
