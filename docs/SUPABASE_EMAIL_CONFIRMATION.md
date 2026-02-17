# Fixing "Could not authenticate" After Email Confirmation

If users see "Could not authenticate" when clicking the email confirmation link, it's usually because:

1. **PKCE code verifier issue** – The confirmation link was opened in a different browser or device than where they signed up
2. **Default Supabase template** – Uses a flow that requires the same browser session

## Solution: Customize Supabase Email Template

Update your Supabase **Confirm signup** email template to link directly to your app with `token_hash` (no PKCE needed).

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select **Confirm signup**
3. Replace the confirmation link with:

```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/membership">Confirm your email</a>
```

`{{ .SiteURL }}` comes from **Supabase Dashboard** → **Authentication** → **URL Configuration** → **Site URL**. Set it to your app URL (e.g. `https://ghost-mammoths-pb.vercel.app`).

Example full template:

```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/membership">Confirm your email</a></p>
```

4. Ensure `https://your-app.vercel.app/auth/callback` is in **Redirect URLs** (Auth → URL Configuration)

After this change, the confirmation link will work even when opened in a different browser or device.
