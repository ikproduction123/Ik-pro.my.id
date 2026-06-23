import { supabase } from "../supabase/config.js";

// Cek session
const {
    data: { session }
} = await supabase.auth.getSession();

if (!session) {
    window.location.href = "../login/";
}

// Tampilkan email user
document.getElementById("userEmail").textContent =
    session.user.email;

// Logout
document.getElementById("logoutBtn")
.addEventListener("click", async () => {

    await supabase.auth.signOut();

    window.location.href = "../login/login.html";
});