-- AlterTable
-- Convert existing DateTime values to date strings (YYYY-MM-DD format)
-- Then change column type from TIMESTAMP(3) to TEXT
-- Using DO block to safely handle if column is already TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'birthDate' 
        AND data_type = 'timestamp without time zone'
    ) THEN
        ALTER TABLE "users" 
        ALTER COLUMN "birthDate" TYPE TEXT 
        USING CASE 
            WHEN "birthDate" IS NULL THEN NULL
            ELSE TO_CHAR("birthDate"::timestamp, 'YYYY-MM-DD')
        END;
    ELSIF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'birthDate' 
        AND data_type = 'text'
    ) THEN
        -- Column is already TEXT, no action needed
        RAISE NOTICE 'birthDate column is already TEXT, skipping conversion';
    END IF;
END $$;
