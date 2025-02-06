const loginForm=document.getElementById('loginForm');
const baseURL='http://localhost:4000';
loginForm.addEventListener('submit',async function(event){
    event.preventDefault();
    const email=document.getElementById('email').value.trim();
    const password=document.getElementById('pwd').value.trim();

    if(!email || !password){
        alert('Please fill all the fields.');
        return;
    }

    const loginData={email,password};
    const loginButton=event.submitter;
    try{
        const response=await axios.post(`${baseURI}/user/login`,loginData);
        if(response.status===200){
            alert('Login successful!')
            loginForm.reset();
        }
    }catch(error){
        console.error('Login error:',error);
        alert(error.response?.data?.message||'An error occured login');
    }finally{
        loginButton.disable=false;
        loginButton.textContent='Login...';
    }

});