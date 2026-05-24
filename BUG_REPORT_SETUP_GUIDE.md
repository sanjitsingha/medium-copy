# Bug Report Feature Setup Guide

## Overview

I've created a beautiful bug reporting system for Vichento with:

- **Landing page** (`/report-bug`) - Tells your story and explains the bug reporting process
- **Form page** (`/report-bug/submit`) - Detailed form for submitting bug reports
- **API endpoint** (`/api/bug-reports`) - Handles form submissions
- **SQL setup** - Database schema and configuration

## Setup Instructions

### 1. **Create the Supabase Table**

Go to your Supabase dashboard:

1. Navigate to the **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `BUG_REPORTS_SETUP.sql`
4. Click **Run**

This will create:

- `bug_reports` table with all necessary columns
- Indexes for performance (reporter_id, status, severity, created_at)
- Row Level Security (RLS) policies
- Auto-update timestamp trigger

### 2. **Update Supabase Client (if needed)**

The API route imports `supabase` from `@/lib/supabaseClient.js`. Make sure this file exists and is properly configured with your Supabase credentials.

### 3. **Test the Pages**

- **Landing Page**: `http://localhost:3000/report-bug`
  - Beautiful story about your journey
  - Features highlighting the importance of bug reports
  - Call-to-action button to submit bugs

- **Form Page**: `http://localhost:3000/report-bug/submit`
  - Comprehensive form with validation
  - Required fields: Title, Description, Steps, Expected/Actual Behavior
  - Optional fields: Page URL, Additional Info
  - Severity selector (Low, Medium, High, Critical)

## Features

### Bug Report Form Fields

- **Title** - Brief description of the bug
- **Description** - Detailed explanation
- **Steps to Reproduce** - How to trigger the bug
- **Expected Behavior** - What should happen
- **Actual Behavior** - What actually happens
- **Severity** - Bug severity level
- **Page URL** - Where the bug occurs
- **Additional Info** - Screenshots, browser info, etc.

### Database Fields

- `id` - UUID primary key
- `title` - Bug title
- `description` - Full description
- `steps_to_reproduce` - Reproduction steps
- `expected_behavior` - Expected outcome
- `actual_behavior` - Actual outcome
- `severity` - low, medium, high, critical
- `page_url` - URL where bug occurs
- `attachments` - Additional info
- `reporter_id` - User ID (if logged in)
- `reporter_email` - Reporter email
- `status` - open, in_progress, resolved, closed
- `created_at` - Submission timestamp
- `updated_at` - Last updated timestamp

### Row Level Security (RLS) Policies

1. **Insert Policy** - Anyone can submit bug reports
2. **Select Policy** - Anyone can view all reports
3. **Update Policy** - Only the reporter can update their own reports
4. **Delete Policy** - Only the reporter can delete their own reports

## API Endpoint

**POST** `/api/bug-reports`

### Request Body

```json
{
  "title": "Sign in button not working",
  "description": "When I click the sign in button...",
  "steps": "1. Click sign in\n2. Enter credentials\n3. Button does nothing",
  "expected_behavior": "Should redirect to dashboard",
  "actual_behavior": "Nothing happens",
  "severity": "high",
  "page_url": "https://vichento.com/signin",
  "attachments": "Firefox on Windows 10",
  "reporter_id": "user-uuid",
  "reporter_email": "user@example.com"
}
```

### Response (Success - 201)

```json
{
  "message": "Bug report submitted successfully",
  "data": { ...bug report object... }
}
```

### Response (Error)

```json
{
  "message": "Error description",
  "error": "Detailed error"
}
```

## Styling & Design

The pages maintain consistency with your Vichento design:

- ✅ Uses `font-creato` for typography
- ✅ Follows color scheme (black, gray, white)
- ✅ Responsive design (mobile-first)
- ✅ Smooth transitions and hover states
- ✅ Icons from Heroicons library
- ✅ Rounded corners and modern spacing

## User Experience Flow

1. User visits `/report-bug`
2. Reads your story about being a solo founder
3. Clicks "Report a Bug" button
4. Fills out detailed form on `/report-bug/submit`
5. Submits form
6. Sees success message
7. Gets confirmation that you'll review it

## Next Steps (Optional Enhancements)

1. **Email Notifications** - Send you an email when a new bug is reported
2. **Admin Dashboard** - Create a page to view, manage, and respond to bug reports
3. **Status Updates** - Notify users when their bug status changes
4. **Analytics** - Track bug submission trends
5. **Categories** - Add bug categories (UI, Performance, Auth, etc.)

## Troubleshooting

### "Bug report table not found" error

- Run the SQL setup script in Supabase SQL Editor
- Verify table creation in Supabase tables list

### Form not submitting

- Check browser console for errors
- Verify Supabase client configuration
- Ensure RLS policies allow insertions

### Missing user email

- The form works for both logged-in and anonymous users
- Logged-in users' emails are auto-populated from auth

---

That's it! Your bug reporting system is ready. Go squash those bugs! 🐛✨
