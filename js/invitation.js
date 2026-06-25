const params = new URLSearchParams(window.location.search);

const guestName = params.get("to") || "Tamu Undangan";

document.getElementById("guestName").innerText = guestName;

const slug = window.location.pathname.split("/").filter(Boolean)[0];

let invitationData = null;

document.addEventListener("DOMContentLoaded", async () => {
    await loadInvitation();
});

async function loadInvitation() {
    const { data, error } = await supabaseClient
        .from("invitations")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        console.error(error);

        return;
    }

    invitationData = data;

    document.getElementById("coupleName").innerText =
        `${data.groom_name} & ${data.bride_name}`;

    if (data.cover_photo) {
        document.getElementById("cover").style.backgroundImage =
            `url(${data.cover_photo})`;
    }

    if (data.love_story) {
        document.getElementById("loveStory").innerHTML = data.love_story;
    }
    await saveVisitor();

    await loadCouple();
    await loadEvent();
    await loadGallery();
    await loadWallet();
    await loadMusic();
    await loadGuestbook();
}

async function loadCouple() {
    const groomCard = document.getElementById("groomCard");

    const brideCard = document.getElementById("brideCard");

    groomCard.innerHTML = `

<div class="person-card">

<img src="${invitationData.groom_photo}">

<h3>
${invitationData.groom_name}
</h3>

<p>
Putra dari
<br>
${invitationData.groom_father}
&
${invitationData.groom_mother}
</p>

</div>

`;

    brideCard.innerHTML = `

<div class="person-card">

<img src="${invitationData.bride_photo}">

<h3>
${invitationData.bride_name}
</h3>

<p>
Putri dari
<br>
${invitationData.bride_father}
&
${invitationData.bride_mother}
</p>

</div>

`;
}

async function loadEvent() {
    const { data } = await supabaseClient
        .from("events")
        .select("*")
        .eq("invitation_id", invitationData.id)
        .single();

    if (!data) return;

    document.getElementById("eventContent").innerHTML = `

<div class="event-card">

<h3>Akad Nikah</h3>

<p>${data.akad_date}</p>

<p>${data.akad_time}</p>

<p>${data.akad_location}</p>

</div>

<div class="event-card">

<h3>Resepsi</h3>

<p>${data.reception_date}</p>

<p>${data.reception_time}</p>

<p>${data.reception_location}</p>

</div>

`;

    startCountdown(data.reception_date);
}

function startCountdown(date) {
    const target = new Date(date).getTime();

    setInterval(() => {
        const now = new Date().getTime();

        const distance = target - now;

        document.getElementById("days").innerText = Math.floor(
            distance / (1000 * 60 * 60 * 24)
        );

        document.getElementById("hours").innerText = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );

        document.getElementById("minutes").innerText = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
        );

        document.getElementById("seconds").innerText = Math.floor(
            (distance % (1000 * 60)) / 1000
        );
    }, 1000);
}

async function loadGallery() {
    const { data } = await supabaseClient
        .from("galleries")
        .select("*")
        .eq("invitation_id", invitationData.id);

    const gallery = document.getElementById("galleryGrid");

    gallery.innerHTML = "";

    data.forEach(item => {
        gallery.innerHTML += `<img src="${item.image_url}">`;
    });
}

async function loadWallet() {
    const { data } = await supabaseClient
        .from("wallets")
        .select("*")
        .eq("invitation_id", invitationData.id);

    const container = document.getElementById("walletContainer");

    container.innerHTML = "";

    data.forEach(wallet => {
        container.innerHTML += `

<div class="wallet-card">

<h3>
${wallet.bank_name}
</h3>

<p>
${wallet.owner_name}
</p>

<p id="wallet-${wallet.id}">
${wallet.account_number}
</p>

<button
class="copy-btn"
onclick="
copyWallet(
'${wallet.account_number}'
)
">

Copy

</button>

</div>

`;
    });
}

function copyWallet(number) {
    navigator.clipboard.writeText(number);

    alert("Nomor rekening berhasil disalin");
}

const rsvpForm = document.getElementById("rsvpForm");

if (rsvpForm) {
    rsvpForm.addEventListener("submit", submitRSVP);
}

async function submitRSVP(e) {
    e.preventDefault();

    const guestName = document.getElementById("guestInput").value;

    const attendance = document.getElementById("attendance").value;

    const guestCount = document.getElementById("guestCount").value;

    const message = document.getElementById("message").value;

    const { error } = await supabaseClient.from("rsvp").insert({
        invitation_id: invitationData.id,

        guest_name: guestName,

        attendance: attendance,

        guest_count: guestCount,

        message: message
    });

    if (error) {
        alert(error.message);

        return;
    }

    alert("Konfirmasi kehadiran berhasil dikirim");

    rsvpForm.reset();

    await loadGuestbook();
}

async function loadGuestbook() {
    const { data, error } = await supabaseClient
        .from("rsvp")
        .select("*")
        .eq("invitation_id", invitationData.id)
        .order("created_at", {
            ascending: false
        });

    if (error) return;

    const list = document.getElementById("guestbookList");

    list.innerHTML = "";

    data.forEach(item => {
        list.innerHTML += `

<div class="message-card">

<h4>
${item.guest_name}
</h4>

<p>

${item.message || "-"}

</p>

<small>

${item.attendance}

</small>

</div>

`;
    });
}

async function loadMusic() {
    const { data } = await supabaseClient
        .from("music")
        .select("*")
        .eq("invitation_id", invitationData.id)
        .single();

    if (!data) return;

    const audio = document.getElementById("bgMusic");

    audio.src = data.music_url;
}

const openBtn = document.getElementById("openInvitation");

openBtn.addEventListener("click", () => {
    document.getElementById("cover").style.display = "none";

    const audio = document.getElementById("bgMusic");

    audio.play();
});

const musicBtn = document.getElementById("musicBtn");

let playing = true;

musicBtn.addEventListener("click", () => {
    const audio = document.getElementById("bgMusic");

    if (playing) {
        audio.pause();

        playing = false;
    } else {
        audio.play();

        playing = true;
    }
});

async function saveVisitor() {
    await supabaseClient.from("visitors").insert({
        invitation_id: invitationData.id,

        guest_name: guestName
    });
}

const { data: template } = await supabaseClient
    .from("templates")
    .select("*")
    .eq("id", invitationData.template_id)
    .single();
if(template){

    document.body.classList.add(
        template.slug
    );

}