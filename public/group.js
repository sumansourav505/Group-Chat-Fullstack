const baseURL = "http://localhost:4000";
const socket=io(baseURL);
const token = localStorage.getItem("token");
const userId = Number(localStorage.getItem("userId"));


let selectedGroupId = null;

document.addEventListener("DOMContentLoaded", () => {
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

 // Stores the selected group ID

const groupList = document.getElementById("groupList");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messages");
const groupMembersList = document.getElementById("groupMembersList");

//socket events
//listen for new messages
socket.on('receiveMessage',(messageData)=>{
    if(messageData.groupId){
        displayMessage(messageData);
    }
});
//listen for user joining
socket.on('userJoined',(data)=>{
    if(data.groupId===selectedGroupId){
        const joinMsg=document.createElement('div');
        joinMsg.classList.add('system-message');
        joinMsg.innerHTML=`<em>${data.userName} joined the group the group</em>`;
        messagesContainer.appendChild(joinMsg);
        scrollToBottom();
    }
})

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
    console.log(localStorage.getItem("userName"));
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
    socket.emit("joinGroup",{userId,groupId});
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
    //const senderName=localStorage.getItem('userName')||'unknown'
    // Emit message through WebSocket
    socket.emit("sendMessage", {
        message,
        groupId: selectedGroupId,
        senderId: userId,
        senderName: localStorage.getItem("userName")||"unknown",
    });

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

        response.data.forEach(displayMessage);

        scrollToBottom();
    } catch (error) {
        console.error("Error loading messages:", error);
    }
}
//display message
function displayMessage(msg) {

    const senderName = msg.senderName; // Ensure we don't display 'undefined'
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", msg.senderId === userId ? "sent" : "received");
    messageElement.innerHTML = `<strong>${senderName}:</strong> ${msg.message}`;

    messagesContainer.appendChild(messageElement);
    scrollToBottom();
}

// Show Group Info
async function showGroupInfo(groupId) {
    try {
        const response = await axios.get(`${baseURL}/group/info/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const group = response.data;
        const groupInfoSidebar = document.getElementById("groupInfoSidebar");

        if (groupInfoSidebar) {
            document.body.dataset.isAdmin=group.createdBy==userId?"true":"false";

            groupInfoSidebar.innerHTML = `
                <h3>${group.name}</h3>
                <input type="text" placeholder="Search..member.." id="search-input"></input>
                <button id="search-btn">Search</button>
                <p><strong>Members (${group.members.length}):</strong></p>
                <ul id="memberList">
                    ${group.members.map(member => `
                         <li data-member-id="${member.id}" data-user-id="${member.id}" data-is-admin="${member.isAdmin}">
                            ${member.name} ${member.isAdmin ? "<span style='color: yellow;'>(Admin)</span>" : ""}
                        </li>`).join("")}
                </ul>
            `;

            // Show the sidebar and adjust chatbox width
            groupInfoSidebar.classList.add("open");
            document.querySelector(".chatbox").classList.add("shrink");
            //eventlistener for searching
            document.getElementById("search-btn").addEventListener("click", searchGroupMember);
            document.getElementById("search-input").addEventListener("keyup", searchGroupMember);
            document.querySelectorAll("#groupInfoSidebar ul li").forEach(memberItem => {
                memberItem.addEventListener("click", function () {
                    toggleAdminOptions(memberItem);
                });
            });
        }
    } catch (error) {
        console.error("Error loading group info:", error);
    }
}
function searchGroupMember(){
    const searchInput=document.getElementById('search-input').value.toLowerCase();
    const membersList=document.querySelectorAll('#groupInfoSidebar ul li');
    membersList.forEach(member=>{
        const name=member.textContent.toLowerCase();
        if(name.includes(searchInput)){
            member.style.display="block";
        }else{
            member.style.display="none";
        }

    });
}
function toggleAdminOptions(member) {
    const isCurrentUserAdmin=document.body.dataset.isAdmin==="true";
    if(!isCurrentUserAdmin){
        return;
    }

    let buttonsContainer = member.querySelector(".admin-buttons");
    if (buttonsContainer) {
        buttonsContainer.remove();
        return;
    }
    if(member.dataset.isAdmin==="true"){
        return;
    }
    
    buttonsContainer = document.createElement("div");
    buttonsContainer.className = "admin-buttons";
    
    const makeAdminBtn = document.createElement("button");
    makeAdminBtn.textContent = "Make Admin";
    makeAdminBtn.addEventListener("click", () => makeAdmin(member.dataset.userId));
    
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeMember(member.dataset.userId));
    
    buttonsContainer.appendChild(makeAdminBtn);
    buttonsContainer.appendChild(removeBtn);
    
    member.appendChild(buttonsContainer);
}

async function makeAdmin(userId) {
    try {
        await axios.put(`${baseURL}/admin/make-admin`, { groupId: selectedGroupId, userId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert("User promoted to admin");
        showGroupInfo(selectedGroupId);
    } catch (error) {
        console.error("Error making user admin:", error);
    }
}
async function removeMember(userId) {
    try {
        await axios.delete(`${baseURL}/admin/remove-member`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { groupId: selectedGroupId, userId }
        });
        alert("User removed from group");
        showGroupInfo(selectedGroupId);
    } catch (error) {
        console.error("Error removing user:", error);
    }
}