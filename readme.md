# 🍓 Raspberry Pi Services Dashboard
A sleek, real-time dashboard to manage and monitor your self-hosted Raspberry Pi services. Built with a modern dark-mode aesthetic and powered by Firebase Realtime Database.
this is the hobby project,
## ✨ Features
- **Live Status Monitoring:** Instantly see your Raspberry Pi's local IP address, connection status, and the last time it checked in.
- **Service Management:** Add, edit, and delete links to your self-hosted web interfaces (like Pi-hole, Plex, Home Assistant, etc.).
- **Drag-and-Drop Reordering:** Effortlessly organize your most used services using fluid drag-and-drop mechanics.
- **Emoji Support:** Assign an emoji to each service for quick visual identification.
- **One-Click SSH:** Quickly copy your SSH command (with a customizable username) directly to your clipboard.
- **Real-Time Sync:** Because it's powered by Firebase, any changes you make on one device instantly sync across all your devices.
- **Modern UI/UX:** Enjoy a premium, cyberpunk-inspired dark mode with smooth animations and toast notifications.
## 🛠️ Tech Stack
- **Frontend:** Vanilla HTML, CSS (Custom Properties, Flexbox, CSS Grid), and JavaScript (ES Modules).
- **Backend/Database:** Firebase Realtime Database.
- **Libraries:**
  - [SortableJS](https://sortablejs.github.io/Sortable/) (for drag-and-drop)
  - [emoji-picker-element](https://github.com/nolanlawson/emoji-picker-element) (for the native emoji picker)
## 🚀 Setup Instructions
1. **Clone the Repository**
2. **Firebase Setup:**
   - Create a project on [Firebase Console](https://console.firebase.google.com/).
   - Set up a Realtime Database.
   - Grab your Firebase config object and replace the `firebaseConfig` object at the top of `app.js` with your own credentials.
3. **Raspberry Pi Script (Optional but Recommended):**
   - To utilize the live status and IP tracking, you'll need a small script running on your Raspberry Pi (e.g., Python or Node.js) that pushes its current local IP and a timestamp to the `lsk_pi_network` node in your Firebase database.
4. **Run the Dashboard:**
   - Simply open `index.html` in your browser, or host it on a platform like GitHub Pages, Vercel, or Firebase Hosting.
## 📝 License
This is a hobby project! Feel free to fork, modify, and use it to manage your own homelab.