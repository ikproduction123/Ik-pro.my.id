-- ============================================================
-- SUPABASE DATABASE SCHEMA FOR DIGITAL INVITATION SaaS
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. PACKAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration INTEGER NOT NULL DEFAULT 30, -- in days
    max_guest INTEGER NOT NULL DEFAULT 50,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. TEMPLATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    thumbnail TEXT,
    category VARCHAR(50) DEFAULT 'general',
    html_template TEXT NOT NULL,
    css_template TEXT,
    js_template TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. INVITATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished')),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. INVITATION SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invitation_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    groom_name VARCHAR(100),
    bride_name VARCHAR(100),
    groom_parent TEXT,
    bride_parent TEXT,
    story TEXT,
    music_url TEXT,
    quote TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    event_date DATE,
    event_time TIME,
    location TEXT,
    maps_url TEXT,
    event_type VARCHAR(50) DEFAULT 'akad' CHECK (event_type IN ('akad', 'resepsi', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. GALLERIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.galleries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. GUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    guest_name VARCHAR(100) NOT NULL,
    guest_slug VARCHAR(100),
    qr_code TEXT,
    is_vip BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. RSVPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('hadir', 'tidak_hadir', 'mungkin', 'pending')),
    guest_count INTEGER DEFAULT 1,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. WISHES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. GIFTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    bank_name VARCHAR(100),
    account_name VARCHAR(100),
    account_number VARCHAR(50),
    qris_url TEXT,
    ewallet_type VARCHAR(50),
    ewallet_number VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON public.invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON public.invitations(slug);
CREATE INDEX IF NOT EXISTS idx_invitation_settings_invitation_id ON public.invitation_settings(invitation_id);
CREATE INDEX IF NOT EXISTS idx_events_invitation_id ON public.events(invitation_id);
CREATE INDEX IF NOT EXISTS idx_galleries_invitation_id ON public.galleries(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guests_invitation_id ON public.guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation_id ON public.rsvps(invitation_id);
CREATE INDEX IF NOT EXISTS idx_wishes_invitation_id ON public.wishes(invitation_id);
CREATE INDEX IF NOT EXISTS idx_gifts_invitation_id ON public.gifts(invitation_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- PACKAGES POLICIES (Public read, Admin write)
CREATE POLICY "Packages are viewable by everyone" 
    ON public.packages FOR SELECT USING (true);

-- SUBSCRIPTIONS POLICIES
CREATE POLICY "Users can view own subscriptions" 
    ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all subscriptions" 
    ON public.subscriptions FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- TEMPLATES POLICIES
CREATE POLICY "Templates are viewable by everyone" 
    ON public.templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage templates" 
    ON public.templates FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- INVITATIONS POLICIES
CREATE POLICY "Published invitations are viewable by everyone" 
    ON public.invitations FOR SELECT USING (status = 'published' OR auth.uid() = user_id);
CREATE POLICY "Users can manage own invitations" 
    ON public.invitations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all invitations" 
    ON public.invitations FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- INVITATION SETTINGS POLICIES
CREATE POLICY "Invitation settings viewable by invitation owner" 
    ON public.invitation_settings FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_settings.invitation_id AND (user_id = auth.uid() OR status = 'published'))
    );
CREATE POLICY "Users can manage own invitation settings" 
    ON public.invitation_settings FOR ALL USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_settings.invitation_id AND user_id = auth.uid())
    );

-- EVENTS POLICIES
CREATE POLICY "Events viewable by invitation owner or public" 
    ON public.events FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = events.invitation_id AND (user_id = auth.uid() OR status = 'published'))
    );
CREATE POLICY "Users can manage own events" 
    ON public.events FOR ALL USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = events.invitation_id AND user_id = auth.uid())
    );

-- GALLERIES POLICIES
CREATE POLICY "Galleries viewable by invitation owner or public" 
    ON public.galleries FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = galleries.invitation_id AND (user_id = auth.uid() OR status = 'published'))
    );
CREATE POLICY "Users can manage own galleries" 
    ON public.galleries FOR ALL USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = galleries.invitation_id AND user_id = auth.uid())
    );

