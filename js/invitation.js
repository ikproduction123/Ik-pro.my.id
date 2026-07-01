// ============================================================
// INVITATION MANAGEMENT LOGIC
// ============================================================

let currentInvitationId = null;
let selectedTemplateId = null;
let uploadedGallery = [];
let uploadedMusic = null;

document.addEventListener('DOMContentLoaded', async () => {
    const session = await Utils.requireAuth();
    if (!session) return;
    
    Utils.initDarkMode();
    loadUserProfile();
    loadTemplates();
    
    // Check if editing existing invitation
    const urlParams = new URLSearchParams(window.location.search);
    const invitationId = urlParams.get('id');
    const action = urlParams.get('action');
    
    if (invitationId) {
        currentInvitationId = invitationId;
        document.getElementById('pageTitle').textContent = 'Edit Undangan';
        await loadInvitationData(invitationId);
    } else if (action === 'create') {
        // Add default event form
        addEventForm('Akad Nikah', 'akad');
        addGiftForm();
    }
    
    // Event listeners
    document.getElementById('galleryInput')?.addEventListener('change', handleGalleryUpload);
    document.getElementById('musicInput')?.addEventListener('change', handleMusicUpload);
    
    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
});

async function loadUserProfile() {
    const user = await Auth.getCurrentUser();
    if (user) {
        document.getElementById('userName').textContent = user.profile?.fullname || user.email;
    }
}

async function loadTemplates() {
    const grid = document.getElementById('templateSelectGrid');
    if (!grid) return;
    
    try {
        const { data: templates, error } = await supabase
            .from('templates')
            .select('*')
            .eq('is_active', true);
            
        if (error) throw error;
        
        grid.innerHTML = templates?.map(t => `
            <div class="template-select-card" data-id="${t.id}" onclick="selectTemplate('${t.id}')">
                <div class="selected-badge">✓</div>
                <img src="${t.thumbnail || 'https://via.placeholder.com/200x150'}" alt="${t.name}">
                <div class="template-name">${t.name}</div>
            </div>
        `).join('') || '<p>Template tidak tersedia</p>';
    } catch (err) {
        console.error('Error loading templates:', err);
    }
}

function selectTemplate(id) {
    selectedTemplateId = id;
    document.querySelectorAll('.template-select-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.id === id);
    });
}

function addEventForm(title = '', type = 'other') {
    const container = document.getElementById('eventsFormContainer');
    const index = container.children.length;
    
    const div = document.createElement('div');
    div.className = 'event-form';
    div.innerHTML = `
        <div class="event-form-header">
            <h4>Acara ${index + 1}</h4>
            <button type="button" class="remove-btn" onclick="this.closest('.event-form').remove()">Hapus</button>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Nama Acara</label>
                <input type="text" class="form-input event-title" value="${title}" placeholder="Akad Nikah / Resepsi" required>
            </div>
            <div class="form-group">
                <label class="form-label">Tipe Acara</label>
                <select class="form-input event-type">
                    <option value="akad" ${type === 'akad' ? 'selected' : ''}>Akad</option>
                    <option value="resepsi" ${type === 'resepsi' ? 'selected' : ''}>Resepsi</option>
                    <option value="other" ${type === 'other' ? 'selected' : ''}>Lainnya</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Tanggal</label>
                <input type="date" class="form-input event-date" required>
            </div>
            <div class="form-group">
                <label class="form-label">Waktu</label>
                <input type="time" class="form-input event-time" required>
            </div>
            <div class="form-group form-group-full">
                <label class="form-label">Lokasi</label>
                <input type="text" class="form-input event-location" placeholder="Nama venue / alamat lengkap" required>
            </div>
            <div class="form-group form-group-full">
                <label class="form-label">Link Google Maps</label>
                <input type="url" class="form-input event-maps" placeholder="https://maps.google.com/...">
            </div>
        </div>
    `;
    container.appendChild(div);
}

