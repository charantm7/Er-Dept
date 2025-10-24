# Supabase RLS (Row Level Security) Fix Guide

## Problem

You're getting RLS errors when trying to insert data into Supabase tables, even though you've disabled RLS.

## Root Cause

You're using the **anonymous key** (`anon` role) which has limited permissions, even when RLS is disabled.

## Solutions

### Solution 1: Use Service Role Key (Recommended)

1. **Get your Service Role Key:**

   - Go to your Supabase Dashboard
   - Navigate to Settings > API
   - Copy the `service_role` key (NOT the `anon` key)

2. **Add Service Role Key to Environment:**
   Add this line to your `.env` file:

   ```
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **The code has been updated** to use `supabaseAdmin` client for database operations.

### Solution 2: Alternative - Disable RLS Completely

If you prefer to keep using the anon key, you can disable RLS:

1. **In Supabase Dashboard:**

   - Go to Authentication > Policies
   - Find your `patient_er_forms` table
   - Click "Disable RLS" if it's enabled

2. **Or create a permissive policy:**
   ```sql
   CREATE POLICY "Allow all operations" ON patient_er_forms
   FOR ALL USING (true);
   ```

### Solution 3: Create Proper RLS Policies

If you want to keep RLS enabled but allow operations:

```sql
-- Allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users" ON patient_er_forms
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow select for authenticated users
CREATE POLICY "Allow select for authenticated users" ON patient_er_forms
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow update for authenticated users
CREATE POLICY "Allow update for authenticated users" ON patient_er_forms
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow delete for authenticated users
CREATE POLICY "Allow delete for authenticated users" ON patient_er_forms
FOR DELETE USING (auth.role() = 'authenticated');
```

## Testing the Fix

1. **Add the service role key to your `.env` file**
2. **Restart your development server**
3. **Try saving a form** - it should work now

## Security Note

The service role key bypasses RLS completely. Only use it in:

- Internal applications
- Server-side code
- Admin operations

For client-side applications with user authentication, use proper RLS policies instead.

## Debugging Steps

If you still get errors:

1. **Check browser console** for detailed error messages
2. **Verify the service role key** is correct in `.env`
3. **Check Supabase logs** in the dashboard
4. **Test with a simple insert** to isolate the issue

## Files Modified

- `src/components/Config/supabase-admin.js` - New admin client
- `src/components/FormPage/PatientFormPage.jsx` - Updated to use admin client for DB operations
