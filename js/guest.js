// ============================================================
// GUEST MANAGEMENT LOGIC
// ============================================================

const GuestManager = {
    currentInvitationId: null,
    guests: [],

    async init(invitationId) {
        this.currentInvitationId = invitationId;
        await this.loadGuests();
        this.initRealtime();
    },

    async loadGuests() {
        if (!this.currentInvitationId) return;
        
        try {
            const { data, error } = await supabase
                .from('guests')
                .select('*')
                .eq('invitation_id', this.currentInvitationId)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            this.guests = data || [];
            this.renderGuests();
        } catch (err) {
            console.error('Error loading guests:', err);
        }
    },

    renderGuests() {
        const container = document.getElementById('guestsTableBody');
        if (!container) return;
        
        if (!this.guests.length) {
            container.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada tamu</td></tr>';
            return;
        }
        
        container.innerHTML = this.guests.map(guest => `
            <tr>
                <td>${guest.guest_name}</td>
                <td>
                    <a href="/invite/${guest.guest_slug}" target="_blank" class="link-sm">${guest.guest_slug}</a>
                    <button onclick="Utils.copyToClipboard('${window.location.origin}/invite/${guest.guest_slug}')" class="btn-icon-sm">📋</button>
                </td>
                <td><img src="${guest.qr_code || Utils.generateQRCodeUrl(`${window.location.origin}/invite/${guest.guest_slug}`)}" width="40" alt="QR"></td>
                <td>${guest.is_vip ? '⭐ VIP' : '-'}</td>
                <td>
                    <button onclick="GuestManager.deleteGuest('${guest.id}')" class="btn btn-sm btn-danger">Hapus</button>
                </td>
            </tr>
        `).join('');
        
        document.getElementById('totalGuestsCount').textContent = this.guests.length;
    },

    async addGuest(name, isVip = false) {
        if (!this.currentInvitationId) return;
        
        try {
            const slug = Utils.generateSlug(name);
            const qrCode = Utils.generateQRCodeUrl(`${window.location.origin}/invite/${slug}`);
            
            const { data, error } = await supabase
                .from('guests')
                .insert({
                    invitation_id: this.currentInvitationId,
                    guest_name: name,
                    guest_slug: slug,
                    qr_code: qrCode,
                    is_vip: isVip
                })
                .select()
                .single();
                
            if (error) throw error;
            
            Utils.toast('Tamu berhasil ditambahkan!', 'success');
            this.loadGuests();
            return data;
        } catch (err) {
            Utils.toast(err.message, 'error');
            throw err;
        }
    },

    async deleteGuest(id) {
        if (!confirm('Yakin ingin menghapus tamu ini?')) return;
        
        try {
            const { error } = await supabase
                .from('guests')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            Utils.toast('Tamu dihapus', 'success');
            this.loadGuests();
        } catch (err) {
            Utils.toast(err.message, 'error');
        }
    },

    async importCSV(file) {
        try {
            const text = await file.text();
            const rows = Utils.parseCSV(text);
            
            const guests = rows.map(row => ({
                invitation_id: this.currentInvitationId,
                guest_name: row.nama || row.name || row.Guest || '',
                guest_slug: Utils.generateSlug(row.nama || row.name || row.Guest || ''),
                qr_code: Utils.generateQRCodeUrl(`${window.location.origin}/invite/${Utils.generateSlug(row.nama || '')}`),
                is_vip: (row.vip || row.VIP || '').toLowerCase() === 'true'
            })).filter(g => g.guest_name);
            
            const { error } = await supabase.from('guests').insert(guests);
            if (error) throw error;
            
            Utils.toast(`${guests.length} tamu berhasil diimport!`, 'success');
            this.loadGuests();
        } catch (err) {
            Utils.toast(err.message, 'error');
        }
    },

    exportCSV() {
        if (!this.guests.length) {
            Utils.toast('Tidak ada data untuk diekspor', 'error');
            return;
        }
        
        const data = this.guests.map(g => ({
            Nama: g.guest_name,
            Slug: g.guest_slug,
            VIP: g.is_vip ? 'Yes' : 'No',
            'Dibuat Pada': g.created_at
        }));
        
        Utils.exportCSV(data, `guests-${new Date().toISOString().split('T')[0]}.csv`);
    },

    initRealtime() {
        supabase.channel('guests-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'guests',
                filter: `invitation_id=eq.${this.currentInvitationId}`
            }, () => this.loadGuests())
            .subscribe();
    }
};

window.GuestManager = GuestManager;
