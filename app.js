import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, onValue, push, remove, set } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

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
const sshBox = document.getElementById("ssh-box");
const sshIpText = document.getElementById("ssh-ip");
const copySshBtn = document.getElementById("copy-ssh-btn");
const sshUser = document.getElementById("ssh-user");

if (sshUser) {
    sshUser.addEventListener("input", function() {
        this.style.width = Math.max(3, this.value.length) + "ch";
    });

    sshUser.addEventListener("change", function() {
        set(ref(db, 'sshUsername'), this.value).catch(err => console.error("Error saving username:", err));
    });
}

if (copySshBtn) {
    copySshBtn.onclick = () => {
        const user = sshUser ? sshUser.value || "lsk" : "lsk";
        const cmd = `ssh ${user}@${sshIpText.textContent}`;
        navigator.clipboard.writeText(cmd).then(() => {
            const originalColor = copySshBtn.style.color;
            copySshBtn.style.color = "var(--success)";
            setTimeout(() => {
                copySshBtn.style.color = originalColor;
            }, 1000);
        });
    };
}



// Add Service Modal Logic
const modal = document.getElementById("add-service-modal");
const addBtn = document.getElementById("add-service-btn");
const closeBtn = document.querySelector(".close-modal");
const form = document.getElementById("add-service-form");

addBtn.onclick = () => {
    modal.classList.add("active");
};

closeBtn.onclick = () => {
    modal.classList.remove("active");
};

window.onclick = (e) => {
    if (e.target == modal) {
        modal.classList.remove("active");
    }
};

form.onsubmit = (e) => {
    e.preventDefault();
    const icon = document.getElementById("service-icon").value;
    const name = document.getElementById("service-name").value;
    const protocol = document.getElementById("service-protocol").value;
    const port = document.getElementById("service-port").value;

    const newService = {
        name: `${icon} ${name}`,
        protocol: protocol,
        port: parseInt(port)
    };

    const servicesRef = ref(db, 'services');
    push(servicesRef, newService).then(() => {
        modal.classList.remove("active");
        form.reset();
    }).catch((error) => {
        console.error("Error adding service:", error);
        alert("Failed to add service. Check console.");
    });
};

onValue(ref(db), (snapshot) => {
    const data = snapshot.val();

    if (!data?.ip) {
        ipText.textContent = "Offline";
        if (timestampText) timestampText.textContent = "--";
        buttonsDiv.innerHTML = "";
        if (statusDot) statusDot.classList.add("offline");
        if (pulseRing) pulseRing.style.display = "none";
        if (sshBox) sshBox.style.display = "none";
        return;
    }

    const ip = data.ip;
    ipText.textContent = ip;
    if (sshIpText) sshIpText.textContent = ip;
    if (sshBox) sshBox.style.display = "flex";
    
    if (statusDot) statusDot.classList.remove("offline");
    if (pulseRing) pulseRing.style.display = "block";

    if (sshUser && data.sshUsername !== undefined) {
        if (document.activeElement !== sshUser) {
            sshUser.value = data.sshUsername;
            sshUser.style.width = Math.max(3, sshUser.value.length) + "ch";
        }
    }

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

    let currentServices = [];
    if (data && data.services) {
        if (Array.isArray(data.services)) {
            currentServices = data.services.map((svc, index) => {
                if (svc) return { id: index, ...svc };
                return null;
            }).filter(Boolean);
        } else {
            currentServices = Object.entries(data.services).map(([key, value]) => ({ id: key, ...value }));
        }
    }

    currentServices.forEach(service => {
        if (!service) return;

        const btn = document.createElement("button");
        btn.className = "service-btn";

        // Split icon from text assuming standard format "emoji Name"
        const [icon, ...nameParts] = service.name.split(" ");
        const nameText = nameParts.join(" ");

        btn.innerHTML = `<span class="service-icon">${icon}</span><span class="service-name">${nameText}</span>`;

        btn.onclick = () => {
            const url = `${service.protocol}://${ip}:${service.port}`;
            window.open(url, "_blank");
        };

        const delBtn = document.createElement("button");
        delBtn.className = "delete-service-btn";
        delBtn.innerHTML = "&times;";
        delBtn.title = "Delete Service";
        delBtn.onclick = (e) => {
            e.stopPropagation();
            remove(ref(db, `services/${service.id}`)).catch(err => {
                console.error("Failed to delete service:", err);
                alert("Failed to delete service.");
            });
        };

        btn.appendChild(delBtn);
        buttonsDiv.appendChild(btn);
    });
});