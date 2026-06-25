document.addEventListener("DOMContentLoaded", async () => {
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {
        window.location = "login.html";

        return;
    }

    loadUser();
});

/* ===================
LOAD USER
=================== */

async function loadUser() {
    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    document.getElementById("userName").innerText = user.email;
}

/* ===================
LOGOUT
=================== */

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();

        window.location = "login.html";
    });
}

/* ===================
MOBILE MENU
=================== */

const menuToggle = document.getElementById("menuToggle");

const sidebar = document.querySelector(".sidebar");

const overlay = document.getElementById("overlay");

if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");

        overlay.classList.toggle("active");
    });
}

if (overlay) {
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");

        overlay.classList.remove("active");
    });
}


document
.querySelectorAll(".sidebar a")
.forEach(link=>{

link.addEventListener(
"click",
()=>{

if(window.innerWidth <= 768){

sidebar.classList.remove("active");

overlay.classList.remove("active");

}

});

});