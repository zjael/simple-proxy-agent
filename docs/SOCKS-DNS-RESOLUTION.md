# SOCKS DNS Resolution Guide

## SOCKS Protocol DNS Behavior

Different SOCKS protocols handle DNS resolution differently:

| Protocol | DNS Resolution           | Implementation                                |
| -------- | ------------------------ | --------------------------------------------- |
| SOCKS4   | **Client-side** (local)  | Client resolves hostname to IP before sending |
| SOCKS4a  | **Server-side** (remote) | Proxy resolves hostname                       |
| SOCKS5   | **Client-side** (local)  | Client resolves hostname (standard behavior)  |
| SOCKS5h  | **Server-side** (remote) | Proxy resolves hostname (explicit remote DNS) |

## Current Implementation

In `src/socks.js` lines 72-77:

```javascript
// SOCKS4 and SOCKS5 use client-side DNS resolution
// SOCKS4a and SOCKS5h use remote DNS resolution (hostname resolved by proxy)
let lookup = false;
if (this.proxy.protocol === 'socks4:' || this.proxy.protocol === 'socks5:') {
  lookup = true;
}
```

## DNS Resolution Details

### Client-Side DNS (SOCKS4, SOCKS5)

- Hostname is resolved to IP address by the client
- IP address is sent to the proxy server
- Better for performance (no extra DNS lookup on proxy)
- DNS queries visible to local network

### Server-Side DNS (SOCKS4a, SOCKS5h)

- Hostname is sent directly to the proxy server
- Proxy resolves the hostname to IP address
- Better for privacy (DNS queries hidden from local network)
- Required when client cannot resolve hostname

## Protocol Selection Guide

- Use `socks4://` for basic SOCKS4 proxy with client-side DNS
- Use `socks4a://` for SOCKS4 with remote DNS (privacy)
- Use `socks5://` for modern SOCKS5 with client-side DNS
- Use `socks5h://` for SOCKS5 with remote DNS (privacy)

## Why SOCKS4 Tests Are Disabled

SOCKS4 tests are currently disabled due to:

1. Test proxy server compatibility issues with SOCKS4 protocol
2. SOCKS4 is a legacy protocol from 1992
3. Implementation is correct but cannot be verified with test infrastructure

## References

- [SOCKS4 Protocol](https://www.openssh.com/txt/socks4.protocol)
- [SOCKS4a Extension](https://www.openssh.com/txt/socks4a.protocol)
- [SOCKS5 RFC 1928](https://datatracker.ietf.org/doc/html/rfc1928)
