const uploadBtn = document.getElementById("uploadMusic");

uploadBtn.addEventListener("click", uploadMusic);

async function uploadMusic() {
    const file = document.getElementById("musicFile").files[0];

    if (!file) {
        alert("Pilih file MP3");

        return;
    }

    const invitationId = localStorage.getItem("invitation_id");

    const filename = Date.now() + "-" + file.name;

    const { error: uploadError } = await supabaseClient.storage
        .from("music")
        .upload(filename, file);

    if (uploadError) {
        alert(uploadError.message);

        return;
    }

    const { data } = supabaseClient.storage
        .from("music")
        .getPublicUrl(filename);

    const musicUrl = data.publicUrl;

    const { error } = await supabaseClient.from("music").upsert({
        invitation_id: invitationId,

        music_url: musicUrl,

        autoplay: true
    });

    if (error) {
        alert(error.message);

        return;
    }

    alert("Musik berhasil disimpan");

    loadMusic();
}


async function loadMusic(){

const invitationId =
localStorage.getItem(
"invitation_id"
);

const {
data
}
=
await supabaseClient
.from("music")
.select("*")
.eq(
"invitation_id",
invitationId
)
.single();

if(!data) return;

document.getElementById(
"musicPreview"
).innerHTML = `

<div class="music-player">

<audio controls>

<source
src="${data.music_url}"
type="audio/mpeg">

</audio>

</div>

`;

}

loadMusic();