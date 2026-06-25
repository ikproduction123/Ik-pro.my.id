document.getElementById("eventForm").addEventListener("submit", async e => {
    e.preventDefault();

    const akadDate = document.getElementById("akadDate").value;

    const akadTime = document.getElementById("akadTime").value;

    const akadLocation = document.getElementById("akadLocation").value;

    const akadMaps = document.getElementById("akadMaps").value;

    const receptionDate = document.getElementById("receptionDate").value;

    const receptionTime = document.getElementById("receptionTime").value;

    const receptionLocation =
        document.getElementById("receptionLocation").value;

    const receptionMaps = document.getElementById("receptionMaps").value;

    /*
ambil invitation_id user
*/

    const invitationId = localStorage.getItem("invitation_id");

    const { error } = await supabaseClient
        .from("events")
        .update({
            akad_date: akadDate,
            akad_time: akadTime,
            akad_location: akadLocation,
            akad_maps: akadMaps,

            reception_date: receptionDate,
            reception_time: receptionTime,
            reception_location: receptionLocation,
            reception_maps: receptionMaps
        })
        .eq("invitation_id", invitationId);

    if (error) {
        alert(error.message);
    } else {
        alert("Acara berhasil disimpan");
    }
});


const weddingDate =
new Date(
event.reception_date
).getTime();

setInterval(()=>{

const now =
new Date().getTime();

const distance =
weddingDate - now;

const days =
Math.floor(
distance /
(1000*60*60*24)
);

document.getElementById(
"days"
).innerText =
days;

},1000);