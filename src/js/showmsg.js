function showLoginLogout(){
if (sessionStorage.getItem('userName') == null) {
    // document.getElementById('signin1').innerHTML = "Signin";
    // document.getElementById('signout1').innerHTML = "";
    // document.getElementById('role').innerHTML = "";
}
else {
    // document.getElementById('signout1').innerHTML = "Signout";
    // document.getElementById('signin1').innerHTML = "";
    // document.getElementById('welcomeMessage').innerHTML = `${sessionStorage.getItem('userName')}`;
    // document.getElementById('role').innerHTML = `[${sessionStorage.getItem('user_role')==null?'':sessionStorage.getItem('user_role')}]`;
}
}
showLoginLogout();
// let welcomDiv = document.getElementById('welcomeMessage');
// let signin = document.getElementById('signin');
// let signout = document.getElementById('signout');
// signout.innerHTML = "";
// function showWelcomeMessage(account) {
//     // Reconfiguring DOM elements
//     welcomDiv.innerHTML = `Welcome ${account.name}`;
//     signin.innerHTML = "";
//     signout.innerHTML = "Signout";
// }

