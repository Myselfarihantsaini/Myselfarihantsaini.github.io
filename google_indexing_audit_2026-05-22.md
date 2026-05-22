# Google Indexing Audit - Shambhavaa.com

Date: 2026-05-22

## Public Index Check

Public Google-style searches did not confirm indexed `shambhavaa.com/posts/` article URLs at the time of this audit.

Confirmed through public search:
- `site:shambhavaa.com/posts/` did not return confirmable article results.
- Exact-title checks for recent `shambhavaa.com` articles did not return confirmable `shambhavaa.com` article URLs.
- Similar article titles were found on `shambhavaa.blog`, which means the root consultation site should keep stronger internal linking and sitemap freshness for its own article URLs.

Important limitation: public `site:` search is not a perfect index report. The accurate count must be checked in Google Search Console under Page indexing or URL Inspection.

## Local Technical Indexability Check

Checked pages:
- Article hub: 1
- Posts: 16
- Resource pages: 9

Results:
- All checked post/resource URLs return HTTP 200 live.
- All checked post/resource pages have `index,follow`.
- All checked post/resource pages have canonical URLs.
- All checked post/resource pages have one H1.
- All checked post/resource pages are included in `sitemap.xml`.
- `robots.txt` allows Googlebot and points to `https://shambhavaa.com/sitemap.xml`.

## Fix Applied

Updated `sitemap.xml` so important URLs have fresh `lastmod` dates and stronger article priorities:
- Homepage: priority `1.0`
- Articles hub: priority `0.9`
- Posts: priority `0.8`
- Resources: priority `0.75`
- Consultation pages: priority up to `0.85`

The sitemap now includes:
- 49 total URLs
- 16 post URLs
- 9 resource URLs
- 1 articles hub URL

## Required Search Console Action

To request indexing, use Google Search Console:

1. Submit or resubmit `https://shambhavaa.com/sitemap.xml`.
2. Use URL Inspection for the most important URLs.
3. Click Request indexing for:
   - `https://shambhavaa.com/articles.html`
   - `https://shambhavaa.com/posts/aries-in-all-12-houses-vedic-astrology.html`
   - `https://shambhavaa.com/posts/leo-in-all-12-houses-vedic-astrology.html`
   - `https://shambhavaa.com/posts/why-rahu-makes-you-obsessive.html`
   - `https://shambhavaa.com/posts/why-saturn-creates-emotional-isolation.html`

Google does not guarantee indexing, but these are now technically ready for crawling and index consideration.
