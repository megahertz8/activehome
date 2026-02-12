# Supabase Auth Setup Guide

## Environment Variables
Ensure your `.env.local` has:
- `NEXT_PUBLIC_SUPABASE_URL=https://exrnpqwdnwlzsumaubci.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>`
- `SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>` (for admin operations)

## Enable Auth Providers in Supabase Dashboard

### Email Auth (Magic Link)
- Go to Supabase Dashboard > Authentication > Settings
- Ensure "Enable email confirmations" is checked (for magic links)
- Site URL: `https://your-domain.com` (or localhost for dev)
- Redirect URLs: `https://your-domain.com/auth/callback`

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Application type: Web application
6. Authorized redirect URIs: `https://exrnpqwdnwlzsumaubci.supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret

8. In Supabase Dashboard > Authentication > Providers > Google
   - Enable Google provider
   - Paste Client ID and Client Secret
   - Redirect URL is already set

### Apple Sign-In
1. Go to [Apple Developer](https://developer.apple.com/)
2. Create an App ID (if not exists)
3. Create a Services ID for Sign in with Apple
4. Configure Sign in with Apple:
   - Primary App ID: your app ID
   - Return URLs: `https://exrnpqwdnwlzsumaubci.supabase.co/auth/v1/callback`
5. Download private key (if needed, but Supabase handles most)

6. In Supabase Dashboard > Authentication > Providers > Apple
   - Enable Apple provider
   - Paste Services ID, Team ID, etc. (from Apple)
   - Upload private key if required

## Run Database Migration
- Go to Supabase Dashboard > SQL Editor
- Paste and run the contents of `supabase-auth-migration.sql`

## Update App Layout
In `src/app/layout.tsx`, wrap the children with `<AuthProvider>`:

```tsx
import { AuthProvider } from '@/components/auth/AuthProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Testing
1. Start the dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/login`
3. Test Magic Link: Enter email, check inbox for link, click to login
4. Test Google/Apple: Once configured, buttons should redirect to OAuth
5. Check UserMenu in navbar (add `<UserMenu />` to your navbar component)
6. Use `<ProtectedRoute>` around protected pages

## Notes
- Magic Link works immediately after enabling email auth
- Google/Apple require the above setup
- Profiles table auto-creates on user signup via trigger