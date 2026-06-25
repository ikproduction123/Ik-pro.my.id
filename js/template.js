async function loadTemplates() {

    const { data, error } =
        await supabaseClient
            .from("templates")
            .select("*")
            .eq("is_active", true);

    if (error) return;

    const grid =
        document.getElementById("templateGrid");

    grid.innerHTML = "";

    data.forEach(template => {

        grid.innerHTML += `

        <div class="template-card">

            <img src="${template.thumbnail}">

            <div class="template-info">

                <h3>${template.name}</h3>

                <p>${template.description || ""}</p>

                <button
                    class="use-template"
                    onclick="selectTemplate('${template.id}')">

                    Gunakan Template

                </button>

            </div>

        </div>

        `;
    });
}

async function selectTemplate(templateId) {

    const invitationId =
        localStorage.getItem("invitation_id");

    const { error } =
        await supabaseClient
            .from("invitations")
            .update({
                template_id: templateId
            })
            .eq("id", invitationId);

    if (error) {
        alert(error.message);
        return;
    }

    alert("Template berhasil dipilih");
}

loadTemplates();