function addGiftForm() {
    const container = document.getElementById('giftsFormContainer');
    const div = document.createElement('div');
    div.className = 'gift-form';
    div.innerHTML = `
        <div class="event-form-header">
            <h4>Rekening / E-Wallet</h4>
            <button type="button" class="remove-btn" onclick="this.closest('.gift-form').remove()">Hapus</button>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Jenis</label>
                <select class="form-input gift-type">
                    <option value="bank">Bank Transfer</option>
                    <option value="ewallet">E-Wallet</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Nama Bank / E-Wallet</label>
                <input type="text" class="form-input gift-bank" placeholder="BCA / GoPay / DANA">
            </div>
            <div class="form-group">
                <label class="form-label">Nama Pemilik</label>
                <input type="text" class="form-input gift-name" placeholder="Nama lengkap">
            </div>
            <div class="form-group">
                <label class="form-label">Nomor Rekening / E-Wallet</label>
                <input type="text" class="form-input gift-number" placeholder="1234567890">
            </div>
        </div>
    `;
    container.appendChild(div);
}

async function handleGalleryUpload(e) {
    const files = Array.from(e.target.files);
    const grid = document.getElementById('galleryGrid');
    
    for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
            Utils.toast(`File ${file.name} terlalu besar (max 5MB)`, 'error');
            continue;
        }
        
        // Preview
        const reader = new FileReader();
        reader.onload = (event) => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.innerHTML = `
                <img src="${event.target.result}" alt="Gallery">
                <button class="gallery-item-remove" onclick="removeGalleryItem(this)">×</button>
            `;
            grid.appendChild(div);
        };
        reader.readAsDataURL(file);
        
        uploadedGallery.push(file);
    }
}

function removeGalleryItem(btn) {
    const item = btn.closest('.gallery-item');
    const index = Array.from(item.parentElement.children).indexOf(item);
    uploadedGallery.splice(index, 1);
    item.remove();
}

async function handleMusicUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        Utils.toast('File musik terlalu besar (max 5MB)', 'error');
        return;
    }
    
    uploadedMusic = file;
    document.getElementById('musicPreview').innerHTML = `
        <div class="activity-item" style="margin-top: 1rem;">
            <div class="activity-icon">🎵</div>
            <div class="activity-content">
                <p>${file.name}</p>
                <span class="activity-time">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
        </div>
    `;
}

async function loadInvitationData(id) {
    try {
        // Load invitation
        const { data: invitation } = await supabase
            .from('invitations')
            .select('*, templates(*)')
            .eq('id', id)
            .single();
            
        if (invitation?.template_id) {
            selectTemplate(invitation.template_id);
        }
        
        // Load settings
        const { data: settings } = await supabase
            .from('invitation_settings')
            .select('*')
            .eq('invitation_id', id)
            .single();
            
        if (settings) {
            document.getElementById('groomName').value = settings.groom_name || '';
            document.getElementById('brideName').value = settings.bride_name || '';
            document.getElementById('groomParent').value = settings.groom_parent || '';
            document.getElementById('brideParent').value = settings.bride_parent || '';
            document.getElementById('story').value = settings.story || '';
            document.getElementById('quote').value = settings.quote || '';
        }
        
        // Load events
        const { data: events } = await supabase
            .from('events')
            .select('*')
            .eq('invitation_id', id);
            
        document.getElementById('eventsFormContainer').innerHTML = '';
        events?.forEach(evt => addEventForm(evt.title, evt.event_type));
        
        // Load gallery
        const { data: galleries } = await supabase
            .from('galleries')
            .select('*')
            .eq('invitation_id', id);
            
        const grid = document.getElementById('galleryGrid');
        grid.innerHTML = galleries?.map(g => `
            <div class="gallery-item">
                <img src="${g.image_url}" alt="Gallery">
                <button class="gallery-item-remove" onclick="removeGalleryItem(this)">×</button>
            </div>
        `).join('') || '';
        
    } catch (err) {
        console.error('Error loading invitation:', err);
    }
}

