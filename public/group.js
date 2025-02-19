const baseURL = "http://localhost:4000";
const token = localStorage.getItem("token");
const userId = Number(localStorage.getItem("userId"));

document.addEventListener("DOMContentLoaded", () => {
    console.log("Page Loaded. Fetching user groups...");
    loadUserGroups();

    const groupInfoSidebar = document.getElementById("groupInfoSidebar");
    const info_Btn = document.getElementById("info-btn");
    // Initially hide the info button and sidebar
    if (info_Btn) info_Btn.style.display = "none";
    if (groupInfoSidebar) groupInfoSidebar.style.display = "none";

    if (info_Btn) {
        info_Btn.addEventListener("click", () => {
            if (!selectedGroupId) {
                alert("Please select a group first.");
                return;
            }
            toggleGroupInfo();
        });
    }
});

let selectedGroupId = null; // Stores the selected group ID

const groupList = document.getElementById("groupList");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messages");
const groupMembersList = document.getElementById("groupMembersList");

// Toggle Group Info Sidebar
async function toggleGroupInfo() {
    if (!selectedGroupId) {
        console.error("No group selected.");
        return;
    }

    const groupInfoSidebar = document.getElementById("groupInfoSidebar");
    if (groupInfoSidebar) {
        groupInfoSidebar.style.display = groupInfoSidebar.style.display === "none" ? "block" : "none";
    }

    await showGroupInfo(selectedGroupId);
}

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
            li.addEventListener("click", () => selectGroup(group.id, group.name));
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

    const info_Btn = document.getElementById("info-btn");
    if (info_Btn) info_Btn.style.display = "inline-block"; // Show info button

    const groupInfoSidebar = document.getElementById("groupInfoSidebar");
    if (groupInfoSidebar) groupInfoSidebar.style.display = "none"; // Hide sidebar when switching groups

    await loadGroupMessages(groupId);
}

// Show Group Info
// async function showGroupInfo(groupId) {
//     try {
//         const response = await axios.get(`${baseURL}/group/info/${groupId}`, {
//             headers: { Authorization: `Bearer ${token}` },
//         });

//         const group = response.data;
//         const groupInfoSidebar = document.getElementById("groupInfoSidebar");

//         if (groupInfoSidebar) {
//             groupInfoSidebar.innerHTML = `
//                 <h3>${group.name}</h3>
//                 <p><strong>Created By:</strong> ${group.createdBy}</p>
//                 <p><strong>Members (${group.members.length}):</strong></p>
//                 <ul>
//                     ${group.members.map(member => `<li>${member.name}</li>`).join("")}
//                 </ul>
//             `;

//             // Show the sidebar and adjust chatbox width
//             groupInfoSidebar.classList.add("open");
//             document.querySelector(".chatbox").classList.add("shrink");
//         }
//     } catch (error) {
//         console.error("Error loading group info:", error);
//     }
// }

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
        await axios.post(`${baseURL}/group/send-message`, 
            { message: message, groupId: selectedGroupId }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        messageInput.value = ""; // Clear input field
        await loadGroupMessages(selectedGroupId); // Refresh messages
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

// Auto-scroll to bottom
function scrollToBottom() {
    const messagesContainer = document.getElementById("messages");
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
            const messageElement = document.createElement("div");
            messageElement.classList.add("message", msg.senderId === userId ? "sent" : "received");
            messageElement.innerHTML = `<strong>${msg.senderName}:</strong> ${msg.message}`;
            messagesContainer.appendChild(messageElement);
        });

        scrollToBottom();
    } catch (error) {
        console.error("Error loading messages:", error);
    }
}
async function showGroupInfo(groupId) {
    try {
        const response = await axios.get(`${baseURL}/group/info/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const group = response.data;
        const groupInfoSidebar = document.getElementById("groupInfoSidebar");
        console.log(group.members.isAdmin);

        if (groupInfoSidebar) {
            groupInfoSidebar.innerHTML = `
                <h3>${group.name}</h3>
                <p><strong>Members (${group.members.length}):</strong></p>
                <ul>
                    ${group.members
                        .map(member => 
                            `<li>${member.name} ${member.isAdmin ? "<span style='color: red;'>(Admin)</span>" : ""}</li>`
                        ).join("")
                    }
                </ul>
            `;

            // Show the sidebar and adjust chatbox width
            groupInfoSidebar.classList.add("open");
            document.querySelector(".chatbox").classList.add("shrink");
        }
    } catch (error) {
        console.error("Error loading group info:", error);
    }
}
