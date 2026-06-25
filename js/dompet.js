const walletForm = document.getElementById("walletForm");

walletForm.addEventListener("submit", saveWallet);

async function saveWallet(e) {
    e.preventDefault();

    const invitationId = localStorage.getItem("invitation_id");

    const bankName = document.getElementById("bankName").value;

    const ownerName = document.getElementById("ownerName").value;

    const accountNumber = document.getElementById("accountNumber").value;

    const { error } = await supabaseClient.from("wallets").insert({
        invitation_id: invitationId,

        bank_name: bankName,

        owner_name: ownerName,

        account_number: accountNumber
    });

    if (error) {
        alert(error.message);

        return;
    }

    walletForm.reset();

    loadWallets();
}

async function loadWallets() {
    const invitationId = localStorage.getItem("invitation_id");

    const { data } = await supabaseClient
        .from("wallets")
        .select("*")
        .eq("invitation_id", invitationId);

    const list = document.getElementById("walletList");

    list.innerHTML = "";

    data.forEach(item => {
        list.innerHTML += `

<div class="wallet-card">

<h3>${item.bank_name}</h3>

<p>${item.owner_name}</p>

<p>${item.account_number}</p>

<button
onclick="deleteWallet('${item.id}')">

Hapus

</button>

</div>

`;
    });
}

loadWallets();

async function deleteWallet(id){

if(
!confirm(
"Hapus rekening?"
)
){
return;
}

await supabaseClient
.from("wallets")
.delete()
.eq("id",id);

loadWallets();

}