// ============================================================
// ADMIN DASHBOARD LOGIC
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    const session = await Utils.requireAdmin();
    if (!session) return;
    
    Utils.initDarkMode();
    loadAdminStats();
    loadRecentUsers();
    
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
});

async function loadAdminStats() {
    try {
        // Total users
        const { count: userCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact' });
            
        // Total invitations
        const { count: invitationCount } = await supabase
            .from('invitations')
            .select('*', { count: 'exact' });
            
        // Active packages
        const { count: packageCount } = await supabase
            .from('packages')
            .select('*', { count: 'exact' })
            .eq('is_active', true);
        
        document.getElementById('totalUsers').textContent = (userCount || 0).toLocaleString();
        document.getElementById('totalInvitations').textContent = (invitationCount || 0).toLocaleString();
        document.getElementById('activePackages').textContent = (packageCount || 0).toLocaleString();
        document.getElementById('totalRevenue').textContent = 'Rp 0'; // Implement based on your payment gateway
        
    } catch (err) {
        console.error('Error loading admin stats:', err);
    }
}

async function loadRecentUsers() {
    try {
        const { data: users, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (error) throw error;
        
        const tbody = document.getElementById('recentUsersTable');
        tbody.innerHTML = users?.map(u => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <img src="${u.avatar || 'https://i.pravatar.cc/150?u=' + u.id}" width="32" height="32" style="border-radius: 50%;">
                        <span>${u.fullname || '-'}</span>
                    </div>
                </td>
                <td>${u.email}</td>
                <td><span class="role-badge role-${u.role}">${u.role}</span></td>
                <td>${Utils.formatDate(u.created_at)}</td>
            </tr>
        `).join('') || '<tr><td colspan="4" class="text-center">Tidak ada data</td></tr>';
        
    } catch (err) {
        console.error('Error loading users:', err);
    }
}
