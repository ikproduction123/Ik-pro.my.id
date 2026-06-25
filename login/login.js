document
.getElementById("loginForm")
.addEventListener("submit", async (e) => {

  e.preventDefault();

  const email =
  document.getElementById("email").value;

  const password =
  document.getElementById("password").value;

  const { data, error } =
  await supabase.auth.signInWithPassword({
    email,
    password
  });

  console.log(data);
  console.log(error);

  if(error){
    alert(error.message);
    return;
  }

  window.location.href =
  "../dashboard/dashboard.html";

});

document
.getElementById("googleLogin")
.addEventListener("click", async () => {

  await supabase.auth.signInWithOAuth({
    provider:"google"
  });

});