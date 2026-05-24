-- Create bug_reports table in Supabase

CREATE TABLE bug_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT NOT NULL,
  expected_behavior TEXT NOT NULL,
  actual_behavior TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  page_url TEXT,
  attachments TEXT,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_email TEXT,
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on reporter_id for faster queries
CREATE INDEX idx_bug_reports_reporter_id ON bug_reports(reporter_id);

-- Create index on status for filtering
CREATE INDEX idx_bug_reports_status ON bug_reports(status);

-- Create index on severity for sorting
CREATE INDEX idx_bug_reports_severity ON bug_reports(severity);

-- Create index on created_at for sorting by date
CREATE INDEX idx_bug_reports_created_at ON bug_reports(created_at DESC);

-- Enable RLS (Row Level Security) - Optional but recommended
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert a bug report
CREATE POLICY "Anyone can submit bug reports" ON bug_reports
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can view all bug reports
CREATE POLICY "Anyone can view bug reports" ON bug_reports
  FOR SELECT
  USING (true);

-- Policy: Only the reporter or an admin can update/delete their own report
-- (You might want to add an admin role check here)
CREATE POLICY "Users can update their own reports" ON bug_reports
  FOR UPDATE
  USING (auth.uid() = reporter_id)
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can delete their own reports" ON bug_reports
  FOR DELETE
  USING (auth.uid() = reporter_id);

-- Optional: Create a function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER update_bug_reports_updated_at
BEFORE UPDATE ON bug_reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
