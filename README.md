# CampusConnect

A unified platform for University of Washington students to discover events, join clubs, and connect with campus life.

## Features

- **Unified Event Feed**: Discover all campus events in one place
- **Club Management**: Create and manage student organizations
- **RSVP System**: RSVP to events with waitlist support
- **AI Recommendations**: Personalized event suggestions using Google Gemini
- **Calendar Integration**: Sync events with Google Calendar
- **Admin Moderation**: Content moderation and user management tools
- **UW Branding**: Consistent with University of Washington design guidelines

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI Integration**: Google Gemini for recommendations and content moderation
- **Deployment**: Vercel (frontend), Supabase (backend)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google AI Studio account (for Gemini integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations:
     ```bash
     npx supabase db push
     ```
   - Get your project URL and anon key from Supabase dashboard

4. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `GOOGLE_AI_API_KEY`: Your Google AI Studio API key

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── common/           # Shared components
│   ├── events/           # Event-specific components
│   └── clubs/            # Club-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
│   ├── supabase/         # Supabase client setup
│   ├── ai/               # AI integration
│   └── utils/            # General utilities
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## Database Schema

The application uses PostgreSQL with the following key entities:

- **Users & Profiles**: User authentication and profile data
- **Clubs**: Student organizations and campus departments
- **Events**: Individual events and activities
- **RSVPs**: User event attendance tracking
- **Categories & Interests**: Event and club classification
- **Venues**: Event locations and accessibility information
- **Notifications**: In-app notification system
- **Audit Logs**: System activity tracking

## Authentication

CampusConnect uses Supabase Auth with magic link authentication for UW email addresses (@uw.edu). Future versions will support UW Single Sign-On (SSO).

## AI Integration

The platform integrates with Google Gemini for:

- **Event Summarization**: Auto-generate event summaries
- **Content Moderation**: Flag inappropriate content
- **Recommendations**: Personalized event suggestions
- **Semantic Search**: Enhanced search capabilities

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Supabase)

1. Database migrations are managed through Supabase CLI
2. Edge Functions can be deployed using `supabase functions deploy`
3. Storage buckets are configured in Supabase dashboard

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## Roadmap

- [ ] UW SSO integration
- [ ] Mobile app (PWA)
- [ ] Advanced analytics dashboard
- [ ] Payment integration for paid events
- [ ] Real-time notifications
- [ ] Multi-language support

## Docker-based development (optional)

This repository includes a simple Docker setup to run the Next.js app and a local Postgres database for development.

Steps:

1. Copy environment template:

```bash
cp .env.example .env.local
```

2. Fill `.env.local` with your Supabase URL / anon key or local DB values.

3. Start Docker Compose:

```bash
docker compose up --build
```

4. Open the app at http://localhost:3000 (or the port shown by the container).

Notes:
- The `web` service mounts the repository so code changes are reflected in the container.
- The included `db` service is a plain Postgres instance; it is not a full Supabase instance. Use a remote Supabase project or run Supabase locally if you need the full suite.

