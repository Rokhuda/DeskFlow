-- CreateTable
CREATE TABLE "TicketResolution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "resolvedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolutionSeconds" INTEGER NOT NULL,
    CONSTRAINT "TicketResolution_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TicketResolution_resolvedAt_idx" ON "TicketResolution"("resolvedAt");
