// ============================================================
// AUTHENTICATION LOGIC
// ============================================================

const Auth = {
    async init() {
        // Check session on page load
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            // Update UI for logged in user
            this.updateUI(session.user);
        }
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.updateUI(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.redirectToLogin();
            }
        });
    },

    updateUI(user) {
        const authLinks = document.querySelectorAll('.auth-link');
        authLinks.forEach(link => {
            link.href = '/dashboard.html';
            link.textContent = 'Dashboard';
        });
    },

    redirectToLogin() {
        const publicPages = ['/', '/index.html', '/login.html', '/register.html', '/forgot-password.html'];
        if (!publicPages.includes(window.location.pathname)) {
            window.location.href = '/login.html';
        }
    },

    // Register
    async register(fullname, email, password, phone = '') {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { fullname, phone, role: 'client' },
                    emailRedirectTo: `${window.location.origin}/login.html`
                }
            });

            if (error) throw error;
            
            Utils.toast('Registrasi berhasil! Silakan cek email untuk verifikasi.', 'success');
            setTimeout(() => window.location.href = '/login.html', 2000);
            return data;
        } catch (error) {
            Utils.toast(error.message, 'error');
            throw error;
        }
    },

    // Login
    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            
            Utils.toast('Login berhasil!', 'success');
            setTimeout(() => window.location.href = '/dashboard.html', 500);
            return data;
        } catch (error) {
            Utils.toast(error.message, 'error');
            throw error;
        }
    },

    // Logout
    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            window.location.href = '/login.html';
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    },

    // Forgot Password
    async forgotPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });
            if (error) throw error;
            Utils.toast('Link reset password telah dikirim ke email Anda.', 'success');
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    },

    // Update Password
    async updatePassword(newPassword) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            Utils.toast('Password berhasil diperbarui!', 'success');
        } catch (error) {
            Utils.toast(error.message, 'error');
        }
    },

    // Get current user with profile
    async getCurrentUser() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
        return { ...session.user, profile };
    }
};

window.Auth = Auth;
