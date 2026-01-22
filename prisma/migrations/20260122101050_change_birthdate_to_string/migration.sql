-- AlterTable
-- Convert existing DateTime values to date strings (YYYY-MM-DD format)
-- Then change column type from TIMESTAMP(3) to TEXT
ALTER TABLE "users" 
  ALTER COLUMN "birthDate" TYPE TEXT 
  USING CASE 
    WHEN "birthDate" IS NULL THEN NULL
    ELSE TO_CHAR("birthDate", 'YYYY-MM-DD')
  END;
