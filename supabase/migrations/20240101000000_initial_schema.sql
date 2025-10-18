-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'club_admin', 'campus_admin', 'super_admin');
CREATE TYPE event_status AS ENUM ('draft', 'pending_approval', 'approved', 'cancelled', 'completed', 'archived');
CREATE TYPE event_visibility AS ENUM ('public', 'campus_only', 'private_link');
CREATE TYPE club_status AS ENUM ('pending', 'approved', 'suspended', 'archived');
CREATE TYPE club_visibility AS ENUM ('public', 'campus_only');
CREATE TYPE rsvp_status AS ENUM ('going', 'interested', 'waitlisted', 'cancelled');
CREATE TYPE club_member_role AS ENUM ('owner', 'officer', 'member');
CREATE TYPE notification_type AS ENUM ('event_update', 'waitlist_promotion', 'rsvp_reminder', 'club_post', 'report_status', 'admin_message');
CREATE TYPE entity_type AS ENUM ('event', 'club', 'profile', 'comment');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'action_taken', 'dismissed');
CREATE TYPE recurrence_frequency AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'annually');
CREATE TYPE attachment_type AS ENUM ('file', 'link');
CREATE TYPE event_source_type AS ENUM ('ics', 'rss', 'api');

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'student',
    consent_personalization BOOLEAN DEFAULT TRUE,
    consent_share_major BOOLEAN DEFAULT FALSE,
    major TEXT,
    class_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create interests table
CREATE TABLE interests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create venues table
CREATE TABLE venues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    room_number TEXT,
    address TEXT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    map_url TEXT,
    accessibility_features JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clubs table
CREATE TABLE clubs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    contact_email TEXT,
    website_url TEXT,
    instagram_url TEXT,
    discord_url TEXT,
    profile_image_url TEXT,
    cover_image_url TEXT,
    visibility club_visibility NOT NULL DEFAULT 'public',
    status club_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create club_members table
CREATE TABLE club_members (
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role club_member_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (club_id, user_id)
);

-- Create recurrence_rules table
CREATE TABLE recurrence_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    frequency recurrence_frequency NOT NULL,
    interval INTEGER DEFAULT 1,
    days_of_week INTEGER[],
    day_of_month INTEGER,
    month_of_year INTEGER,
    end_date DATE,
    timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    virtual_url TEXT,
    capacity INTEGER,
    is_waitlist_enabled BOOLEAN DEFAULT FALSE,
    rsvp_buffer INTEGER DEFAULT 0,
    rsvp_close_time TIMESTAMPTZ,
    visibility event_visibility NOT NULL DEFAULT 'public',
    status event_status NOT NULL DEFAULT 'draft',
    image_url TEXT,
    ical_uid TEXT,
    recurrence_rule_id UUID REFERENCES recurrence_rules(id) ON DELETE SET NULL,
    parent_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    version INTEGER DEFAULT 1,
    source_id UUID
);

-- Create event_categories table
CREATE TABLE event_categories (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, category_id)
);

-- Create event_interests table
CREATE TABLE event_interests (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    interest_id UUID REFERENCES interests(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'organizer_set',
    PRIMARY KEY (event_id, interest_id)
);

-- Create club_interests table
CREATE TABLE club_interests (
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    interest_id UUID REFERENCES interests(id) ON DELETE CASCADE,
    PRIMARY KEY (club_id, interest_id)
);

-- Create user_interests table
CREATE TABLE user_interests (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    interest_id UUID REFERENCES interests(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, interest_id)
);

-- Create rsvps table
CREATE TABLE rsvps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    status rsvp_status NOT NULL DEFAULT 'going',
    rsvp_time TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    waitlist_position INTEGER,
    promotion_expires_at TIMESTAMPTZ,
    UNIQUE (user_id, event_id)
);

-- Create checkins table
CREATE TABLE checkins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rsvp_id UUID REFERENCES rsvps(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    checked_in_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    UNIQUE (rsvp_id)
);

-- Create follows table
CREATE TABLE follows (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, club_id)
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    entity_type entity_type,
    entity_id UUID,
    read_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reports table
CREATE TABLE reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    entity_type entity_type NOT NULL,
    entity_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status report_status NOT NULL DEFAULT 'pending',
    moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    moderator_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attachments table
CREATE TABLE attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    type attachment_type NOT NULL,
    url TEXT NOT NULL,
    file_name TEXT,
    mime_type TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event_sources table
CREATE TABLE event_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type event_source_type NOT NULL,
    url TEXT NOT NULL,
    last_synced_at TIMESTAMPTZ,
    deduplication_hash_algo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_club_id ON events(club_id);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_rsvps_user_id ON rsvps(user_id);
