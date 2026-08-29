ALTER TABLE action_receipts
  ADD COLUMN idempotency_key TEXT NOT NULL DEFAULT '';
