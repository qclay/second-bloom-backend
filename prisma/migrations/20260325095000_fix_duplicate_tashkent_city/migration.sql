-- Deactivate accidental duplicate city: Tashkent inside Tashkent region.
-- Keep Tashkent that belongs to Tashkent City region active.
UPDATE "cities" c
SET
  "isActive" = false,
  "updatedAt" = NOW()
FROM "regions" r
WHERE c."regionId" = r."id"
  AND c."isActive" = true
  AND (c."name" ->> 'en') = 'Tashkent'
  AND (r."name" ->> 'en') = 'Tashkent'
  AND EXISTS (
    SELECT 1
    FROM "cities" c2
    JOIN "regions" r2 ON r2."id" = c2."regionId"
    WHERE c2."isActive" = true
      AND (c2."name" ->> 'en') = 'Tashkent'
      AND (r2."name" ->> 'en') = 'Tashkent City'
  );
