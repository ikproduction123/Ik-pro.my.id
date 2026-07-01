// ============================================================
// RSVP MANAGEMENT
// ============================================================

const RSVPManager = {
    async loadRSVPs(invitationId) {
        try {
            const { data, error } = await supabase
                .from('rsvps')
                .select('*, guests(guest_name)')
                .eq('invitation_id', invitationId)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Error loading RSVPs:', err);
            return [];
        }
    },

    async submitRSVP(invitationId, name, status, guestCount, message, guestId = null) {
        try {
            const { data, error } = await supabase
                .from('rsvps')
                .insert({
                    invitation_id: invitationId,
                    guest_id: guestId,
                    name: name,
                    status: status,
                    guest_count: parseInt(guestCount) || 1,
                    message: message
                })
                .select()
                .single();
                
            if (error) throw error;
            return data;
        } catch (err) {
            throw err;
        }
    },

    renderRSVPStats(containerId, rsvps) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const stats = {
            hadir: rsvps.filter(r => r.status === 'hadir').reduce((sum, r) => sum + (r.guest_count || 1), 0),
            tidak_hadir: rsvps.filter(r => r.status === 'tidak_hadir').length,
            mungkin: rsvps.filter(r => r.status === 'mungkin').reduce((sum, r) => sum + (r.guest_count || 1), 0)
        };
        
        container.innerHTML = `
            <div class="rsvp-stat-card">
                <span class="rsvp-stat-number" style="color: var(--success);">${stats.hadir}</span>
                <span class="rsvp-stat-label">Hadir</span>
            </div>
            <div class="rsvp-stat-card">
                <span class="rsvp-stat-number" style="color: var(--error);">${stats.tidak_hadir}</span>
                <span class="rsvp-stat-label">Tidak Hadir</span>
            </div>
            <div class="rsvp-stat-card">
                <span class="rsvp-stat-number" style="color: var(--accent);">${stats.mungkin}</span>
                <span class="rsvp-stat-label">Mungkin</span>
            </div>
        `;
    },

    initRealtime(invitationId, onUpdate) {
        supabase.channel(`rsvp-${invitationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'rsvps',
                filter: `invitation_id=eq.${invitationId}`
            }, (payload) => {
                onUpdate?.(payload.new);
            })
            .subscribe();
    }
};

window.RSVPManager = RSVPManager;
