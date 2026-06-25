/* REGISTER */

const registerForm =
document.getElementById("registerForm");

if(registerForm){

registerForm.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

const fullname =
document.getElementById(
"fullname"
).value;

const email =
document.getElementById(
"regEmail"
).value;

const password =
document.getElementById(
"regPassword"
).value;

const {data,error} =
await supabaseClient.auth.signUp({

email,
password,

options:{
data:{
fullname
}
}

});

if(error){

alert(error.message);

}else{

alert(
"Silakan cek email verifikasi."
);

window.location =
"login.html";

}

});
}

/* LOGIN */

const loginForm =
document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

const email =
document.getElementById(
"email"
).value;

const password =
document.getElementById(
"password"
).value;

const {error} =
await supabaseClient.auth.signInWithPassword({

email,
password

});

if(error){

alert(error.message);

}else{

window.location =
"dashboard.html";

}

});
}

/* GOOGLE LOGIN */

const googleBtn =
document.getElementById(
"googleLogin"
);

if(googleBtn){

googleBtn.addEventListener(
"click",
async()=>{

await supabaseClient.auth.signInWithOAuth({

provider:"google",

options:{

redirectTo:
window.location.origin +
"/dashboard.html"

}

});

});
}