CREATE INDEX idx_rsvps_event_id ON rsvps(event_id);
CREATE INDEX idx_rsvps_status ON rsvps(status);
CREATE INDEX idx_clubs_status ON clubs(status);
CREATE INDEX idx_clubs_visibility ON clubs(visibility);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_entity ON reports(entity_type, entity_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'), 'student');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
    ('Academic', 'academic'),
    ('Cultural', 'cultural'),
    ('Social', 'social'),
    ('Career', 'career'),
    ('Sports', 'sports'),
    ('Volunteer', 'volunteer'),
    ('Technology', 'technology'),
    ('Arts', 'arts'),
    ('Music', 'music'),
    ('Food', 'food');

-- Insert default interests
INSERT INTO interests (name, slug) VALUES
    ('Artificial Intelligence', 'artificial-intelligence'),
    ('Web Development', 'web-development'),
    ('Data Science', 'data-science'),
    ('Design', 'design'),
    ('Entrepreneurship', 'entrepreneurship'),
    ('Networking', 'networking'),
    ('Machine Learning', 'machine-learning'),
    ('Mobile Development', 'mobile-development'),
    ('Cybersecurity', 'cybersecurity'),
    ('Blockchain', 'blockchain'),
    ('Game Development', 'game-development'),
    ('UI/UX Design', 'ui-ux-design'),
    ('Photography', 'photography'),
    ('Music Production', 'music-production'),
    ('Film Making', 'film-making'),
    ('Writing', 'writing'),
    ('Public Speaking', 'public-speaking'),
    ('Leadership', 'leadership'),
    ('Community Service', 'community-service'),
    ('Environmental', 'environmental');

-- Insert default venues
INSERT INTO venues (name, room_number, address, latitude, longitude) VALUES
    ('HUB', 'Room 211', '4001 E Stevens Way NE, Seattle, WA 98195', 47.6553, -122.3035),
    ('Kane Hall', 'Room 130', '4069 Spokane Ln, Seattle, WA 98105', 47.6567, -122.3108),
    ('Mary Gates Hall', 'Room 241', '1410 NE Campus Pkwy, Seattle, WA 98195', 47.6558, -122.3047),
    ('Savery Hall', 'Room 260', '1400 NE Campus Pkwy, Seattle, WA 98195', 47.6558, -122.3047),
    ('Smith Hall', 'Room 120', '1400 NE Campus Pkwy, Seattle, WA 98195', 47.6558, -122.3047),
    ('Drumheller Fountain', NULL, '1400 NE Campus Pkwy, Seattle, WA 98195', 47.6558, -122.3047),
    ('Red Square', NULL, '1400 NE Campus Pkwy, Seattle, WA 98195', 47.6558, -122.3047),
    ('Suzzallo Library', 'Room 220', '4000 15th Ave NE, Seattle, WA 98105', 47.6567, -122.3108);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can view all profiles, but only update their own
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Clubs: Public read access, authenticated users can create, club admins can update
CREATE POLICY "Anyone can view approved clubs" ON clubs FOR SELECT USING (status = 'approved');
CREATE POLICY "Authenticated users can create clubs" ON clubs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Club admins can update their clubs" ON clubs FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM club_members 
        WHERE club_id = clubs.id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'officer')
    )
);

-- Events: Public read access for approved events, authenticated users can create, organizers can update
CREATE POLICY "Anyone can view approved events" ON events FOR SELECT USING (status = 'approved');
CREATE POLICY "Authenticated users can create events" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Event creators can update their events" ON events FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM club_members 
        WHERE club_id = events.club_id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'officer')
    )
);

-- RSVPs: Users can view and manage their own RSVPs
CREATE POLICY "Users can view own RSVPs" ON rsvps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own RSVPs" ON rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own RSVPs" ON rsvps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own RSVPs" ON rsvps FOR DELETE USING (auth.uid() = user_id);

-- Club members: Members can view membership, club admins can manage
CREATE POLICY "Anyone can view club memberships" ON club_members FOR SELECT USING (true);
CREATE POLICY "Club admins can manage memberships" ON club_members FOR ALL USING (
    EXISTS (
        SELECT 1 FROM club_members cm 
        WHERE cm.club_id = club_members.club_id 
        AND cm.user_id = auth.uid() 
        AND cm.role IN ('owner', 'officer')
    )
);

-- Follows: Users can view and manage their own follows
CREATE POLICY "Users can view own follows" ON follows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own follows" ON follows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own follows" ON follows FOR DELETE USING (auth.uid() = user_id);

-- Notifications: Users can view and update their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Audit logs: Read-only for authenticated users
CREATE POLICY "Authenticated users can view audit logs" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');

-- Reports: Users can create reports, admins can view and manage
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Admins can view all reports" ON reports FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('campus_admin', 'super_admin')
    )
);

-- Attachments: Public read access for approved events
CREATE POLICY "Anyone can view attachments for approved events" ON attachments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM events 
        WHERE id = attachments.event_id 
        AND status = 'approved'
    )
);
CREATE POLICY "Event creators can manage attachments" ON attachments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM events 
        WHERE id = attachments.event_id 
        AND created_by = auth.uid()
    )
);
