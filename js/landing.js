// ============================================================
// LANDING PAGE LOGIC
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize
    Auth.init();
    Utils.initDarkMode();
    Utils.lazyLoadImages();
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
    
    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    navToggle?.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
    
    // Animate numbers
    const animateNumbers = () => {
        document.querySelectorAll('.stat-number').forEach(el => {
            const target = parseInt(el.dataset.count);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const update = () => {
                current += increment;
                if (current < target) {
                    el.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(update);
                } else {
                    el.textContent = target.toLocaleString() + (el.dataset.count === '98' ? '%' : '+');
                }
            };
            update();
        });
    };
    
    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                if (entry.target.querySelector('.stat-number')) animateNumbers();
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.feature-card, .step, .testimonial-card').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
    
    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isOpen = item.classList.contains('open');
            
            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            
            // Toggle current
            if (!isOpen) item.classList.add('open');
        });
    });
    
    // Load templates
    loadTemplates();
    
    // Load pricing
    loadPricing();
    
    // Template filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadTemplates(btn.dataset.filter);
        });
    });
});

async function loadTemplates(filter = 'all') {
    const grid = document.getElementById('templatesGrid');
    if (!grid) return;
    
    try {
        let query = supabase.from('templates').select('*').eq('is_active', true);
        if (filter !== 'all') query = query.eq('category', filter);
        
        const { data: templates, error } = await query;
        if (error) throw error;
        
        grid.innerHTML = templates?.map(t => `
            <div class="template-card" data-category="${t.category}">
                <div class="template-image">
                    <img src="${t.thumbnail || 'https://via.placeholder.com/400x300'}" alt="${t.name}" loading="lazy">
                    <div class="template-overlay">
                        <a href="/register.html" class="btn btn-white">Gunakan Template</a>
                    </div>
                </div>
                <div class="template-info">
                    <h4>${t.name}</h4>
                    <span class="template-category">${t.category}</span>
                </div>
            </div>
        `).join('') || '<p>Template belum tersedia.</p>';
        
        Utils.lazyLoadImages();
    } catch (err) {
        console.error('Error loading templates:', err);
        grid.innerHTML = '<p>Gagal memuat template.</p>';
    }
}

async function loadPricing() {
    const grid = document.getElementById('pricingGrid');
    if (!grid) return;
    
    try {
        const { data: packages, error } = await supabase
            .from('packages')
            .select('*')
            .eq('is_active', true)
            .order('price', { ascending: true });
            
        if (error) throw error;
        
        grid.innerHTML = packages?.map((pkg, index) => `
            <div class="pricing-card ${index === 1 ? 'pricing-popular' : ''}">
                ${index === 1 ? '<div class="popular-badge">Paling Populer</div>' : ''}
                <h3>${pkg.name}</h3>
                <div class="pricing-price">
                    <span class="currency">Rp</span>
                    <span class="amount">${Utils.formatCurrency(pkg.price).replace('Rp', '').trim()}</span>
                </div>
                <span class="pricing-duration">${pkg.duration} hari aktif</span>
                <ul class="pricing-features">
                    ${(pkg.features || []).map(f => `<li><span class="check">✓</span> ${f}</li>`).join('')}
                </ul>
                <a href="/register.html" class="btn ${index === 1 ? 'btn-primary' : 'btn-outline'} btn-block">
                    Pilih Paket
                </a>
            </div>
        `).join('') || '';
    } catch (err) {
        console.error('Error loading pricing:', err);
    }
}
