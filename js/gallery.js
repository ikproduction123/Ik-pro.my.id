const uploadBtn = document.getElementById("uploadGallery");

uploadBtn.addEventListener("click", uploadGallery);

async function uploadGallery() {
    const files = document.getElementById("galleryInput").files;

    if (files.length === 0) {
        alert("Pilih foto");

        return;
    }

    const invitationId = localStorage.getItem("invitation_id");

    for (const file of files) {
        const filename = Date.now() + "-" + file.name;

        const { error: uploadError } = await supabaseClient.storage
            .from("gallery")
            .upload(filename, file);

        if (uploadError) {
            console.log(uploadError);

            continue;
        }

        const { data } = supabaseClient.storage
            .from("gallery")
            .getPublicUrl(filename);

        await supabaseClient.from("galleries").insert({
            invitation_id: invitationId,

            image_url: data.publicUrl
        });
    }

    alert("Upload selesai");

    loadGallery();
}

async function loadGallery() {
    const invitationId = localStorage.getItem("invitation_id");

    const { data, error } = await supabaseClient
        .from("galleries")
        .select("*")
        .eq("invitation_id", invitationId)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        return;
    }

    const grid = document.getElementById("galleryGrid");

    grid.innerHTML = "";

    data.forEach(photo => {
        grid.innerHTML += `

<div class="gallery-item">

<img src="${photo.image_url}">

<div class="gallery-action">

<button
onclick="deletePhoto('${photo.id}')">

Hapus

</button>

</div>

</div>

`;
    });
}

loadGallery();

async function deletePhoto(id){

if(
!confirm(
"Hapus foto?"
)
){
return;
}

await supabaseClient
.from("galleries")
.delete()
.eq("id",id);

loadGallery();

}