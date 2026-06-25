async function loadRSVPStats(){

const invitationId =
localStorage.getItem(
"invitation_id"
);

const {
data,
error
}
=
await supabaseClient
.from("rsvp")
.select("*")
.eq(
"invitation_id",
invitationId
);

if(error) return;

const hadir =
data.filter(
item =>
item.attendance === "hadir"
).length;

const tidakHadir =
data.filter(
item =>
item.attendance === "tidak_hadir"
).length;

const ucapan =
data.length;

document.getElementById(
"hadirCount"
).innerText =
hadir;

document.getElementById(
"tidakHadirCount"
).innerText =
tidakHadir;

document.getElementById(
"ucapanCount"
).innerText =
ucapan;

}

loadRSVPStats();