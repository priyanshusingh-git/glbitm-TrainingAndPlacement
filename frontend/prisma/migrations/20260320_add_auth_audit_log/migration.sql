CREATE TABLE "AuthAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "emailHash" TEXT,
    "action" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT,
    "fingerprint" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuthAuditLog_userId_idx" ON "AuthAuditLog"("userId");
CREATE INDEX "AuthAuditLog_ip_idx" ON "AuthAuditLog"("ip");
CREATE INDEX "AuthAuditLog_action_idx" ON "AuthAuditLog"("action");
CREATE INDEX "AuthAuditLog_createdAt_idx" ON "AuthAuditLog"("createdAt");

ALTER TABLE "AuthAuditLog"
ADD CONSTRAINT "AuthAuditLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
