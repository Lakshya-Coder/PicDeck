// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
// import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

// // Replace with your Firebase project configuration
// const firebaseConfig = {
//     apiKey: "YOUR_API_KEY",
//     authDomain: "YOUR_PROJECT.firebaseapp.com",
//     databaseURL: "https://raspberry-pi-a8216-default-rtdb.firebaseio.com",
//     projectId: "YOUR_PROJECT_ID",
//     storageBucket: "YOUR_PROJECT.appspot.com",
//     messagingSenderId: "YOUR_SENDER_ID",
//     appId: "YOUR_APP_ID"
// };

// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);

// const ipElement = document.getElementById("ip");
// const button = document.getElementById("visitBtn");

// // Listen for changes
// onValue(ref(db), (snapshot) => {
//     const data = snapshot.val();

//     if (!data || !data.ip) {
//         ipElement.innerText = "Offline";
//         button.disabled = true;
//         return;
//     }

//     ipElement.innerText = data.ip;
//     button.disabled = false;

//     button.onclick = () => {
//         window.open(`http://${data.ip}`, "_blank");
//     };
// });

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
const buttonsDiv = document.getElementById("buttons");

/*
|--------------------------------------------------------------------------
| Configure your services here
|--------------------------------------------------------------------------
*/
const SERVICES = [
    {
        name: "🌐 Dashboard",
        protocol: "http",
        port: 80
    },
    {
        name: "📚 Kavita",
        protocol: "http",
        port: 5000
    },
    {
        name: "📄 Stirling PDF",
        protocol: "http",
        port: 8080
    },
    {
        name: "☁️ Nextcloud",
        protocol: "https",
        port: 8443
    },
    {
        name: "🛡️ AdGuard Home",
        protocol: "http",
        port: 3000
    },
    {
        name: "📁 File Browser",
        protocol: "http",
        port: 8081
    },
    {
        name: "🏠 Homarr",
        protocol: "http",
        port: 7575
    }
];

onValue(ref(db), (snapshot) => {
    const data = snapshot.val();

    if (!data?.ip) {
        ipText.textContent = "Offline";
        buttonsDiv.innerHTML = "";
        return;
    }

    const ip = data.ip;
    ipText.textContent = ip;

    buttonsDiv.innerHTML = "";

    SERVICES.forEach(service => {
        const btn = document.createElement("button");

        btn.textContent = service.name;

        btn.onclick = () => {
            const url = `${service.protocol}://${ip}:${service.port}`;
            window.open(url, "_blank");
        };

        buttonsDiv.appendChild(btn);
    });
});