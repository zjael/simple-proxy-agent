# SOCKS DNS Resolution Analysis

## The Problem

There's a bug in how SOCKS proxy DNS resolution is handled in `src/socks.js`.

## SOCKS Protocol DNS Behavior

Different SOCKS protocols handle DNS resolution differently:

| Protocol | DNS Resolution           | Implementation                                             |
| -------- | ------------------------ | ---------------------------------------------------------- |
| SOCKS4   | **Local** (client-side)  | Client must resolve hostname to IP before sending to proxy |
| SOCKS4a  | **Remote** (server-side) | Proxy resolves hostname                                    |
| SOCKS5   | **Remote** (server-side) | Proxy resolves hostname (default behavior)                 |
| SOCKS5h  | **Remote** (server-side) | Explicitly remote (same as SOCKS5)                         |

## Current Bug

In `src/socks.js` lines 72-78:

```javascript
let lookup = false;
switch (this.proxy.protocol) {
  case 'socks4:':
  case 'socks5:': // ❌ BUG: SOCKS5 should NOT do local DNS
    lookup = true;
    break;
}
```

**Problem:** This code does local DNS resolution for `socks5://` URLs, but SOCKS5 should do **remote** DNS resolution by default.

## Impact

- ✅ `socks4://` works correctly (local DNS)
- ✅ `socks4a://` works correctly (remote DNS)
- ❌ `socks5://` **incorrectly** does local DNS (should be remote)
- ✅ `socks5h://` works correctly (remote DNS)

## Why SOCKS4 Tests Are Failing

SOCKS4 tests may be failing due to:

1. Test proxy server not properly handling SOCKS4 protocol
2. DNS resolution issues in test environment
3. Network/firewall blocking SOCKS4 connections

## Recommended Fix

```javascript
let lookup = false;
switch (this.proxy.protocol) {
  case 'socks4:':
    // SOCKS4 REQUIRES local DNS resolution (needs IP address)
    lookup = true;
    break;
  // SOCKS4a, SOCKS5, SOCKS5h all use remote DNS (lookup = false)
}
```

## Testing Plan

1. Fix the SOCKS5 DNS resolution bug
2. Re-enable SOCKS4 tests
3. Test with real SOCKS4/SOCKS5 proxy servers
4. Verify DNS resolution happens at the correct layer

## References

- [SOCKS4 Protocol](https://www.openssh.com/txt/socks4.protocol)
- [SOCKS4a Extension](https://www.openssh.com/txt/socks4a.protocol)
- [SOCKS5 RFC 1928](https://datatracker.ietf.org/doc/html/rfc1928)
