# Security Specification & Threat Model — NDU PAT Investment

## 1. Data Invariants
1. **Admin Privilege Boundary**: Only authenticated, email-verified site administrators (`kennywemson1@gmail.com`, `osenialayo@gmail.com`) may create, update, or delete catalog items (`products`, `services`, `books`, `editorial`, `testimonials`, `settings`), read/manage private submissions (`appointments`, `messages`, `orders`), or approve any comment/reply.
2. **PII Isolation**: Visitor contact details (`appointments`, `messages`, `orders`) contain names, emails, and phone numbers. Public users may create `appointments` and `messages` (strictly validated with `status == 'Pending'` / `'Unread'` and `createdAt == request.time`), but may NEVER read, list, update, or delete them.
3. **Comment Moderation Gate**: Comments and replies under `editorial`, `products`, and `services` can only be created by authenticated users with `userId == request.auth.uid`, `createdAt == request.time`, and `status == 'pending'` (unless the author is a verified site admin). Public reads (`get` and `list`) only return documents where `resource.data.status == 'approved'` (unless `isSiteAdmin()`).
4. **No Self-Assigned Admin Roles**: Users creating `/users/{userId}` can only set `uid == request.auth.uid` and `role == 'client'`, and cannot escalate `role` on update.
5. **Path & Payload Bounding**: All document IDs are validated with `isValidId(id)` (`^[a-zA-Z0-9_-]{1,128}$`), all strings enforce `.size()` upper bounds, and all writes enforce `keys().hasAll(...)` + `keys().hasOnly(...)` to block shadow/ghost fields.

## 2. The "Dirty Dozen" Attack Payloads
1. **Unverified Admin Email Spoof**: `{ email: "kennywemson1@gmail.com", email_verified: false }` attempting write to `/sites/siteB/products/p1` -> `PERMISSION_DENIED`.
2. **Shadow Field Injection on Product**: `{ name: "Yamaha Piano", shortDescription: "88-key", position: 1, isAdminOverride: true }` -> `PERMISSION_DENIED`.
3. **Public PII Scrape on Appointments**: Unauthenticated or non-admin `list` on `/sites/siteB/appointments` -> `PERMISSION_DENIED`.
4. **Public PII Scrape on Messages**: Non-admin `get` on `/sites/siteB/messages/m1` -> `PERMISSION_DENIED`.
5. **Appointment Status Bypass on Create**: Public create on `/sites/siteB/appointments/a1` with `status: "Confirmed"` -> `PERMISSION_DENIED`.
6. **Comment Auto-Approval Spoof**: Non-admin authenticated user creating comment with `status: "approved"` -> `PERMISSION_DENIED`.
7. **Comment Identity Spoofing**: User `uidA` creating comment with `userId: "uidB"` -> `PERMISSION_DENIED`.
8. **Pending Comment Leakage**: Non-admin querying `/sites/siteB/editorial/e1/comments` without `where('status', '==', 'approved')` -> `PERMISSION_DENIED`.
9. **Client Timestamp Tampering**: Creating appointment with backdated `createdAt` (`!= request.time`) -> `PERMISSION_DENIED`.
10. **Self-Role Escalation**: User `uidA` updating `/users/uidA` with `role: "admin"` -> `PERMISSION_DENIED`.
11. **Oversized Payload / Resource Exhaustion**: Creating product with 20,000-char `name` -> `PERMISSION_DENIED`.
12. **ID Poisoning**: Creating document with 300-char invalid ID containing slashes/spaces -> `PERMISSION_DENIED`.
