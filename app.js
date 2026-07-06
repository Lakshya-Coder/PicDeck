import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, onValue, push, remove, set, update } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

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

let editingServiceId = null;
let sortableInstance = null;
let initialDataFetched = false;

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '✅';
    if (type === 'error') icon = '❌';
    else if (type === 'info') icon = 'ℹ️';
    
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

const ipText = document.getElementById("ip");
const timestampText = document.getElementById("timestamp");
const buttonsDiv = document.getElementById("buttons");
const statusDot = document.getElementById("status-dot");
const pulseRing = document.querySelector(".pulse-ring");
const sshBox = document.getElementById("ssh-box");
const sshIpText = document.getElementById("ssh-ip");
const copySshBtn = document.getElementById("copy-ssh-btn");
const sshUser = document.getElementById("ssh-user");
const mainTitle = document.getElementById("main-title");

if (sshUser) {
    sshUser.addEventListener("input", function () {
        this.style.width = Math.max(3, this.value.length) + "ch";
    });

    sshUser.addEventListener("change", function () {
        set(ref(db, 'sshUsername'), this.value).then(() => {
            showToast("Username updated!");
        }).catch(err => {
            console.error("Error saving username:", err);
            showToast("Failed to update username.", "error");
        });
    });
}

if (copySshBtn) {
    copySshBtn.onclick = () => {
        const user = sshUser ? sshUser.value || "lsk" : "lsk";
        const cmd = `ssh ${user}@${sshIpText.textContent}`;
        navigator.clipboard.writeText(cmd).then(() => {
            showToast("SSH command copied!");
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

// Emoji Picker Logic
const emojiPickerBtn = document.getElementById("emoji-picker-btn");
const emojiPicker = document.getElementById("emoji-picker");
const serviceIconInput = document.getElementById("service-icon");

if (emojiPickerBtn && emojiPicker && serviceIconInput) {
    emojiPickerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        emojiPicker.classList.toggle('active');
    });

    emojiPicker.addEventListener('emoji-click', (e) => {
        serviceIconInput.value = e.detail.unicode;
        emojiPicker.classList.remove('active');
    });
    
    // Hide picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiPickerBtn) {
            emojiPicker.classList.remove('active');
        }
    });
}

addBtn.onclick = () => {
    editingServiceId = null;
    form.reset();
    document.getElementById("modal-title").textContent = "Add New Service";
    modal.classList.add("active");
};

closeBtn.onclick = () => {
    modal.classList.remove("active");
    if (emojiPicker) emojiPicker.classList.remove('active');
};

window.onclick = (e) => {
    if (e.target == modal) {
        modal.classList.remove("active");
        if (emojiPicker) emojiPicker.classList.remove('active');
    }
};

form.onsubmit = (e) => {
    e.preventDefault();
    const icon = document.getElementById("service-icon").value;
    const name = document.getElementById("service-name").value;
    const protocol = document.getElementById("service-protocol").value;
    const port = document.getElementById("service-port").value;

    if (editingServiceId) {
        update(ref(db, `services/${editingServiceId}`), {
            name: `${icon} ${name}`,
            protocol: protocol,
            port: parseInt(port)
        }).then(() => {
            modal.classList.remove("active");
            form.reset();
            showToast("Service updated successfully.");
            editingServiceId = null;
        }).catch((error) => {
            console.error("Error updating service:", error);
            showToast("Failed to update service.", "error");
        });
    } else {
        const newService = {
            name: `${icon} ${name}`,
            protocol: protocol,
            port: parseInt(port),
            order: Date.now()
        };

        const servicesRef = ref(db, 'services');
        push(servicesRef, newService).then(() => {
            modal.classList.remove("active");
            form.reset();
            showToast("Service added successfully.");
        }).catch((error) => {
            console.error("Error adding service:", error);
            showToast("Failed to add service.", "error");
        });
    }
};

showToast("Fetching data from Raspberry Pi...", "info");

