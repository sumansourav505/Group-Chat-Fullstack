document.addEventListener("DOMContentLoaded", function () {
    const signUpForm = document.getElementById("signUpForm");

    if (!signUpForm) {
        console.error("Error: signUpForm not found!");
        return;
    }

    const baseURL = "http://localhost:4000";

    signUpForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("pwd").value.trim();

        if (!name || !email || !phone || !password) {
            alert("Please fill all the fields.");
            return;
        }

        const userData = { name, email, phone, password };

        try {
            const response = await axios.post(`${baseURL}/user/signup`, userData);
            //console.log("Signup successful:", response.data);
            alert(response.data.message);
            signUpForm.reset();
            window.location.href = "/";
        } catch (error) {
            console.error("Error:", error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(`Sign-Up failed: ${error.response.data.message}`);
            } else {
                alert("An error occurred. Try again.");
            }
        }
    });
});
