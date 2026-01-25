# kbw Notes - Feature Roadmap & Analysis

> Last Updated: January 2025

---

## Current State Summary

Your blog has a solid foundation with:
- Post feed with infinite scroll
- Nested comments (3 levels) with AI moderation
- Likes, bookmarks, shares
- OAuth authentication (Google, Apple, Azure)
- User profiles (display name, bio, website, avatar)
- Theme/appearance settings (Light/Dark/System)
- Reading time display
- Responsive design with dark mode
- Loading skeletons and animations
- Font size and density controls

---

## Feature Categories

### VITAL FEATURES (9 Features)

These are features users **expect** on any modern blog. Missing them creates friction or makes the blog incomplete.

| # | Feature | Why It's Vital | Benchmark |
|---|---------|---------------|-----------|
| 1 | **Search** | Users can't find content without it. "A search function within your blog can help your audience find specific information without needing to hunt through archives" | All major platforms |
| 2 | **SEO-friendly URLs** | Currently using UUIDs (`/post/abc-123`). Need slugs (`/post/how-to-build-apis`) for Google indexing and shareability | WordPress, Ghost, Hashnode |
| 3 | **Newsletter/Email Signup** | "Email is a much more reliable way to reach your audience over social media" - Core for audience building and retention | Substack, Ghost, Medium |
| 4 | **SEO Metadata** | No Open Graph, Twitter Cards, meta descriptions. Posts won't preview properly when shared on social media | All platforms |
| 5 | **Author Pages** | Can't view all posts by a specific author. Essential for multi-author blogs and building contributor recognition | Dev.to, Medium, Hashnode |
| 6 | **Tag/Category Pages** | Tags exist on posts but there's no way to browse posts by tag. Users can't explore topics | All platforms |
| 7 | **Post Creation UI** | Submissions pages are placeholders. No way to actually create posts through the interface | All platforms |
| 8 | **404/Error Pages** | No graceful handling of missing content or broken links | Standard web practice |
| 9 | **Sitemap** | No XML sitemap for search engines. Critical for SEO and discoverability | All SEO-focused platforms |

---

### IMPORTANT FEATURES (9 Features)

Users on tech blogs commonly expect these. Missing them feels incomplete compared to competitors.

| # | Feature | Why It Matters | Benchmark |
|---|---------|---------------|-----------|
| 10 | **Reading Progress Bar** | "Humans are goal-oriented and love completing tasks" - Shows percentage through article, reduces bounce rate | Medium, many modern blogs |
| 11 | **Code Syntax Highlighting** | You have a tech blog. Code blocks need proper highlighting for readability | Dev.to, Hashnode (built-in) |
| 12 | **Related Posts** | Recommendations at end of articles increase session time and page views | Medium, WordPress |
| 13 | **Post Archives** | Browse by date/month/year. Helps users find older content | WordPress, Ghost |
| 14 | **Edit Own Comments** | Users currently can't fix typos in their comments. Standard expectation | Reddit, Dev.to |
| 15 | **Comment Sorting** | Sort by newest, oldest, most liked. Helps surface quality discussion | Reddit, YouTube |
| 16 | **Image Optimization** | No lazy loading or responsive images. Impacts performance and Core Web Vitals | Modern web standards |
| 17 | **Anchor Links in Headings** | Direct links to sections for sharing specific parts of articles | Dev.to, GitHub |
| 18 | **Copy Code Button** | One-click copy for code blocks. Essential UX for developer blogs | Dev.to, Hashnode, GitHub |

---

### NICE TO HAVE FEATURES (11 Features)

These differentiate good blogs from great ones and provide competitive advantages.

| # | Feature | Value Add | Benchmark |
|---|---------|----------|-----------|
| 19 | **Follow Authors** | Get notified when favorite authors post new content | Dev.to, Medium |
| 20 | **Post Series** | Group related articles (e.g., "React Tutorial Part 1-5") | Dev.to, Hashnode |
| 21 | **Reading List** | Save posts for later (distinct from bookmarks - more like a queue) | Dev.to |
| 22 | **Post Drafts** | Save work in progress before publishing | All CMS platforms |
| 23 | **Post Scheduling** | Schedule posts for future publication dates | WordPress, Ghost |
| 24 | **Analytics Dashboard** | Views, read time, engagement metrics for authors | Hashnode, Ghost |
| 25 | **Comment Mentions (@user)** | Notify users when mentioned in comments | Slack, GitHub, Dev.to |
| 26 | **Multiple Reaction Types** | Beyond just likes (fire, unicorn, celebrate, informative) | Dev.to |
| 27 | **Image Lightbox** | Click to enlarge images in posts | Medium |
| 28 | **PWA/Offline Reading** | Read saved posts offline, installable app | Modern web apps |
| 29 | **Post Versions/History** | See edit history and previous versions | Wikipedia, Notion |

