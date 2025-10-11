# Authentication Architecture

This project uses a hybrid approach to state management that preserves Next.js benefits while providing client-side interactivity where needed.

## Architecture Overview

### 1. Server Components (Default)

- **Main pages** (like `Membership/page.tsx`) remain server components
- **SEO-friendly** content is rendered on the server
- **Fast initial load** with server-side rendering
- **Static content** like membership benefits, pricing, etc.

### 2. Client Components (When Needed)

- **Interactive components** use `"use client"` directive
- **State management** for forms, user interactions
- **Real-time updates** for authentication status

### 3. Context Provider Pattern

- **Global state** managed through React Context
- **Authentication state** shared across components
- **Minimal client-side JavaScript** - only where needed

## File Structure

```
src/app/
├── utils/
│   ├── context/
│   │   └── AuthContext.tsx          # Global auth state provider
│   └── supabase.ts                   # Supabase client & helpers
├── Membership/
│   ├── page.tsx                      # Server component (main page)
│   ├── components/
│   │   ├── AuthButtons.tsx          # Client component (sign in/up)
│   │   └── UserProfile.tsx          # Client component (user info)
│   └── membership.module.css
└── layout.tsx                        # Wraps app with AuthProvider
```

## Key Benefits

### ✅ Preserves Next.js Advantages

- **Server-side rendering** for static content
- **SEO optimization** for membership benefits
- **Fast initial page load**
- **Reduced client-side JavaScript**

### ✅ Provides Client-side Interactivity

- **Real-time authentication** state updates
- **Form handling** for sign in/up
- **User profile** management
- **Responsive UI** updates

### ✅ Scalable Architecture

- **Modular components** that can be reused
- **Clear separation** of concerns
- **Easy to extend** with new features
- **Type-safe** with TypeScript

## Usage Examples

### Using Auth State in Components

```tsx
"use client";
import { useAuth } from '../utils/context/AuthContext';

export function MyComponent() {
  const { user, isLoading, signIn, signOut } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return user ? (
    <div>Welcome, {user.email}!</div>
  ) : (
    <button onClick={() => signIn('email', 'password')}>
      Sign In
    </button>
  );
}
```

### Server Component with Client Components

```tsx
// Server component (no "use client")
import { AuthButtons } from './components/AuthButtons';
import { UserProfile } from './components/UserProfile';

export default function Membership() {
  return (
    <div>
      {/* Server-rendered content */}
      <h1>Membership Benefits</h1>
      <p>Join our community...</p>
      
      {/* Client components for interactivity */}
      <AuthButtons />
      <UserProfile />
    </div>
  );
}
```

## Setup Requirements

1. **Environment Variables**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Dependencies**

   ```bash
   npm install @supabase/supabase-js
   ```

3. **Provider Setup**
   - AuthProvider wraps the entire app in `layout.tsx`
   - Available throughout the component tree

## Best Practices

1. **Keep pages as server components** when possible
2. **Use client components** only for interactive features
3. **Leverage the AuthContext** for global state
4. **Handle loading states** appropriately
5. **Provide fallbacks** for error states

## Future Enhancements

- **Persistent sessions** with refresh tokens
- **Role-based access** control
- **Profile management** features
- **Membership tier** management
- **Payment integration** with Stripe
