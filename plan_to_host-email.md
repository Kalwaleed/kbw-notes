# Plan: Host kalwaleed.com Email with Google Workspace

**Domain**: kalwaleed.com
**DNS Provider**: Vercel
**Email Provider**: Google Workspace
**Status**: DNS records already configured, need to set up new Google Workspace account

---

## Current DNS Status (Verified 2026-01-29)

All required DNS records are already configured in Vercel:

### MX Records ✅
| Priority | Server |
|----------|--------|
| 1 | aspmx.l.google.com |
| 5 | alt1.aspmx.l.google.com |
| 5 | alt2.aspmx.l.google.com |
| 10 | alt3.aspmx.l.google.com |
| 10 | alt4.aspmx.l.google.com |

### Authentication Records ✅
| Type | Name | Value |
|------|------|-------|
| TXT | @ | `v=spf1 include:_spf.google.com ~all` |
| TXT | google._domainkey | DKIM public key (configured) |
| TXT | _dmarc | `v=DMARC1; p=none; rua=mailto:dmarc-reports@kalwaleed.com` |
| TXT | @ | `google-site-verification=23SAuiq--iFEGyFhC6A3yJ5_yUDNh4Edz3VpDSupu84` |

---

## Steps to Complete Migration

### Step 1: Create New Google Workspace Account (Manual - Required)

**Why manual?** Google Workspace cannot be set up via CLI - it requires interactive signup with billing.

1. Go to [workspace.google.com](https://workspace.google.com)
2. Click "Get Started"
3. Enter business name and number of employees
4. Enter your personal info (admin account)
5. Enter domain: `kalwaleed.com`
6. Choose plan (Business Starter: $6/user/month)
7. Enter payment information

### Step 2: Verify Domain Ownership

During setup, Google will ask you to verify domain ownership. You have options:

**Option A**: Use existing verification record
- The TXT record `google-site-verification=23SAuiq--iFEGyFhC6A3yJ5_yUDNh4Edz3VpDSupu84` may still work
- Try this first

**Option B**: Add new verification record
- If Google provides a new verification code, add it via:
```bash
vercel dns add kalwaleed.com '@' TXT "google-site-verification=NEW_CODE_HERE"
```

### Step 3: Verify MX Records Point to Google

Google will check that MX records are configured. They already are - just click "Verify" in the Google Workspace setup wizard.

### Step 4: Update DKIM Key (If Different)

The new Google Workspace account may generate a different DKIM key:

1. In Google Admin Console → Apps → Gmail → Authenticate email
2. Click "Generate new record"
3. If the key is different from the existing one:

```bash
# Remove old DKIM record
vercel dns remove rec_c5c6cc030f3da35fd9409338

# Add new DKIM record
vercel dns add kalwaleed.com 'google._domainkey' TXT "v=DKIM1; k=rsa; p=NEW_KEY_HERE"
```

### Step 5: Create Email Users

1. In Google Admin Console → Users
2. Add users (e.g., `you@kalwaleed.com`)
3. Set passwords or send setup emails

---

## Verification Commands

Check DNS propagation:
```bash
# Check MX records
dig kalwaleed.com MX +short

# Check SPF
dig kalwaleed.com TXT +short

# Check DKIM
dig google._domainkey.kalwaleed.com TXT +short

# Full test
# Visit: https://mxtoolbox.com/SuperTool.aspx?action=mx:kalwaleed.com
```

---

## Troubleshooting

**"Domain already in use by another Google account"**
- The previous Google account must fully release the domain
- In old account: Admin Console → Account → Account settings → Delete domain
- Wait 24-48 hours for Google's systems to update

**DKIM not working after migration**
- New Workspace account = new DKIM key
- Must update the `google._domainkey` TXT record

**Emails not receiving**
- Verify MX records: `dig kalwaleed.com MX`
- Check Google Admin Console for any setup warnings
- Wait up to 48 hours for full propagation

---

## CLI Commands Reference

```bash
# List all DNS records
vercel dns list kalwaleed.com

# Add a TXT record
vercel dns add kalwaleed.com '@' TXT "value"

# Add an MX record
vercel dns add kalwaleed.com '@' MX mail.example.com 10

# Remove a record by ID
vercel dns remove rec_XXXXX
```

---

*Created: 2026-01-29*
*DNS Status: Pre-configured from previous Google Workspace setup*
