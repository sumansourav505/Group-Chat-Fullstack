// public/admin.js
const baseUrl = "http://localhost:3000"; // Adjust according to your backend
const token = localStorage.getItem("token"); // Retrieve auth token

async function inviteUser(groupId, userId) {
    try {
        const response = await axios.post(`${baseUrl}/admin/invite`, { groupId, userId }, {
            headers: { Authorization: token }
        });
        alert(response.data.message);
    } catch (error) {
        console.error("Error inviting user:", error);
    }
}

async function makeAdmin(groupId, userId) {
    try {
        const response = await axios.post(`${baseUrl}/admin/make-admin`, { groupId, userId }, {
            headers: { Authorization: token }
        });
        alert(response.data.message);
    } catch (error) {
        console.error("Error making admin:", error);
    }
}
async function removeUser(groupId, userId) {
    try {
        const response = await axios.post(`${baseUrl}/admin/remove-user`, { groupId, userId }, {
            headers: { Authorization: token }
        });
        alert(response.data.message);
    } catch (error) {
        console.error("Error removing user:", error);
    }
}

async function getGroupMembers(groupId) {
    try {
        const response = await axios.get(`${baseUrl}/admin/group-members/${groupId}`, {
            headers: { Authorization: token }
        });
        return response.data.members;
    } catch (error) {
        console.error("Error fetching group members:", error);
    }
}