-- GUESTS POLICIES
CREATE POLICY "Guests viewable by invitation owner" 
    ON public.guests FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = guests.invitation_id AND user_id = auth.uid())
    );
CREATE POLICY "Users can manage own guests" 
    ON public.guests FOR ALL USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = guests.invitation_id AND user_id = auth.uid())
    );

-- RSVPS POLICIES
CREATE POLICY "RSVPs viewable by invitation owner" 
    ON public.rsvps FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = rsvps.invitation_id AND (user_id = auth.uid() OR status = 'published'))
    );
CREATE POLICY "Anyone can create RSVP" 
    ON public.rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can manage own RSVPs" 
    ON public.rsvps FOR ALL USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = rsvps.invitation_id AND user_id = auth.uid())
    );

-- WISHES POLICIES
CREATE POLICY "Wishes viewable by invitation owner or public" 
    ON public.wishes FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = wishes.invitation_id AND (user_id = auth.uid() OR status = 'published'))
    );
CREATE POLICY "Anyone can create wishes" 
    ON public.wishes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can manage own wishes" 
    ON public.wishes FOR ALL USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = wishes.invitation_id AND user_id = auth.uid())
    );

-- GIFTS POLICIES
CREATE POLICY "Gifts viewable by invitation owner or public" 
    ON public.gifts FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = gifts.invitation_id AND (user_id = auth.uid() OR status = 'published'))
    );
CREATE POLICY "Users can manage own gifts" 
    ON public.gifts FOR ALL USING (
        EXISTS (SELECT 1 FROM public.invitations WHERE id = gifts.invitation_id AND user_id = auth.uid())
    );

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, fullname, email, role)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'fullname', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'client')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON public.invitations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invitation_settings_updated_at BEFORE UPDATE ON public.invitation_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Increment view count
CREATE OR REPLACE FUNCTION public.increment_invitation_view(invitation_slug TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.invitations 
    SET view_count = view_count + 1 
    WHERE slug = invitation_slug AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('avatars', 'avatars', true),
    ('gallery', 'gallery', true),
    ('music', 'music', true),
    ('templates', 'templates', true),
    ('qris', 'qris', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Avatar public access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Gallery public access" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Users can upload gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Music public access" ON storage.objects FOR SELECT USING (bucket_id = 'music');
CREATE POLICY "Templates public access" ON storage.objects FOR SELECT USING (bucket_id = 'templates');
CREATE POLICY "QRIS public access" ON storage.objects FOR SELECT USING (bucket_id = 'qris');

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default Packages
INSERT INTO public.packages (name, price, duration, max_guest, features) VALUES
    ('Basic', 50000, 30, 100, '["1 Template", "100 Tamu", "RSVP", "Ucapan", "Galeri 10 Foto"]'::jsonb),
    ('Premium', 100000, 60, 300, '["5 Template", "300 Tamu", "RSVP", "Ucapan", "Galeri 30 Foto", "Musik", "Gift Digital"]'::jsonb),
    ('Exclusive', 200000, 90, 1000, '["Semua Template", "Unlimited Tamu", "RSVP", "Ucapan", "Galeri Unlimited", "Musik", "Gift Digital", "QR Code", "Priority Support"]'::jsonb)
ON CONFLICT DO NOTHING;

-- Default Templates
INSERT INTO public.templates (name, thumbnail, category, html_template, css_template, js_template) VALUES
    ('Elegant Floral', 'https://images.unsplash.com/photo-1519225421980-715cb0202128?w=400', 'elegant', 
    '<div class="template-elegant">Elegant Template HTML</div>', 
    '.template-elegant { color: #7C3AED; }', 
    'console.log("Elegant template loaded");'),
    ('Modern Minimal', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400', 'modern',
    '<div class="template-modern">Modern Template HTML</div>',
    '.template-modern { color: #0F172A; }',
    'console.log("Modern template loaded");'),
    ('Rustic Charm', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400', 'rustic',
    '<div class="template-rustic">Rustic Template HTML</div>',
    '.template-rustic { color: #92400E; }',
    'console.log("Rustic template loaded");')
ON CONFLICT DO NOTHING;
