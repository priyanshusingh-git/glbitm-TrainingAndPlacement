DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'Role' AND e.enumlabel = 'STAFF'
  ) THEN
    DROP TYPE IF EXISTS "Role_new";

    ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

    CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'TRAINER', 'RECRUITER', 'STUDENT');

    ALTER TABLE "User"
      ALTER COLUMN "role" TYPE "Role_new"
      USING (
        CASE
          WHEN "role"::text = 'STAFF' THEN 'ADMIN'
          ELSE "role"::text
        END
      )::"Role_new";

    DROP TYPE "Role";
    ALTER TYPE "Role_new" RENAME TO "Role";

    ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
  END IF;
END $$;
