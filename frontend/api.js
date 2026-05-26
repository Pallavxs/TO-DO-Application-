import axios from 'axios';

// --- BEGINNER EXPLANATION ---
// 1. Why not localhost?
// When testing on a physical phone or an Android/iOS emulator, 'localhost' refers to the phone/emulator itself.
// To reach your computer's backend, we must use your computer's actual IP address on your Wi-Fi network.
// 
// 2. How to find your IP:
// Open Command Prompt (Windows) and type 'ipconfig'. Look for "IPv4 Address" (e.g., 192.168.1.5).
// Mac/Linux users: type 'ifconfig' or 'ip a'.
//
// 3. What does axios.create do?
// It creates a re-usable "instance" of Axios with a predefined base URL. 
// Now, instead of typing the full URL every time, we can just say: api.get('/')

const api = axios.create({
    // IMPORTANT: Replace the IP address below with your actual IPv4 address!
    // Make sure it matches the port your backend is running on (5000).
    baseURL: 'http://192.168.1.5:5000/todos' 
});

export default api;
