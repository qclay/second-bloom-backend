-- Add PHONE_CHANGE to VerificationPurpose enum
-- Using DO block to safely add enum value only if it doesn't exist
DO $$
DECLARE
    type_oid oid;
BEGIN
    -- Get the OID of the VerificationPurpose type from the current schema
    SELECT t.oid INTO type_oid
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'VerificationPurpose'
    AND n.nspname = current_schema()
    LIMIT 1;
    
    -- Only add the value if the type exists and the value doesn't exist
    IF type_oid IS NOT NULL AND NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'PHONE_CHANGE' 
        AND enumtypid = type_oid
    ) THEN
        ALTER TYPE "VerificationPurpose" ADD VALUE 'PHONE_CHANGE';
    END IF;
END $$;