async function saveInvitation() {
    const btn = document.getElementById('saveBtn');
    Utils.setLoading(btn, true);
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Sesi berakhir');
        
        // Validate
        if (!selectedTemplateId) {
            throw new Error('Pilih template terlebih dahulu');
        }
        
        const groomName = document.getElementById('groomName').value;
        const brideName = document.getElementById('brideName').value;
        if (!groomName || !brideName) {
            throw new Error('Nama mempelai harus diisi');
        }
        
        // Create or update invitation
        const invitationData = {
            user_id: session.user.id,
            template_id: selectedTemplateId,
            slug: currentInvitationId ? undefined : Utils.generateSlug(`${groomName}-${brideName}`),
            title: `${groomName} & ${brideName}`,
            status: 'draft'
        };
        
        let invitationId = currentInvitationId;
        
        if (currentInvitationId) {
            const { error } = await supabase
                .from('invitations')
                .update(invitationData)
                .eq('id', currentInvitationId);
            if (error) throw error;
        } else {
            const { data, error } = await supabase
                .from('invitations')
                .insert(invitationData)
                .select()
                .single();
            if (error) throw error;
            invitationId = data.id;
            currentInvitationId = data.id;
        }
        
        // Save settings
        const settingsData = {
            invitation_id: invitationId,
            groom_name: groomName,
            bride_name: brideName,
            groom_parent: document.getElementById('groomParent').value,
            bride_parent: document.getElementById('brideParent').value,
            story: document.getElementById('story').value,
            quote: document.getElementById('quote').value
        };
        
        const { error: settingsError } = await supabase
            .from('invitation_settings')
            .upsert(settingsData, { onConflict: 'invitation_id' });
        if (settingsError) throw settingsError;
        
        // Save events
        const eventForms = document.querySelectorAll('.event-form');
        const eventsData = [];
        eventForms.forEach(form => {
            eventsData.push({
                invitation_id: invitationId,
                title: form.querySelector('.event-title').value,
                event_type: form.querySelector('.event-type').value,
                event_date: form.querySelector('.event-date').value,
                event_time: form.querySelector('.event-time').value,
                location: form.querySelector('.event-location').value,
                maps_url: form.querySelector('.event-maps').value
            });
        });
        
        // Delete old events and insert new
        await supabase.from('events').delete().eq('invitation_id', invitationId);
        if (eventsData.length > 0) {
            const { error: eventsError } = await supabase.from('events').insert(eventsData);
            if (eventsError) throw eventsError;
        }
        
        // Upload gallery
        for (let i = 0; i < uploadedGallery.length; i++) {
            const file = uploadedGallery[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${invitationId}/${Date.now()}-${i}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(fileName, file);
                
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage
                .from('gallery')
                .getPublicUrl(fileName);
                
            await supabase.from('galleries').insert({
                invitation_id: invitationId,
                image_url: publicUrl,
                sort_order: i
            });
        }
        
        // Upload music
        if (uploadedMusic) {
            const fileExt = uploadedMusic.name.split('.').pop();
            const fileName = `${invitationId}/music.${fileExt}`;
            
            const { error: musicError } = await supabase.storage
                .from('music')
                .upload(fileName, uploadedMusic);
                
            if (!musicError) {
                const { data: { publicUrl } } = supabase.storage
                    .from('music')
                    .getPublicUrl(fileName);
                    
                await supabase.from('invitation_settings')
                    .update({ music_url: publicUrl })
                    .eq('invitation_id', invitationId);
            }
        }
        
        // Save gifts
        const giftForms = document.querySelectorAll('.gift-form');
        const giftsData = [];
        giftForms.forEach(form => {
            giftsData.push({
                invitation_id: invitationId,
                bank_name: form.querySelector('.gift-bank').value,
                account_name: form.querySelector('.gift-name').value,
                account_number: form.querySelector('.gift-number').value
            });
        });
        
        await supabase.from('gifts').delete().eq('invitation_id', invitationId);
        if (giftsData.length > 0) {
            await supabase.from('gifts').insert(giftsData);
        }
        
        Utils.toast('Undangan berhasil disimpan!', 'success');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);
        
    } catch (err) {
        Utils.toast(err.message, 'error');
        console.error(err);
    } finally {
        Utils.setLoading(btn, false);
    }
}

function previewInvitation() {
    if (!currentInvitationId) {
        Utils.toast('Simpan undangan terlebih dahulu', 'error');
        return;
    }
    window.open(`/invite/${currentInvitationId}`, '_blank');
}
