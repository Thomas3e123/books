-- Owner-approved removal of the two existing Pilot Room setup records.
-- Their linked plans, entries, and messages are removed by the participant foreign keys.
DELETE FROM gravity_pilot_participants
WHERE id IN (
  'pilot_e8c2dbba5ef84c408a0ff89b5764bbb8',
  'pilot_7a46f7fe061f4dad8942b6388d523f3e'
);
