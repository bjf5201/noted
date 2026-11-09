-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION set_users_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

--> statement-breakpoint
CREATE TRIGGER users_updated_at()
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_users_updated_at();