---

## Implementation Phases

### Phase 1: Foundation & Discovery
*Focus: Make content findable*

| Priority | Feature | Complexity | Dependencies |
|----------|---------|------------|--------------|
| 1.1 | Search | Medium | None |
| 1.2 | SEO-friendly URLs (slugs) | Medium | Database migration |
| 1.3 | Tag/Category Pages | Low | Routing |
| 1.4 | Author Pages | Low | Routing |
| 1.5 | 404/Error Pages | Low | None |
| 1.6 | Sitemap | Low | Slug URLs |

### Phase 2: SEO & Distribution
*Focus: Grow audience*

| Priority | Feature | Complexity | Dependencies |
|----------|---------|------------|--------------|
| 2.1 | SEO Metadata (Open Graph, Twitter Cards) | Medium | Slug URLs |
| 2.2 | Newsletter/Email Signup | Medium | Email service integration |
| 2.3 | Related Posts | Medium | Algorithm/tags |
| 2.4 | Post Archives | Low | Date queries |

### Phase 3: Content Creation
*Focus: Enable contributors*

| Priority | Feature | Complexity | Dependencies |
|----------|---------|------------|--------------|
| 3.1 | Post Creation UI | High | Rich text editor |
| 3.2 | Post Drafts | Medium | Post Creation UI |
| 3.3 | Post Scheduling | Medium | Post Creation UI |
| 3.4 | Post Series | Medium | Database schema |

### Phase 4: Reading Experience
*Focus: Polish and UX*

| Priority | Feature | Complexity | Dependencies |
|----------|---------|------------|--------------|
| 4.1 | Code Syntax Highlighting | Low | Markdown parser |
| 4.2 | Reading Progress Bar | Low | None |
| 4.3 | Anchor Links in Headings | Low | Markdown parser |
| 4.4 | Copy Code Button | Low | Code highlighting |
| 4.5 | Image Optimization | Medium | Build config |
| 4.6 | Image Lightbox | Low | None |

### Phase 5: Community & Engagement
*Focus: Build community*

| Priority | Feature | Complexity | Dependencies |
|----------|---------|------------|--------------|
| 5.1 | Edit Own Comments | Low | None |
| 5.2 | Comment Sorting | Low | None |
| 5.3 | Follow Authors | Medium | Database schema, notifications |
| 5.4 | Comment Mentions (@user) | Medium | Notifications |
| 5.5 | Multiple Reaction Types | Medium | Database schema |
| 5.6 | Reading List | Low | Similar to bookmarks |

### Phase 6: Advanced Features
*Focus: Power users*

| Priority | Feature | Complexity | Dependencies |
|----------|---------|------------|--------------|
| 6.1 | Analytics Dashboard | High | Data collection |
| 6.2 | Post Versions/History | Medium | Database schema |
| 6.3 | PWA/Offline Reading | Medium | Service worker |

---

## Competitive Positioning

| Platform | Strength | kbw Notes Opportunity |
|----------|----------|----------------------|
| **Medium** | Built-in audience, clean reading experience | You have AI moderation (unique!) |
| **Substack** | Newsletter-first, monetization tools | Focus on community features |
| **Dev.to** | Developer community, multiple reactions | Match code features, add AI moderation |
| **Hashnode** | Custom domains, great SEO | Similar tech stack advantage |

**Your unique differentiator**: AI-powered comment moderation - no other platform has this built-in. Lean into community and discussion features to capitalize on this advantage.

---

## Summary

| Category | Count | Status |
|----------|-------|--------|
| Vital | 9 features | Not started |
| Important | 9 features | Not started |
| Nice to Have | 11 features | Not started |
| **Total** | **29 features** | |

---

## References

- [WPBeginner - Best Blogging Platforms](https://www.wpbeginner.com/beginners-guide/how-to-choose-the-best-blogging-platform/)
- [Gravatar Blog - Future of Blog UX](https://blog.gravatar.com/2024/12/23/blog-ux-best-practices/)
- [CYBERsprout - Table of Contents Importance](https://cybersprout.net/toc-table-of-contents-blog-posts/)
- [Tiny - 16 Blog Features](https://www.tiny.cloud/blog/best-blog-features/)
- [Dev.to vs Hashnode vs Medium](https://dev.to/shahednasser/dev-vs-hashnode-vs-medium-where-should-you-start-your-tech-blog-91i)
- [Substack vs Medium for Coders](https://fundor333.com/post/2025/substack-vs-medium-what-is-better-for-a-coder/)
- [HubSpot - Multi-Author Management](https://blog.hubspot.com/website/must-have-plugins-for-multi-author-blogs)
