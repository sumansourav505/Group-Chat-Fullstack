// document.addEventListener("DOMContentLoaded", () => {
//     console.log("Page Loaded. Fetching user groups...");
//     loadUserGroups();
// });

// const baseURL = "http://localhost:4000";
// const token = localStorage.getItem("token");
// const userId = Number(localStorage.getItem("userId"));

// let selectedGroupId = null; // Stores the selected group ID

// const groupList = document.getElementById("groupList");

// // Load user groups
// async function loadUserGroups() {
//     if (!userId) {
//         console.error("User ID not found");
//         return;
//     }

//     try {
//         const response = await axios.get(`${baseURL}/group/user-groups`, {
//             headers: { Authorization: `Bearer ${token}` }
//         });

//         console.log("User Groups:", response.data);
        
//         groupList.innerHTML = ""; // Clear existing groups

//         response.data.forEach(group => {
//             const li = document.createElement("li");
//             li.textContent = group.name;
//             li.addEventListener("click", () => selectGroup(group.id, group.name)); // Set selected group
//             groupList.appendChild(li);
//         });

//     } catch (error) {
//         console.error("Error loading user groups:", error);
//     }
// }

// // Select a group
// function selectGroup(groupId, groupName) {
//     selectedGroupId = groupId; // Store selected group ID
//     document.getElementById("groupTitle").textContent = groupName;
//     document.getElementById("messages").innerHTML = ""; // Clear previous messages
// }

// // Create a new group
// async function createGroup() {
//     const groupName = prompt("Enter Group Name:");
//     if (!groupName) return;

//     try {
//         await axios.post(`${baseURL}/group/create`, { name: groupName }, {
//             headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
//         });

//         loadUserGroups(); // Reload groups after creation
//     } catch (error) {
//         console.error("Error creating group:", error.response?.data || error.message);
//     }
// }

// // Invite a user to the selected group
// async function inviteUser() {
//     if (!selectedGroupId) {
//         alert("Please select a group first.");
//         return;
//     }

//     const inviteUserId = document.getElementById("inviteUserId").value;
//     if (!inviteUserId) {
//         alert("Enter a valid user ID to invite.");
//         return;
//     }

//     try {
//         const response = await axios.post(`${baseURL}/group/invite`, 
//             { groupId: selectedGroupId, userId: inviteUserId }, 
//             { headers: { Authorization: `Bearer ${token}` } }
//         );
//        // console.log(response.data);

//         alert(response.data.message); // Show success message
//         document.getElementById("inviteUserId").value = ""; // Clear input
//     } catch (error) {
//         console.error("Error inviting user:", error);
//         alert(error.response?.data?.error || "Failed to invite user");
//     }
// }
//updated
document.addEventListener("DOMContentLoaded", () => {
    console.log("Page Loaded. Fetching user groups...");
    loadUserGroups();
});

const baseURL = "http://localhost:4000";
const token = localStorage.getItem("token");
const userId = Number(localStorage.getItem("userId"));

let selectedGroupId = null; // Stores the selected group ID

const groupList = document.getElementById("groupList");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messages");

// Load user groups
async function loadUserGroups() {
    if (!userId) {
        console.error("User ID not found");
        return;
    }

    try {
        const response = await axios.get(`${baseURL}/group/user-groups`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("User Groups:", response.data);
        
        groupList.innerHTML = ""; // Clear existing groups

        response.data.forEach(group => {
            const li = document.createElement("li");
            li.textContent = group.name;
            li.addEventListener("click", () => selectGroup(group.id, group.name)); // Set selected group
            groupList.appendChild(li);
        });

    } catch (error) {
        console.error("Error loading user groups:", error);
    }
}

// Select a group
async function selectGroup(groupId, groupName) {
    selectedGroupId = groupId; // Store selected group ID
    document.getElementById("groupTitle").textContent = groupName;
    messagesContainer.innerHTML = ""; // Clear previous messages
    await loadGroupMessages(groupId);
}

// Create a new group
async function createGroup() {
    const groupName = prompt("Enter Group Name:");
    if (!groupName) return;

    try {
        await axios.post(`${baseURL}/group/create`, { name: groupName }, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        });

        loadUserGroups(); // Reload groups after creation
    } catch (error) {
        console.error("Error creating group:", error.response?.data || error.message);
    }
}

// Invite a user to the selected group
async function inviteUser() {
    if (!selectedGroupId) {
        alert("Please select a group first.");
        return;
    }

    const inviteUserId = document.getElementById("inviteUserId").value;
    if (!inviteUserId) {
        alert("Enter a valid user ID to invite.");
        return;
    }

    try {
        const response = await axios.post(`${baseURL}/group/invite`, 
            { groupId: selectedGroupId, userId: inviteUserId }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        alert(response.data.message); // Show success message
        document.getElementById("inviteUserId").value = ""; // Clear input
    } catch (error) {
        console.error("Error inviting user:", error);
        alert(error.response?.data?.error || "Failed to invite user");
    }
}

// Send a message to the selected group
async function sendMessage() {
    if (!selectedGroupId) {
        alert("Please select a group first.");
        return;
    }

    const message = messageInput.value.trim();
    if (!message) {
        alert("Message cannot be empty.");
        return;
    }

    try {
        const response = await axios.post(`${baseURL}/group/send-message`, 
            { message: message, groupId: selectedGroupId }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(response.data);
    
        messageInput.value = ""; // Clear input field
        const chatMessage = response.data.chatMessage;
        displayMessage(chatMessage.name, chatMessage.message);
    
        await loadGroupMessages(selectedGroupId); // Refresh messages
    } catch (error) {
        console.error("Error sending message:", error);
        alert(error.response?.data?.error || "Failed to send message");
    }
}

function displayMessage(senderName, message, isSent = false) {
    const messagesContainer = document.getElementById("messages");

    if (!messagesContainer) {
        console.error("Error: Messages container not found!");
        return;
    }

    // Create message element
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.classList.add(isSent ? "sent" : "received"); // Different styling for sent vs received
    messageElement.innerHTML = `<strong>${senderName}:</strong> ${message}`;

    // Append message
    messagesContainer.appendChild(messageElement);

    // Auto-scroll to latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}




// Load messages for a group
async function loadGroupMessages(groupId) {
    try {
        const response = await axios.get(`${baseURL}/group/messages/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        messagesContainer.innerHTML = ""; // Clear existing messages

        response.data.forEach(msg => {
            const messageElement = document.createElement("p");
            messageElement.textContent = `${msg.senderName}: ${msg.message}`;
            messagesContainer.appendChild(messageElement);
        });

    } catch (error) {
        console.error("Error loading messages:", error);
    }
}
