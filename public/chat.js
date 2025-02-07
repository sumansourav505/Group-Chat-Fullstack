document.addEventListener("DOMContentLoaded", loadMessages);

const baseURL = 'http://localhost:4000';

async function loadMessages() {
    try {
        const response = await axios.get(`${baseURL}/chat/messages`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const messages = response.data;
        console.log(messages)
        const chatBox = document.getElementById("chatBox");
        chatBox.innerHTML = "";

        messages.forEach(msg => {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message");

            if (msg.User) {
                messageDiv.classList.add(msg.User.id === getLoggedInUserId() ? "user-message" : "other-message");
                messageDiv.innerHTML = `<strong>${msg.User.name}:</strong> ${msg.message}`;
            } else {
                messageDiv.classList.add("other-message");
                messageDiv.innerHTML = `<strong>Unknown:</strong> ${msg.message}`;
            }

            chatBox.appendChild(messageDiv);
        });

        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.error("Error loading messages:", error);
    }
}

async function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (!message) return;

    try {
        await axios.post(`${baseURL}/chat/send`, { message }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        messageInput.value = "";
        loadMessages(); // Refresh chat after sending

    } catch (error) {
        console.error("Error sending message:", error);
    }
}

// Function to get logged-in user ID from token (JWT)
function getLoggedInUserId() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
        return payload.userId;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
}
