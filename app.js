import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://raspberry-pi-a8216-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const ipText = document.getElementById("ip");
const timestampText = document.getElementById("timestamp");
const buttonsDiv = document.getElementById("buttons");
const statusDot = document.getElementById("status-dot");
const pulseRing = document.querySelector(".pulse-ring");

/*
|--------------------------------------------------------------------------
| Configure your services here
|--------------------------------------------------------------------------
*/
const SERVICES = [
    { name: "🌐 Dashboard", protocol: "http", port: 80 },
    { name: "📚 Kavita", protocol: "htt: 10.103.181.196p", port: 5000 },
    { name: "📄 Stirling PDF", protocol: "http", port: 8080 },
    { name: "☁️ Nextcloud", protocol: "https", port: 8443 },
    { name: "🛡️ AdGuard Home", protocol: "http", port: 3000 },
    { name: "📁 File Browser", protocol: "http", port: 8080 },
    { name: "🏠 Homarr", protocol: "http", port: 7575 }
];

onValue(ref(db), (snapshot) => {
    const data = snapshot.val();

    if (!data?.ip) {
        ipText.textContent = "Offline";
        if (timestampText) timestampText.textContent = "--";
        buttonsDiv.innerHTML = "";
        if (statusDot) statusDot.classList.add("offline");
        if (pulseRing) pulseRing.style.display = "none";
        return;
    }

    const ip = data.ip;
    ipText.textContent = ip;
    if (statusDot) statusDot.classList.remove("offline");
    if (pulseRing) pulseRing.style.display = "block";

    if (timestampText) {
        if (data.time) {
            // Check if the timestamp is in seconds (e.g., from Python) or milliseconds
            let timeValue = data.time;
            if (typeof timeValue === 'number' && timeValue < 10000000000) {
                timeValue *= 1000;
            }
            const date = new Date(timeValue);

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const rawHours = date.getHours();
            const ampm = rawHours >= 12 ? 'PM' : 'AM';
            let hours12 = rawHours % 12;
            hours12 = hours12 ? hours12 : 12; // the hour '0' should be '12'
            const hours = String(hours12).padStart(2, '0');
            
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            timestampText.textContent = `${day}/${month}/${year} - ${hours}:${minutes}:${seconds} ${ampm}`;
        } else {
            timestampText.textContent = "--";
        }
    }

    buttonsDiv.innerHTML = "";

    SERVICES.forEach(service => {
        const btn = document.createElement("button");

        // Split icon from text assuming standard format "emoji Name"
        const [icon, ...nameParts] = service.name.split(" ");
        const nameText = nameParts.join(" ");

        btn.innerHTML = `<span class="service-icon">${icon}</span><span class="service-name">${nameText}</span>`;

        btn.onclick = () => {
            const url = `${service.protocol}://${ip}:${service.port}`;
            window.open(url, "_blank");
        };

        buttonsDiv.appendChild(btn);
    });
});