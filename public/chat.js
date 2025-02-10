
document.addEventListener("DOMContentLoaded", () => {
    loadMessagesFromLocalStorage();
    loadNewMessages();
    setInterval(loadNewMessages, 1000);
});

const baseURL = 'http://localhost:4000';
const chatBox = document.getElementById("chatBox");
const loggedInUserId = Number(localStorage.getItem("userId"));
let lastMessageId = Number(localStorage.getItem("lastMessageId"));

function loadMessagesFromLocalStorage() {
    const storedMessages = JSON.parse(localStorage.getItem("chatMessages"));

    storedMessages.forEach(msg => appendMessage(msg));
}

// Fetch only new messages from backend
async function loadNewMessages() {
    try {
        const response = await axios.get(`${baseURL}/chat/messages?lastMessageId=${lastMessageId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const messages = response.data;
        if (!messages.length) return;

        messages.forEach(msg => appendMessage(msg));

        // Update lastMessageId only after processing all messages
        lastMessageId = messages[messages.length - 1].id;
        localStorage.setItem("lastMessageId", lastMessageId);

        updateLocalStorage(messages);

    } catch (error) {
        console.error("Error loading new messages:", error);
    }
}

// Append new message to chatbox
function appendMessage(msg) {
    if (document.querySelector(`[data-id="${msg.id}"]`)) return; // Avoid duplicate messages

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.setAttribute("data-id", msg.id);

    if (msg.User?.id && Number(msg.User.id) === loggedInUserId) {
        messageDiv.classList.add("user-message");
    } else {
        messageDiv.classList.add("other-message");
    }

    messageDiv.innerHTML = `<strong>${msg.User ? msg.User.name : "Unknown"}:</strong><br> ${msg.message}`;
    
    // Check if user is at the bottom before appending
    const shouldScroll = chatBox.scrollTop + chatBox.clientHeight >= chatBox.scrollHeight - 10;
    
    chatBox.appendChild(messageDiv);

    // Auto-scroll only if the user was already at the bottom
    if (shouldScroll) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// Store only the latest 10 messages in local storage
function updateLocalStorage(newMessages) {
    let storedMessages = JSON.parse(localStorage.getItem("chatMessages"));
    
        const uniqueMessages = [...storedMessages, ...newMessages]
        .filter((msg, index, self) => self.findIndex(m => m.id === msg.id) === index)
        .slice(-10); 

    localStorage.setItem("chatMessages", JSON.stringify(uniqueMessages));
}

// Send message
async function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (!message) return;

    try {
        await axios.post(`${baseURL}/chat/send`, { message }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        messageInput.value = "";
        loadNewMessages(); 
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

