-- AlterTable
ALTER TABLE "FollowUp" ADD COLUMN     "lastError" TEXT;

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN     "externalMessageId" TEXT,
ADD COLUMN     "gmailThreadId" TEXT,
ADD COLUMN     "inReplyToHeader" TEXT,
ADD COLUMN     "repliedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "authUserId" TEXT;

-- CreateTable
CREATE TABLE "MailAccount" (
    "id" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokensCipher" TEXT NOT NULL,
    "tokensIv" TEXT NOT NULL,
    "scope" TEXT,
    "historyId" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MailAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MailAccount_teamMemberId_key" ON "MailAccount"("teamMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_externalMessageId_key" ON "Inquiry"("externalMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_authUserId_key" ON "TeamMember"("authUserId");

-- AddForeignKey
ALTER TABLE "MailAccount" ADD CONSTRAINT "MailAccount_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
