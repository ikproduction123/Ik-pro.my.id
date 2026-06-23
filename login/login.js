import { supabase } from "../supabase/config.js";

/* =======================
   TAB SWITCH
======================= */

const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll(".form");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {

        tabs.forEach(t => t.classList.remove("active"));
        forms.forEach(f => f.classList.remove("active"));

        tab.classList.add("active");

        document
            .getElementById(tab.dataset.tab + "Form")
            .classList.add("active");
    });
});

/* =======================
   REGISTER
======================= */

const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const fullName = document.getElementById("fullName").value;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName
            }
        }
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Pendaftaran berhasil! Silakan cek email untuk verifikasi.");
});

/* =======================
   LOGIN
======================= */

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    window.location.href = "../dashboard/dashboard.html";
});