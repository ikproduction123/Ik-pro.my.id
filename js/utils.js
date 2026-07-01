// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const Utils = {
    // Toast Notification
    toast(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => toast.classList.add('show'));
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Loading State
    setLoading(element, isLoading) {
        if (isLoading) {
            element.classList.add('loading');
            element.disabled = true;
            element.dataset.originalText = element.textContent;
            element.innerHTML = '<span class="spinner"></span> Loading...';
        } else {
            element.classList.remove('loading');
            element.disabled = false;
            element.textContent = element.dataset.originalText || element.textContent;
        }
    },

    // Format Date
    formatDate(dateString) {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    },

    // Format Currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    // Generate Slug
    generateSlug(text) {
        return text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50) + '-' + Date.now().toString(36);
    },

    // Copy to Clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.toast('Berhasil disalin!', 'success');
        } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.toast('Berhasil disalin!', 'success');
        }
    },

    // Generate QR Code URL
    generateQRCodeUrl(text) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    },

    // Debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Check Auth
    async requireAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = '/login.html';
            return null;
        }
        return session;
    },

    // Check Admin
    async requireAdmin() {
        const session = await this.requireAuth();
        if (!session) return null;
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
        if (profile?.role !== 'admin') {
            window.location.href = '/dashboard.html';
            return null;
        }
        return session;
    },

    // Dark Mode
    initDarkMode() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) document.documentElement.classList.add('dark');
        
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
            });
        }
    },

    // Lazy Load Images
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    },

    // Export CSV
    exportCSV(data, filename) {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    },

    convertToCSV(data) {
        if (!data.length) return '';
        const headers = Object.keys(data[0]);
        const rows = data.map(row => 
            headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(',')
        );
        return [headers.join(','), ...rows].join('\n');
    },

    // Parse CSV
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const obj = {};
            headers.forEach((h, i) => obj[h] = values[i]);
            return obj;
        });
    }
};

window.Utils = Utils;
