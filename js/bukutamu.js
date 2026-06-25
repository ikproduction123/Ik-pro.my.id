let guestData = [];

async function loadGuestbook() {
    const invitationId = localStorage.getItem("invitation_id");

    const { data, error } = await supabaseClient
        .from("rsvp")
        .select("*")
        .eq("invitation_id", invitationId)
        .order("created_at", {
            ascending: false
        });

    if (error) return;

    guestData = data;

    renderGuestbook(data);
}

loadGuestbook();

function renderGuestbook(data) {
    const table = document.getElementById("guestTable");

    table.innerHTML = "";

    data.forEach(item => {
        table.innerHTML += `

<div class="guest-item">

<h3>
${item.guest_name}
</h3>

<p>

Status:
${item.attendance}

</p>

<p>

Jumlah:
${item.guest_count}

</p>

<p>

${item.message || "-"}

</p>

</div>

`;
    });
}

document.getElementById("searchGuest").addEventListener("keyup", function () {
    const keyword = this.value.toLowerCase();

    const filtered = guestData.filter(item =>
        item.guest_name.toLowerCase().includes(keyword)
    );

    renderGuestbook(filtered);
});

document
.getElementById(
"exportCsv"
)
.addEventListener(
"click",
()=>{

let csv =
"Nama,Status,Jumlah,Ucapan\n";

guestData.forEach(item=>{

csv +=

`${item.guest_name},
${item.attendance},
${item.guest_count},
"${item.message}"\n`;

});

const blob =
new Blob(
[csv],
{
type:"text/csv"
}
);

const url =
URL.createObjectURL(
blob
);

const a =
document.createElement("a");

a.href = url;

a.download =
"buku-tamu.csv";

a.click();

});