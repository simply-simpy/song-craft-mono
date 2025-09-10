# Split Sheets UI and Workflow

## UI Touch Points

### Invite Modal

- Fields: emails, role collaborator, session date time, method, notes
- Toggles for domain restriction if org policy

### Pre-session Banner on Song Page

- Join Zoom
- Test audio
- View participant list
- One-click check in

### Attendance Panel

- Show present/absent live
- Owners can mark manual no show with reason

### Split Sheet Wizard

- Step 1: participants
- Step 2: split scheme (even or custom)
- Step 3: signatures
- Step 4: finalize and export

### Audit Drawer

- Every invite, accept, decline, no show, proposal, sign, finalize is logged and filterable

## Rules and Edge Cases

### Inclusion Rule

- Only participants with status "participated" are included in the default split
- No show users get auto_excluded record and notification

### Late Join

- Mark late but still participated if present before session_end_at cutoff configured

### Multiple Sessions

- Each session can create its own split proposal
- Finalization creates song_split_final version n
- You always keep history

### Adding a Writer After the Fact

- Owner can propose an amended split version
- Requires all signatures again
- Old versions stay for audit

### Manager Escalation

- For no shows or rejections, notify all Account Owners and Org managers per policy

### Conflict Guard

- Finalization requires that all percentages sum to 100.0 within tolerance
- Each signer matched by user_id or verified email

## Generated Artifacts

- ICS invite with Zoom link and metadata
- Split sheet PDF with:
  - Title, date, writers, percentages
  - PRO and publisher info
  - Contacts, signatures, version id, hash
- JSON payloads stored with each proposal and final for machine reads
- Audit log rows for every step
