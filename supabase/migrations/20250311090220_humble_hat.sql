/*
  # Disable email confirmation requirement

  1. Changes
    - Disable email confirmation requirement for new sign ups
    - This allows users to sign in immediately after registration
    - Matches the project requirement that email confirmation should be disabled

  2. Security Note
    - This is as per project requirements
    - In production environments, email confirmation is recommended for security
*/

ALTER TABLE auth.users
ALTER COLUMN email_confirmed_at 
SET DEFAULT NOW();

-- Set email_confirmed_at for any existing users that haven't confirmed their email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;