const loginForm = document.getElementById('loginForm');
const baseURL = 'http://localhost:4000';

loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('pwd').value.trim();

    if (!email || !password) {
        alert('Please fill all the fields.');
        return;
    }

    const loginData = { email, password };
    const loginButton = event.submitter;

    try {
        const response = await axios.post(`${baseURL}/user/login`, loginData);

        if (response.status === 200) {
            const { token, userId } = response.data; // Ensure backend returns userId
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId.toString()); // Store userId correctly

            console.log("Stored userId in localStorage:", userId); // Debugging

            alert('Login successful!');
            loginForm.reset();
            //window.location.href = "/chat";
            window.location.href="/group";
        }
    } catch (error) {
        console.error('Login error:', error);
        alert(error.response?.data?.message || 'An error occurred during login');
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
});