onValue(ref(db), (snapshot) => {
    const data = snapshot.val() || {};

    if (!initialDataFetched) {
        showToast("Data loaded successfully!");
        initialDataFetched = true;
    }

    if (sshUser && data.sshUsername !== undefined) {
        if (document.activeElement !== sshUser) {
            sshUser.value = data.sshUsername;
            sshUser.style.width = Math.max(3, sshUser.value.length) + "ch";
        }
        if (mainTitle) {
            mainTitle.textContent = `${data.sshUsername}`;
        }
    } else {
        if (mainTitle) {
            mainTitle.textContent = "lsk";
        }
    }

    if (!data.lsk_pi_network?.ip) {
        ipText.textContent = "Offline";
        if (timestampText) timestampText.textContent = "--";
        buttonsDiv.innerHTML = "";
        if (statusDot) statusDot.classList.add("offline");
        if (pulseRing) pulseRing.style.display = "none";
        if (sshBox) sshBox.style.display = "none";
        return;
    }

    const ip = data.lsk_pi_network.ip;
    ipText.textContent = ip;
    if (sshIpText) sshIpText.textContent = ip;
    if (sshBox) sshBox.style.display = "flex";

    if (statusDot) statusDot.classList.remove("offline");
    if (pulseRing) pulseRing.style.display = "block";

    if (timestampText) {
        if (data.lsk_pi_network?.time) {
            // Check if the timestamp is in seconds (e.g., from Python) or milliseconds
            let timeValue = data.lsk_pi_network.time;
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

    currentServices.sort((a, b) => (a.order || 0) - (b.order || 0));

    currentServices.forEach((service, index) => {
        if (!service) return;

        const btn = document.createElement("button");
        btn.className = "service-btn";
        btn.setAttribute("data-id", service.id);

        // Split icon from text assuming standard format "emoji Name"
        const [icon, ...nameParts] = service.name.split(" ");
        const nameText = nameParts.join(" ");

        btn.innerHTML = `<span class="service-icon">${icon}</span><span class="service-name">${nameText}</span>`;

        btn.onclick = () => {
            const url = `${service.protocol}://${ip}:${service.port}`;
            window.open(url, "_blank");
        };

        const editBtn = document.createElement("button");
        editBtn.className = "edit-service-btn";
        editBtn.innerHTML = "✏️";
        editBtn.title = "Edit Service";
        editBtn.onclick = (e) => {
            e.stopPropagation();
            editingServiceId = service.id;
            document.getElementById("modal-title").textContent = "Edit Service";
            document.getElementById("service-icon").value = icon;
            document.getElementById("service-name").value = nameText;
            document.getElementById("service-protocol").value = service.protocol;
            document.getElementById("service-port").value = service.port;
            modal.classList.add("active");
        };

        const delBtn = document.createElement("button");
        delBtn.className = "delete-service-btn";
        delBtn.innerHTML = "&times;";
        delBtn.title = "Delete Service";
        delBtn.onclick = (e) => {
            e.stopPropagation();
            remove(ref(db, `services/${service.id}`)).then(() => {
                showToast("Service deleted.");
            }).catch(err => {
                console.error("Failed to delete service:", err);
                showToast("Failed to delete service.", "error");
            });
        };

        btn.appendChild(editBtn);
        btn.appendChild(delBtn);
        buttonsDiv.appendChild(btn);
    });

    if (sortableInstance) sortableInstance.destroy();
    if (window.Sortable && buttonsDiv) {
        sortableInstance = Sortable.create(buttonsDiv, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            filter: '.edit-service-btn, .delete-service-btn',
            preventOnFilter: false,
            onEnd: function (evt) {
                const updates = {};
                Array.from(buttonsDiv.children).forEach((child, idx) => {
                    const id = child.getAttribute("data-id");
                    if (id) updates[`services/${id}/order`] = idx;
                });
                update(ref(db), updates).then(() => {
                    showToast("Order saved.");
                }).catch(err => {
                    console.error("Order save error:", err);
                    showToast("Failed to save order.", "error");
                });
            }
        });
    }
});