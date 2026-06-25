document
.getElementById("registerForm")
.addEventListener("submit",
async (e)=>{

e.preventDefault();

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

const { error } =
await supabase.auth.signUp({
email,
password
});

if(error){
alert(error.message);
return;
}

alert(
"Silakan cek email untuk verifikasi akun"
);

window.location.href =
"../login/login.html";

});