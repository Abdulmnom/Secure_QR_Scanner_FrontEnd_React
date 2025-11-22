# Signup Failed - Troubleshooting Guide

## Problem Summary
You're experiencing a "Signup failed" error when trying to create a new user account. This guide will help you diagnose and fix the issue.

## Root Cause Analysis
The issue is caused by a **500 Internal Server Error** in the backend Python server running on `localhost:5000`. The frontend is working correctly, but the backend has a bug or configuration issue.

## Step-by-Step Solution

### Step 1: Check Backend Server Status
The frontend now shows a backend connection status indicator. Look for:
- 🟢 **Backend Connected** (green) - Backend is running
- 🔴 **Backend Disconnected** (red) - Backend is down or has errors

### Step 2: Identify Backend Issues
Common causes of 500 Internal Server Error:

#### A. Database Issues
- Missing database connection
- Wrong database credentials
- Database not initialized
- Missing database tables

#### B. Environment Variables
Missing or incorrect environment variables:
```bash
# Common variables needed
DATABASE_URL=your_database_connection_string
SECRET_KEY=your_secret_key
SUPABASE_URL=your_supabase_url  # If using Supabase
SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### C. Dependencies Issues
Missing Python packages or version conflicts

### Step 3: Fix the Backend

#### Option A: Fix the Local Python Backend
If you're using the local Python server:

1. **Check the backend logs** for detailed error messages
2. **Verify database setup**:
   ```bash
   # Check if database exists
   python -c "import sqlite3; print('Database exists')"
   ```
3. **Install missing dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Check environment variables** are set correctly
5. **Restart the backend server**

#### Option B: Switch to Supabase (Recommended)
Based on your README, this project should use Supabase for authentication:

1. **Create a Supabase project** at https://supabase.com
2. **Set environment variables**:
   ```bash
   # In your .env.local file
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. **Update the config** to use Supabase instead of localhost
4. **Remove localhost API calls** from AuthContext

### Step 4: Update Frontend Configuration

#### Current Configuration (Broken)
```javascript
// src/config.js
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000', // ❌ Points to local Python server
};
```

#### Supabase Configuration (Recommended)
```javascript
// src/config.js
export const config = {
  apiUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};
```

### Step 5: Implement Supabase Auth (Alternative)
If you want to use Supabase for authentication, here's the updated AuthContext:

```javascript
// Replace the signup function in AuthContext.jsx
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const signup = async (fullName, email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    
    if (error) throw error
    
    setUser(data.user)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### Step 6: Test the Fix
1. **Restart the frontend**: `npm run dev`
2. **Try signing up again**
3. **Check the browser console** for any remaining errors
4. **Verify the backend status indicator** shows green

## Quick Fix Commands

### Check if backend is running:
```bash
curl http://localhost:5000
```

### Check backend logs:
```bash
# Look for error messages in your Python backend console
```

### Test signup via curl:
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Test User", "email": "test@example.com", "password": "password123"}'
```

## Installation of Supabase (If Choosing This Option)
```bash
npm install @supabase/supabase-js
```

## Summary
The signup failure is caused by backend server issues. Either:
1. **Fix the local Python backend** (check logs, database, dependencies)
2. **Switch to Supabase** (recommended based on your project documentation)

The frontend improvements I've made will help you identify and resolve these issues more easily.