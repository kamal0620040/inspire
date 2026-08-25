<p align="center">
  <img src="public/inspire-icon.svg" alt="Inspire logo" width="64" height="64">
</p>

<h1 align="center">Inspire — Inspiration Canvas</h1>

Collect images and videos on an infinite canvas.

Built for personal use. Fast loading, minimal interface, no onboarding, no tracking.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui v4 (base-nova, based on @base-ui/react) |
| Animation | Framer Motion |
| State (client) | Zustand |
| Server State | TanStack React Query |
| Virtualization | TanStack React Virtual |
| Auth & Database | Supabase (SSR, Auth, Postgres, Storage) |
| Icons | Lucide React |
| Upload | react-dropzone |
| Notifications | sonner |
| Theme | next-themes |

---

## Features

**Two View Modes**
- **Canvas** — Infinite canvas with pan (middle-click / Shift+drag), zoom (scroll), drag-to-reposition, multi-select (box selection), **viewport culling** (only renders assets visible on screen), and keyboard shortcuts (Delete, Ctrl+D duplicate, R rotate, +/- scale, 0 reset)
- **Board** — Responsive grid with **TanStack React Virtual** for windowed rendering, hover-to-play videos, and multi-select checkboxes

**Upload**
- Drag-and-drop files onto canvas or board view
- Client-side thumbnail generation for images and videos
- Upload progress tracking with abort support
- Automatic dimension detection

**Folder Management**
- Create folders via inline card or modal dialog
- Rename and delete via context menu
- Search across folders with debounced input

**Authentication**
- Email magic link (passwordless)
- Google OAuth
- Session managed via Supabase SSR cookies with middleware refresh

**Media Preview**
- Full-screen lightbox with keyboard navigation
- Video playback controls (play/pause/mute/fullscreen)

**Additional**
- Dark / light theme with system-aware default
- 3D folder cards with fan-out preview animation

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page with draggable sample assets |
| `/login` | Login (email magic link + Google OAuth) |
| `/dashboard` | Folder listing with search |
| `/folder/[id]` | Folder detail — canvas or board view |
| `/auth/callback` | Supabase OAuth code exchange |
| `/error` | Generic error page |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- A Supabase project

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the following SQL in the SQL Editor to create the required tables:

```sql
-- Profiles table (auto-created on auth signup)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Folders table
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled',
  view TEXT NOT NULL DEFAULT 'canvas' CHECK (view IN ('canvas', 'board')),
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  file_size BIGINT,
  file_name TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  -- Canvas layout properties
  x FLOAT NOT NULL DEFAULT 0,
  y FLOAT NOT NULL DEFAULT 0,
  rotation FLOAT NOT NULL DEFAULT 0,
  scale FLOAT NOT NULL DEFAULT 1,
  z_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own folders" ON public.folders FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own assets" ON public.assets FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX idx_folders_user_id ON public.folders(user_id);
CREATE INDEX idx_assets_folder_id ON public.assets(folder_id);
CREATE INDEX idx_assets_user_id ON public.assets(user_id);
```

3. Enable the desired auth providers in **Authentication → Providers** (Email, Google)
4. Copy your project URL and anon/publishable key from **Project Settings → API**

### Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production deployment, set `NEXT_PUBLIC_SITE_URL` to your production domain and update the **Site URL** and **Redirect URLs** in the Supabase dashboard under **Authentication → URL Configuration**.

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run lint` | Run ESLint |

---
