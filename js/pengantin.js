const file =
document.getElementById(
"coverPhoto"
).files[0];

const filename =
Date.now() + "-" + file.name;

await supabaseClient
.storage
.from("covers")
.upload(
filename,
file
);

const {
data
}
=
supabaseClient
.storage
.from("covers")
.getPublicUrl(
filename
);

const coverUrl =
data.publicUrl;