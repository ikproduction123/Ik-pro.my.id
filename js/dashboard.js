// ============================================================
// DASHBOARD LOGIC
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    const session = await Utils.requireAuth();
    if (!session) return;
    
    // Init
    Utils.initDarkMode();
    loadUserProfile();
    loadDashboardStats();
    loadInvitations();
    initRealtime();
    
    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
});

async function loadUserProfile() {
    try {
        const user = await Auth.getCurrentUser();
        if (!user) return;
        
        document.getElementById('userName').textContent = user.profile?.fullname || user.email;
        document.getElementById('welcomeName').textContent = user.profile?.fullname?.split(' ')[0] || 'User';
        
        if (user.profile?.avatar) {
            document.getElementById('userAvatar').src = user.profile.avatar;
        }
    } catch (err) {
        console.error('Error loading profile:', err);
    }
}

async function loadDashboardStats() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        // Get invitations
        const { data: invitations } = await supabase
            .from('invitations')
            .select('id, view_count')
            .eq('user_id', session.user.id);
            
        const invitationIds = invitations?.map(i => i.id) || [];
        const totalViews = invitations?.reduce((sum, i) => sum + (i.view_count || 0), 0) || 0;
        
        // Get guests
        const { count: guestCount } = await supabase
            .from('guests')
            .select('*', { count: 'exact' })
            .in('invitation_id', invitationIds);
            
        // Get RSVPs
        const { count: rsvpCount } = await supabase
            .from('rsvps')
            .select('*', { count: 'exact' })
            .in('invitation_id', invitationIds)
            .eq('status', 'hadir');
            
        // Get wishes
        const { count: wishCount } = await supabase
            .from('wishes')
            .select('*', { count: 'exact' })
            .in('invitation_id', invitationIds);
        
        // Update UI
        document.getElementById('totalViews').textContent = totalViews.toLocaleString();
        document.getElementById('totalGuests').textContent = (guestCount || 0).toLocaleString();
        document.getElementById('totalAttending').textContent = (rsvpCount || 0).toLocaleString();
        document.getElementById('totalWishes').textContent = (wishCount || 0).toLocaleString();
        
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

async function loadInvitations() {
    const list = document.getElementById('invitationsList');
    if (!list) return;
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data: invitations, error } = await supabase
            .from('invitations')
            .select(`
                *,
                templates(name, thumbnail),
                invitation_settings(groom_name, bride_name)
            `)
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        if (!invitations?.length) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3>Belum ada undangan</h3>
                    <p>Mulai buat undangan digital pernikahan Anda sekarang</p>
                    <a href="/invitation.html?action=create" class="btn btn-primary">Buat Undangan</a>
                </div>
            `;
            return;
        }
        
        list.innerHTML = invitations.map(inv => {
            const couple = inv.invitation_settings?.[0];
            const coupleName = couple ? `${couple.groom_name || ''} & ${couple.bride_name || ''}` : inv.title || 'Undangan Baru';
            const statusClass = inv.status === 'published' ? 'status-published' : 'status-draft';
            const statusText = inv.status === 'published' ? 'Published' : 'Draft';
            
            return `
                <div class="invitation-card">
                    <img src="${inv.templates?.thumbnail || 'https://via.placeholder.com/80'}" alt="${inv.templates?.name || ''}" class="invitation-thumb">
                    <div class="invitation-info">
                        <h4>${coupleName}</h4>
                        <div class="invitation-meta">
                            <span>${inv.templates?.name || 'Default'}</span>
                            <span>•</span>
                            <span>${Utils.formatDate(inv.created_at)}</span>
                            <span>•</span>
                            <span>${inv.view_count || 0} views</span>
                        </div>
                    </div>
                    <span class="invitation-status ${statusClass}">
                        <span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span>
                        ${statusText}
                    </span>
                    <div class="invitation-actions">
                        <a href="/invitation.html?id=${inv.id}" class="btn btn-outline btn-sm">Edit</a>
                        ${inv.status === 'published' ? `
                            <a href="/invite/${inv.slug}" target="_blank" class="btn btn-primary btn-sm">Lihat</a>
                        ` : `
                            <button onclick="publishInvitation('${inv.id}')" class="btn btn-primary btn-sm">Publish</button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (err) {
        console.error('Error loading invitations:', err);
        list.innerHTML = '<div class="loading-state">Gagal memuat undangan</div>';
    }
}

async function publishInvitation(id) {
    try {
        const { error } = await supabase
            .from('invitations')
            .update({ status: 'published' })
            .eq('id', id);
            
        if (error) throw error;
        
        Utils.toast('Undangan berhasil dipublish!', 'success');
        loadInvitations();
    } catch (err) {
        Utils.toast(err.message, 'error');
    }
}

function initRealtime() {
    // Subscribe to changes
    supabase.channel('dashboard-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, () => {
            loadDashboardStats();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes' }, () => {
            loadDashboardStats();
        })
        .subscribe();
}
