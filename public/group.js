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
const groupInfoContainer = document.getElementById("groupInfo");

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
    selectedGroupId = groupId;
    document.getElementById("groupTitle").textContent = groupName;
    messagesContainer.innerHTML = ""; // Clear previous messages
    await loadGroupMessages(groupId);
    //await loadGroupMembers(groupId);
    await showGroupInfo(groupId);
}
//showGroupInfo
async function showGroupInfo(groupId) {
    try {
        const response = await axios.get(`${baseURL}/group/info/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const group = response.data;

        groupInfoContainer.innerHTML = `
            <h3>${group.name}</h3>
            <p><strong>Members:</strong> ${group.members.length}</p>
            <p><strong>Created By:</strong> ${group.createdBy}</p>
        `;

    } catch (error) {
        console.error("Error loading group info:", error);
    }
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
    
        await loadGroupMessages(selectedGroupId); // Refresh messages
    } catch (error) {
        console.error("Error sending message:", error);
        alert(error.response?.data?.error || "Failed to send message");
    }
}

// Load messages for a group
async function loadGroupMessages(groupId) {
    try {
        const response = await axios.get(`${baseURL}/group/messages/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        messagesContainer.innerHTML = ""; // Clear existing messages

        response.data.forEach(msg => {
            const messageElement = document.createElement("div");
            messageElement.classList.add("message");

            const isSent = msg.senderId === userId;
            messageElement.classList.add(isSent ? "sent" : "received");

            // **Create sender name (bold)**
            const senderElement = document.createElement("strong");
            senderElement.textContent = `${msg.senderName}:`;

            // **Create message text (normal text)**
            const messageText = document.createElement("span");
            messageText.innerHTML = `<br>${msg.message}`; // Line break between name & message

            // Append sender name and message
            messageElement.appendChild(senderElement);
            messageElement.appendChild(messageText);

            messagesContainer.appendChild(messageElement);
        });

        // **Scroll to bottom automatically**
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

    } catch (error) {
        console.error("Error loading messages:", error);
    }
}




async function loadGroupMembers(groupId) {
    try {
        const response = await axios.get(`${baseURL}/group/members/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const membersContainer = document.getElementById("groupMembers");
        membersContainer.innerHTML = ""; // Clear existing members

        response.data.forEach(member => {
            const memberElement = document.createElement("p");
            memberElement.textContent = member.name;
            membersContainer.appendChild(memberElement);
        });

    } catch (error) {
        console.error("Error loading group members:", error);
    }
}