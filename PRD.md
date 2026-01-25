# Product Requirements Document (PRD)
## kbw Notes - Tech Blog Platform

| Document Info | |
|---------------|---|
| **Product Name** | kbw Notes |
| **Version** | 2.0 |
| **Last Updated** | January 2025 |
| **Status** | Planning |
| **Owner** | kbw |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Current State Analysis](#3-current-state-analysis)
4. [User Personas](#4-user-personas)
5. [Feature Specifications](#5-feature-specifications)
6. [Technical Architecture](#6-technical-architecture)
7. [Implementation Phases](#7-implementation-phases)
8. [Success Metrics](#8-success-metrics)
9. [Risks & Mitigations](#9-risks--mitigations)
10. [Appendix](#10-appendix)

---

## 1. Executive Summary

### 1.1 Overview

kbw Notes is a modern tech blog platform built with React, TypeScript, and Supabase. The platform aims to provide a clean, performant reading experience with a unique AI-powered comment moderation system that differentiates it from competitors like Medium, Dev.to, and Hashnode.

### 1.2 Problem Statement

Current blogging platforms either:
- Lack developer-focused features (Medium)
- Have poor SEO and discovery (Substack)
- Don't offer AI-powered moderation (all platforms)
- Require complex setup (WordPress)

### 1.3 Solution

Build a tech-focused blog platform that combines:
- Clean, distraction-free reading experience
- AI-powered comment moderation (unique differentiator)
- Developer-friendly features (syntax highlighting, code blocks)
- Strong SEO foundation
- Community engagement features

### 1.4 Scope

This PRD covers 29 features across 6 implementation phases:
- **9 Vital Features** - Core functionality
- **9 Important Features** - Expected features
- **11 Nice-to-Have Features** - Competitive advantages

---

## 2. Product Vision

### 2.1 Vision Statement

> "Create the most thoughtful tech blog platform where quality content and meaningful discussion thrive, powered by AI moderation that keeps conversations constructive."

### 2.2 Strategic Goals

| Goal | Description | Measure |
|------|-------------|---------|
| **Discoverability** | Make content findable via search engines and on-site search | Organic traffic, search rankings |
| **Engagement** | Foster meaningful discussions through moderated comments | Comments per post, return visitors |
| **Growth** | Build audience through newsletter and social sharing | Subscriber count, share rate |
| **Creator Experience** | Enable seamless content creation and analytics | Posts published, author retention |

### 2.3 Competitive Positioning

| Platform | Their Strength | Our Advantage |
|----------|---------------|---------------|
| Medium | Built-in audience | AI moderation, no paywall friction |
| Substack | Newsletter-first | Better SEO, community features |
| Dev.to | Developer community | Cleaner UX, AI moderation |
| Hashnode | Custom domains | Simpler setup, unique features |

**Unique Value Proposition**: AI-powered comment moderation ensures high-quality discussions without manual intervention.

---

## 3. Current State Analysis

### 3.1 Existing Features

#### Content & Reading
- [x] Blog post feed with infinite scroll
- [x] Individual post pages with full content
- [x] Markdown rendering for post body
- [x] Reading time calculation and display
- [x] Tags displayed on posts

#### User System
- [x] OAuth authentication (Google, Apple, Azure)
- [x] User profiles (display name, bio, website, avatar)
- [x] Profile setup flow for new users
- [x] Session persistence

#### Engagement
- [x] Post likes with counts
- [x] Post bookmarks
- [x] Social sharing (Twitter, LinkedIn, copy link)
- [x] Nested comments (3 levels deep)
- [x] AI-powered comment moderation via Claude API
- [x] Anonymous commenting support

#### Settings & Preferences
- [x] Theme toggle (Light/Dark/System)
- [x] Font size control (Small/Medium/Large)
- [x] Layout density (Compact/Comfortable/Spacious)
- [x] Default sort preference
- [x] Posts per page setting
- [x] Auto-expand comments toggle

#### UI/UX
- [x] Responsive design
- [x] Dark mode support
- [x] Loading skeletons
- [x] Smooth animations
- [x] Mobile navigation

### 3.2 Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions) |
| AI | Claude API (comment moderation) |
| Testing | Vitest, Playwright |
| Icons | Lucide React |

### 3.3 Current Limitations

| Area | Limitation | Impact |
|------|------------|--------|
| Discovery | No search functionality | Users can't find content |
| SEO | UUID-based URLs | Poor search engine indexing |
| SEO | No meta tags | Bad social share previews |
| Content | No post creation UI | Can't create posts via interface |
| Navigation | No tag/author pages | Limited content exploration |
| Errors | No 404 pages | Poor error handling UX |

---

## 4. User Personas

### 4.1 Reader - "Riley the Regular"

| Attribute | Description |
|-----------|-------------|
| **Role** | Software developer, reads tech blogs daily |
| **Goals** | Find relevant content quickly, save for later, engage in discussions |
| **Pain Points** | Can't search, can't browse by topic, can't follow favorite authors |
| **Key Features** | Search, tags, bookmarks, follow authors |

### 4.2 Commenter - "Casey the Contributor"

| Attribute | Description |
|-----------|-------------|
| **Role** | Active community member, comments frequently |
| **Goals** | Engage in meaningful discussions, get notified of replies |
| **Pain Points** | Can't edit typos, can't mention others, limited reactions |
| **Key Features** | Edit comments, @mentions, multiple reactions |

### 4.3 Author - "Alex the Author"

| Attribute | Description |
|-----------|-------------|
| **Role** | Content creator, writes technical articles |
| **Goals** | Publish content easily, track performance, build audience |
| **Pain Points** | No post creation UI, no analytics, no scheduling |
| **Key Features** | Post editor, drafts, scheduling, analytics |

### 4.4 Admin - "Morgan the Moderator"

| Attribute | Description |
|-----------|-------------|
| **Role** | Platform administrator |
| **Goals** | Ensure content quality, manage users, monitor health |
| **Pain Points** | Limited visibility into AI moderation, no admin dashboard |
| **Key Features** | Moderation dashboard, user management, analytics |

---

## 5. Feature Specifications

### 5.1 VITAL FEATURES

---

#### Feature V1: Search

| Attribute | Description |
|-----------|-------------|
| **Priority** | P0 - Critical |
| **Phase** | Phase 1 |
| **Complexity** | Medium |
| **Dependencies** | None |

**User Story**
> As a reader, I want to search for posts by keyword so that I can find relevant content quickly.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| V1.1 | Search bar visible in header on all pages |
| V1.2 | Search queries post titles, body content, and tags |
| V1.3 | Results page shows matching posts with highlighted terms |
| V1.4 | Search input has 300ms debounce |
| V1.5 | Empty state shown when no results found |
| V1.6 | Recent searches stored in localStorage (last 5) |

**UI/UX Requirements**
- Search icon in header expands to input on click
- Dedicated `/search` results page
- Results show: title, excerpt (with highlights), author, date, tags
- "No results" state suggests alternative searches

**Technical Approach**
- Option A: Supabase full-text search with `tsvector`
- Option B: External service (Algolia, Meilisearch)
- Recommendation: Start with Supabase, migrate if needed

**Acceptance Criteria**
- [ ] Can search from any page
- [ ] Results return in < 500ms
- [ ] Partial word matches work
- [ ] Search terms highlighted in results

---

#### Feature V2: SEO-Friendly URLs

| Attribute | Description |
|-----------|-------------|
| **Priority** | P0 - Critical |
| **Phase** | Phase 1 |
| **Complexity** | Medium |
| **Dependencies** | Database migration |

**User Story**
> As a reader, I want readable URLs so that I can understand what a post is about before clicking.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| V2.1 | Posts accessible via `/post/:slug` |
| V2.2 | Slugs auto-generated from title on creation |
| V2.3 | Slugs are URL-safe (lowercase, hyphens, no special chars) |
| V2.4 | Duplicate slugs get numeric suffix (e.g., `my-post-2`) |
| V2.5 | Old UUID URLs redirect to slug URLs (301) |
| V2.6 | Slugs editable by author (with redirect from old) |

**Database Changes**
```sql
ALTER TABLE blog_posts ADD COLUMN slug TEXT UNIQUE;
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
```

**Technical Approach**
- Generate slug on post creation using `slugify` library
- Support both UUID and slug lookups during transition
- Implement 301 redirects for old URLs

**Acceptance Criteria**
- [ ] New posts get automatic slugs
- [ ] Existing posts migrated to slugs
- [ ] Old UUID URLs redirect properly
- [ ] No duplicate slugs possible

---

#### Feature V3: Newsletter/Email Signup

| Attribute | Description |
|-----------|-------------|
| **Priority** | P0 - Critical |
| **Phase** | Phase 2 |
| **Complexity** | Medium |
| **Dependencies** | Email service integration |

**User Story**
> As a reader, I want to subscribe to the newsletter so that I get notified of new posts.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| V3.1 | Email signup form in footer (all pages) |
| V3.2 | Email signup CTA at end of each post |
| V3.3 | Dedicated `/subscribe` page |
| V3.4 | Double opt-in confirmation flow |
| V3.5 | Welcome email on subscription |
| V3.6 | Unsubscribe link in all emails |
| V3.7 | Subscriber count visible to admin |

**Email Service Options**
| Service | Pros | Cons |
|---------|------|------|
| Resend | Simple API, good DX | Newer service |
| ConvertKit | Creator-focused | More expensive |
| Buttondown | Developer-friendly | Limited features |
| Mailchimp | Industry standard | Complex, expensive |

**Recommendation**: Resend + Supabase for subscriber storage

**UI Components**
- Inline form: email input + submit button
- Success state: "Check your email to confirm"
- Error state: "Something went wrong, please try again"

**Acceptance Criteria**
- [ ] Can subscribe from footer
- [ ] Can subscribe from post page
- [ ] Receives confirmation email
- [ ] Can unsubscribe easily

---

#### Feature V4: SEO Metadata

| Attribute | Description |
|-----------|-------------|
| **Priority** | P0 - Critical |
| **Phase** | Phase 2 |
| **Complexity** | Medium |
| **Dependencies** | Slug URLs (V2) |

**User Story**
> As a reader, I want posts to preview correctly when shared so that I know what I'm clicking on.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| V4.1 | Open Graph tags on all pages (og:title, og:description, og:image, og:url) |
| V4.2 | Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image) |
| V4.3 | Canonical URLs on all pages |
| V4.4 | Meta description from post excerpt |
| V4.5 | Default social image for posts without images |
| V4.6 | JSON-LD structured data for articles |

**Implementation**
- Use `react-helmet-async` for dynamic `<head>` management
- Generate OG images dynamically or use post featured image
- Include author info in structured data

**Meta Tags Example**
```html
<meta property="og:title" content="Building APIs with TypeScript" />
<meta property="og:description" content="Learn how to build type-safe APIs..." />
<meta property="og:image" content="https://kbw.notes/og/building-apis.png" />
<meta property="og:url" content="https://kbw.notes/post/building-apis" />
<meta name="twitter:card" content="summary_large_image" />
```

**Acceptance Criteria**
- [ ] Links preview correctly on Twitter
- [ ] Links preview correctly on LinkedIn
- [ ] Links preview correctly on Slack
- [ ] Structured data validates in Google's tool

---

#### Feature V5: Author Pages

| Attribute | Description |
|-----------|-------------|
| **Priority** | P0 - Critical |
| **Phase** | Phase 1 |
| **Complexity** | Low |
| **Dependencies** | Routing |

**User Story**
> As a reader, I want to view all posts by a specific author so that I can find more content I like.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| V5.1 | Author page at `/author/:username` or `/author/:id` |
| V5.2 | Display author name, avatar, bio, website |
| V5.3 | List all published posts by author |
| V5.4 | Show total post count and total likes received |
| V5.5 | Author name on posts links to author page |
| V5.6 | Social links if provided |

**UI Layout**
```
┌─────────────────────────────────────┐
│  [Avatar]  Author Name              │
│            Bio text here...         │
│            🔗 website.com           │
│            📝 12 posts · ❤️ 234 likes│
├─────────────────────────────────────┤
│  Posts by Author Name               │
│  ┌─────────────────────────────┐    │
│  │ Post Card                    │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Post Card                    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Acceptance Criteria**
- [ ] Can navigate to author page from post
- [ ] See all posts by author
- [ ] See author stats
- [ ] Page is SEO-friendly

---

#### Feature V6: Tag/Category Pages

| Attribute | Description |
|-----------|-------------|
| **Priority** | P0 - Critical |
| **Phase** | Phase 1 |
| **Complexity** | Low |
| **Dependencies** | Routing |

**User Story**
> As a reader, I want to browse posts by tag so that I can explore topics I'm interested in.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| V6.1 | Tag page at `/tag/:tagname` |
| V6.2 | List all posts with that tag |
| V6.3 | Tags on posts link to tag page |
| V6.4 | Tag cloud or list on sidebar/footer |
| V6.5 | Show post count per tag |
| V6.6 | Popular tags section on homepage |

**UI Layout**
```
┌─────────────────────────────────────┐
│  #typescript                        │
│  24 posts                           │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ Post Card                    │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Post Card                    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Acceptance Criteria**
- [ ] Can click tag to see all posts with that tag
- [ ] Tags show post count
- [ ] Tag pages are SEO-friendly

---

#### Feature V7: Post Creation UI

| Attribute | Description |
|-----------|-------------|
| **Priority** | P0 - Critical |
| **Phase** | Phase 3 |
| **Complexity** | High |
| **Dependencies** | Rich text editor |

**User Story**
> As an author, I want to write and publish posts through the UI so that I don't need database access.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| V7.1 | Post editor at `/submissions/new` |
| V7.2 | Fields: title, excerpt, body, tags, featured image |
| V7.3 | Markdown support in body editor |
| V7.4 | Live preview panel |
| V7.5 | Image upload and insertion |
| V7.6 | Tag autocomplete from existing tags |
| V7.7 | Save draft functionality |
| V7.8 | Publish button with confirmation |
| V7.9 | Edit existing posts |

**Editor Options**
| Editor | Pros | Cons |
|--------|------|------|
| TipTap | Extensible, modern | Learning curve |
| Slate | Flexible | Complex setup |
| MDXEditor | MDX support | Newer |
| Lexical | Facebook-backed | Complex |

**Recommendation**: TipTap with markdown extension

**UI Layout**
```
┌─────────────────────────────────────────────────────┐
│  New Post                        [Save Draft] [Publish]│
├─────────────────────────────────────────────────────┤
│  Title: [________________________]                   │
│  Excerpt: [______________________]                   │
│  Tags: [react] [typescript] [+]                     │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐            │
│  │ Editor          │ │ Preview          │            │
│  │                 │ │                  │            │
│  │ # Heading       │ │ Heading          │            │
│  │ Some **bold**   │ │ Some bold text   │            │
│  │                 │ │                  │            │
│  └─────────────────┘ └─────────────────┘            │
└─────────────────────────────────────────────────────┘
```

**Acceptance Criteria**
- [ ] Can write post with markdown
- [ ] Can preview rendered output
- [ ] Can upload images
- [ ] Can save drafts
- [ ] Can publish post

---

#### Feature V8: 404/Error Pages

| Attribute | Description |
|-----------|-------------|
| **Priority** | P0 - Critical |
| **Phase** | Phase 1 |
| **Complexity** | Low |
| **Dependencies** | None |

**User Story**
> As a reader, I want a helpful error page so that I can find my way when something goes wrong.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| V8.1 | Custom 404 page for not found routes |
| V8.2 | Error boundary for React errors |
| V8.3 | Friendly error messages |
| V8.4 | Link to homepage |
| V8.5 | Search suggestion |
| V8.6 | Popular posts links |

**UI Layout**
```
┌─────────────────────────────────────┐
│           (╯°□°)╯︵ ┻━┻             │
│                                     │
│     Page Not Found                  │
│                                     │
│  The page you're looking for        │
│  doesn't exist or has been moved.   │
│                                     │
│  [Search posts] [Go to homepage]    │
│                                     │
│  Popular posts:                     │
│  • Building APIs with TypeScript    │
│  • React Performance Tips           │
└─────────────────────────────────────┘
```

**Acceptance Criteria**
- [ ] 404 page shows for invalid URLs
- [ ] Can navigate home from error page
- [ ] Can search from error page

---

#### Feature V9: Sitemap

| Attribute | Description |
|-----------|-------------|
| **Priority** | P0 - Critical |
| **Phase** | Phase 1 |
| **Complexity** | Low |
| **Dependencies** | Slug URLs (V2) |

**User Story**
> As a search engine, I want a sitemap so that I can index all pages efficiently.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| V9.1 | XML sitemap at `/sitemap.xml` |
| V9.2 | Include all published posts |
| V9.3 | Include author pages |
| V9.4 | Include tag pages |
| V9.5 | Include static pages (home, about) |
| V9.6 | Auto-regenerate on new content |
| V9.7 | robots.txt references sitemap |

**Technical Approach**
- Generate sitemap on build (static) or on-demand (dynamic)
- For dynamic: Supabase Edge Function or API route
- Include lastmod dates for posts

**Sitemap Format**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://kbw.notes/</loc>
    <lastmod>2025-01-24</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://kbw.notes/post/building-apis</loc>
    <lastmod>2025-01-20</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Acceptance Criteria**
- [ ] Sitemap accessible at /sitemap.xml
- [ ] All published posts included
- [ ] Valid XML format
- [ ] robots.txt points to sitemap

---

### 5.2 IMPORTANT FEATURES

---

#### Feature I1: Reading Progress Bar

| Attribute | Description |
|-----------|-------------|
| **Priority** | P1 - High |
| **Phase** | Phase 4 |
| **Complexity** | Low |
| **Dependencies** | None |

**User Story**
> As a reader, I want to see my reading progress so that I know how much is left.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| I1.1 | Progress bar at top of viewport on post pages |
| I1.2 | Shows percentage through article content |
| I1.3 | Smoothly animates on scroll |
| I1.4 | Respects `prefers-reduced-motion` |
| I1.5 | Only visible on post detail pages |

**Technical Approach**
```typescript
// Calculate progress based on scroll position relative to article
const progress = (scrollY - articleStart) / (articleEnd - articleStart)
```

**Acceptance Criteria**
- [ ] Progress bar shows on post pages
- [ ] Accurately reflects reading position
- [ ] Smooth animation
- [ ] Respects motion preferences

---

#### Feature I2: Code Syntax Highlighting

| Attribute | Description |
|-----------|-------------|
| **Priority** | P1 - High |
| **Phase** | Phase 4 |
| **Complexity** | Low |
| **Dependencies** | Markdown parser |

**User Story**
> As a reader, I want code blocks to be syntax highlighted so that I can read code easily.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| I2.1 | Syntax highlighting for common languages |
| I2.2 | Languages: JS, TS, Python, Bash, JSON, SQL, HTML, CSS, Go, Rust |
| I2.3 | Theme matches light/dark mode |
| I2.4 | Line numbers (optional) |
| I2.5 | Language label on code blocks |

**Library Options**
| Library | Bundle Size | Languages | Themes |
|---------|-------------|-----------|--------|
| Prism.js | ~2KB core | 200+ | Many |
| highlight.js | ~30KB | 190+ | Many |
| Shiki | ~1MB | All | VS Code themes |

**Recommendation**: Prism.js for bundle size, or Shiki for accuracy

**Acceptance Criteria**
- [ ] Code blocks are highlighted
- [ ] Theme matches dark/light mode
- [ ] Common languages supported

---

#### Feature I3: Related Posts

| Attribute | Description |
|-----------|-------------|
| **Priority** | P1 - High |
| **Phase** | Phase 2 |
| **Complexity** | Medium |
| **Dependencies** | Tags |

**User Story**
> As a reader, I want to see related posts so that I can discover more relevant content.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| I3.1 | Show 2-3 related posts at end of article |
| I3.2 | Match by shared tags |
| I3.3 | Fallback to same author's posts |
| I3.4 | Fallback to popular posts |
| I3.5 | Exclude current post from recommendations |

**Algorithm**
1. Find posts with most shared tags
2. If < 3 results, add posts by same author
3. If still < 3, add most popular posts
4. Exclude current post

**Acceptance Criteria**
- [ ] Related posts shown at end of article
- [ ] Related by tag/topic
- [ ] Never shows current post

---

#### Feature I4: Post Archives

| Attribute | Description |
|-----------|-------------|
| **Priority** | P1 - High |
| **Phase** | Phase 2 |
| **Complexity** | Low |
| **Dependencies** | Date queries |

**User Story**
> As a reader, I want to browse posts by date so that I can find older content.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| I4.1 | Archive page at `/archive` |
| I4.2 | Group posts by year and month |
| I4.3 | Optional: filter by year `/archive/2024` |
| I4.4 | Optional: filter by month `/archive/2024/01` |
| I4.5 | Show post count per period |

**UI Layout**
```
┌─────────────────────────────────────┐
│  Archive                            │
├─────────────────────────────────────┤
│  2025                               │
│  ├── January (5 posts)              │
│  │   • Post title one               │
│  │   • Post title two               │
│  └── February (3 posts)             │
│      • Post title three             │
├─────────────────────────────────────┤
│  2024                               │
│  ├── December (4 posts)             │
│  └── November (6 posts)             │
└─────────────────────────────────────┘
```

**Acceptance Criteria**
- [ ] Can view all posts grouped by date
- [ ] Can filter by year/month
- [ ] Post counts shown

---

#### Feature I5: Edit Own Comments

| Attribute | Description |
|-----------|-------------|
| **Priority** | P1 - High |
| **Phase** | Phase 5 |
| **Complexity** | Low |
| **Dependencies** | None |

**User Story**
> As a commenter, I want to edit my comments so that I can fix typos.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| I5.1 | Edit button on own comments |
| I5.2 | Edit window: 30 minutes after posting |
| I5.3 | "Edited" indicator with timestamp |
| I5.4 | Re-run AI moderation on edit |
| I5.5 | Cancel edit option |

**Database Changes**
```sql
ALTER TABLE comments ADD COLUMN edited_at TIMESTAMP;
```

**Acceptance Criteria**
- [ ] Can edit own comments within 30 min
- [ ] Shows "edited" indicator
- [ ] Edits are moderated

---

#### Feature I6: Comment Sorting

| Attribute | Description |
|-----------|-------------|
| **Priority** | P1 - High |
| **Phase** | Phase 5 |
| **Complexity** | Low |
| **Dependencies** | None |

**User Story**
> As a reader, I want to sort comments so that I can see the most relevant ones first.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| I6.1 | Sort options: Newest, Oldest, Most Liked |
| I6.2 | Dropdown selector above comments |
| I6.3 | Persist preference in settings |
| I6.4 | Default: Newest first |

**Acceptance Criteria**
- [ ] Can sort by newest/oldest/popular
- [ ] Preference persisted
- [ ] Sorting is instant (client-side)

---

#### Feature I7: Image Optimization

| Attribute | Description |
|-----------|-------------|
| **Priority** | P1 - High |
| **Phase** | Phase 4 |
| **Complexity** | Medium |
| **Dependencies** | Build configuration |

**User Story**
> As a reader, I want images to load fast so that I have a good experience.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| I7.1 | Lazy loading for all images |
| I7.2 | Responsive images with srcset |
| I7.3 | WebP format with fallbacks |
| I7.4 | Blur placeholder while loading |
| I7.5 | Proper width/height to prevent CLS |

**Technical Approach**
- Use `loading="lazy"` attribute
- Generate multiple sizes on upload
- Consider Cloudinary or imgix for transformations

**Acceptance Criteria**
- [ ] Images lazy load below fold
- [ ] Correct size served for viewport
- [ ] No layout shift on load

---

#### Feature I8: Anchor Links in Headings

| Attribute | Description |
|-----------|-------------|
| **Priority** | P1 - High |
| **Phase** | Phase 4 |
| **Complexity** | Low |
| **Dependencies** | Markdown parser |

**User Story**
> As a reader, I want to link to specific sections so that I can share exact parts of articles.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| I8.1 | Generate IDs for all headings (h2, h3, h4) |
| I8.2 | Show link icon on hover |
| I8.3 | Click to copy anchor link |
| I8.4 | Scroll to heading if URL has hash |
| I8.5 | Slugified heading text as ID |

**UI Behavior**
```
## My Heading [🔗]  ← link icon appears on hover
```

**Acceptance Criteria**
- [ ] Headings have anchor links
- [ ] Can copy link to section
- [ ] URL hash scrolls to section

---

#### Feature I9: Copy Code Button

| Attribute | Description |
|-----------|-------------|
| **Priority** | P1 - High |
| **Phase** | Phase 4 |
| **Complexity** | Low |
| **Dependencies** | Code highlighting (I2) |

**User Story**
> As a reader, I want to copy code with one click so that I can use it easily.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| I9.1 | Copy button in top-right of code blocks |
| I9.2 | Click copies code to clipboard |
| I9.3 | "Copied!" feedback on success |
| I9.4 | Button visible on hover (desktop) or always (mobile) |
| I9.5 | Keyboard accessible |

**UI Behavior**
```
┌────────────────────────────────┐
│ const hello = "world"    [📋] │
└────────────────────────────────┘
         Click → "Copied! ✓"
```

**Acceptance Criteria**
- [ ] Can copy code with one click
- [ ] Shows success feedback
- [ ] Works on mobile

---

### 5.3 NICE TO HAVE FEATURES

---

#### Feature N1: Follow Authors

| Attribute | Description |
|-----------|-------------|
| **Priority** | P2 - Medium |
| **Phase** | Phase 5 |
| **Complexity** | Medium |
| **Dependencies** | Database schema, notifications |

**User Story**
> As a reader, I want to follow authors so that I get notified when they post.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| N1.1 | Follow button on author pages and post headers |
| N1.2 | Following count on author profile |
| N1.3 | "Following" page in user profile |
| N1.4 | Notification when followed author posts |
| N1.5 | Unfollow option |

**Database Changes**
```sql
CREATE TABLE author_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES auth.users(id),
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, author_id)
);
```

**Acceptance Criteria**
- [ ] Can follow/unfollow authors
- [ ] See list of followed authors
- [ ] Get notifications on new posts

---

#### Feature N2: Post Series

| Attribute | Description |
|-----------|-------------|
| **Priority** | P2 - Medium |
| **Phase** | Phase 3 |
| **Complexity** | Medium |
| **Dependencies** | Database schema |

**User Story**
> As an author, I want to group posts into a series so that readers can follow along.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| N2.1 | Create series with name and description |
| N2.2 | Add posts to series with order |
| N2.3 | Series navigation on post pages |
| N2.4 | Series landing page with all posts |
| N2.5 | "Next in series" CTA |
| N2.6 | Progress indicator |

**Database Changes**
```sql
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE blog_posts ADD COLUMN series_id UUID REFERENCES series(id);
ALTER TABLE blog_posts ADD COLUMN series_order INTEGER;
```

**UI Layout**
```
┌─────────────────────────────────────┐
│ 📚 Part 2 of "React Fundamentals"  │
│ [← Part 1] [Part 3 →]              │
└─────────────────────────────────────┘
```

**Acceptance Criteria**
- [ ] Can create series
- [ ] Can add posts to series
- [ ] Navigation between series posts

---

#### Feature N3: Reading List

| Attribute | Description |
|-----------|-------------|
| **Priority** | P2 - Medium |
| **Phase** | Phase 5 |
| **Complexity** | Low |
| **Dependencies** | Similar to bookmarks |

**User Story**
> As a reader, I want a reading list so that I can queue posts to read later.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| N3.1 | "Add to reading list" button |
| N3.2 | Reading list page at `/reading-list` |
| N3.3 | Mark as read |
| N3.4 | Remove from list |
| N3.5 | Total estimated read time |
| N3.6 | Drag to reorder (optional) |

**Distinction from Bookmarks**
- Bookmarks = permanent saves for reference
- Reading List = queue of posts to read, temporary

**Acceptance Criteria**
- [ ] Can add posts to reading list
- [ ] Can mark as read
- [ ] See total read time

---

#### Feature N4: Post Drafts

| Attribute | Description |
|-----------|-------------|
| **Priority** | P2 - Medium |
| **Phase** | Phase 3 |
| **Complexity** | Medium |
| **Dependencies** | Post Creation UI (V7) |

**User Story**
> As an author, I want to save drafts so that I can continue writing later.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| N4.1 | Auto-save every 30 seconds |
| N4.2 | Manual save button |
| N4.3 | Drafts list in dashboard |
| N4.4 | Resume editing from draft |
| N4.5 | Delete draft option |
| N4.6 | Last saved timestamp |

**Database Changes**
```sql
ALTER TABLE blog_posts ADD COLUMN status TEXT DEFAULT 'draft';
-- status: 'draft', 'published', 'scheduled'
```

**Acceptance Criteria**
- [ ] Posts auto-save as drafts
- [ ] Can see list of drafts
- [ ] Can resume editing

---

#### Feature N5: Post Scheduling

| Attribute | Description |
|-----------|-------------|
| **Priority** | P2 - Medium |
| **Phase** | Phase 3 |
| **Complexity** | Medium |
| **Dependencies** | Post Creation UI (V7), Drafts (N4) |

**User Story**
> As an author, I want to schedule posts so that they publish at a specific time.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| N5.1 | Schedule option in publish flow |
| N5.2 | Date/time picker |
| N5.3 | Timezone handling |
| N5.4 | Scheduled posts list |
| N5.5 | Edit/cancel scheduled post |
| N5.6 | Auto-publish at scheduled time |

**Technical Approach**
- Store `published_at` as future timestamp
- Supabase scheduled function or cron to publish
- Status: `scheduled` until publish time

**Acceptance Criteria**
- [ ] Can schedule post for future
- [ ] Post publishes automatically
- [ ] Can cancel scheduled post

---

#### Feature N6: Analytics Dashboard

| Attribute | Description |
|-----------|-------------|
| **Priority** | P2 - Medium |
| **Phase** | Phase 6 |
| **Complexity** | High |
| **Dependencies** | Data collection infrastructure |

**User Story**
> As an author, I want to see analytics so that I know how my content performs.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| N6.1 | Dashboard at `/dashboard` |
| N6.2 | Metrics: views, unique visitors, read time |
| N6.3 | Engagement: likes, comments, shares, bookmarks |
| N6.4 | Per-post breakdown |
| N6.5 | Time range filters (7d, 30d, 90d, all) |
| N6.6 | Top posts list |
| N6.7 | Referrer sources |

**Data Collection**
- Track page views (anonymized)
- Track scroll depth
- Track engagement events
- Store in Supabase or analytics service

**Acceptance Criteria**
- [ ] Can see post performance
- [ ] Can filter by time range
- [ ] Privacy-respecting metrics

---

#### Feature N7: Comment Mentions

| Attribute | Description |
|-----------|-------------|
| **Priority** | P2 - Medium |
| **Phase** | Phase 5 |
| **Complexity** | Medium |
| **Dependencies** | Notifications |

**User Story**
> As a commenter, I want to mention others so that they get notified.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| N7.1 | Type `@` to trigger autocomplete |
| N7.2 | Search users by display name |
| N7.3 | Insert mention as link |
| N7.4 | Notify mentioned user |
| N7.5 | Highlight mentions in comment display |

**Technical Approach**
- Parse `@username` in comment content
- Store mentions in database for notifications
- Render as links to profile

**Acceptance Criteria**
- [ ] Can mention users with @
- [ ] Autocomplete shows users
- [ ] Mentioned users notified

---

#### Feature N8: Multiple Reaction Types

| Attribute | Description |
|-----------|-------------|
| **Priority** | P2 - Medium |
| **Phase** | Phase 5 |
| **Complexity** | Medium |
| **Dependencies** | Database schema |

**User Story**
> As a reader, I want different reaction types so that I can express more than just "like".

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| N8.1 | Reaction types: ❤️ Like, 🔥 Fire, 🦄 Unicorn, 🙌 Raised Hands, 📚 Bookworm |
| N8.2 | Reaction picker on posts |
| N8.3 | Aggregated counts per reaction |
| N8.4 | One reaction per user per post |
| N8.5 | Can change reaction |

**Database Changes**
```sql
ALTER TABLE post_likes ADD COLUMN reaction_type TEXT DEFAULT 'like';
```

**UI Layout**
```
[❤️ 12] [🔥 8] [🦄 3] [🙌 5] [📚 2]  [+ Add reaction]
```

**Acceptance Criteria**
- [ ] Can add different reactions
- [ ] See reaction counts
- [ ] Can change own reaction

---

#### Feature N9: Image Lightbox

| Attribute | Description |
|-----------|-------------|
| **Priority** | P2 - Medium |
| **Phase** | Phase 4 |
| **Complexity** | Low |
| **Dependencies** | None |

**User Story**
> As a reader, I want to enlarge images so that I can see details.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| N9.1 | Click image to open lightbox |
| N9.2 | Zoom and pan support |
| N9.3 | Keyboard navigation (Escape to close) |
| N9.4 | Dark overlay background |
| N9.5 | Focus trap for accessibility |

**Library Options**
- lightGallery
- PhotoSwipe
- Custom implementation

**Acceptance Criteria**
- [ ] Can click to enlarge images
- [ ] Can close with Escape
- [ ] Accessible

---

#### Feature N10: PWA/Offline Reading

| Attribute | Description |
|-----------|-------------|
| **Priority** | P2 - Medium |
| **Phase** | Phase 6 |
| **Complexity** | Medium |
| **Dependencies** | Service worker |

**User Story**
> As a reader, I want to read saved posts offline so that I can read anywhere.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| N10.1 | PWA manifest for installability |
| N10.2 | Service worker for offline caching |
| N10.3 | Cache bookmarked/saved posts |
| N10.4 | Offline indicator |
| N10.5 | Sync when back online |

**Technical Approach**
- Workbox for service worker
- Cache-first for static assets
- Network-first for content with offline fallback

**Acceptance Criteria**
- [ ] Can install as app
- [ ] Can read cached posts offline
- [ ] Shows offline indicator

---

#### Feature N11: Post Versions/History

| Attribute | Description |
|-----------|-------------|
| **Priority** | P2 - Medium |
| **Phase** | Phase 6 |
| **Complexity** | Medium |
| **Dependencies** | Database schema |

**User Story**
> As a reader, I want to see edit history so that I can track changes to posts.

**Functional Requirements**
| ID | Requirement |
|----|-------------|
| N11.1 | Save version on each publish/edit |
| N11.2 | Version history page |
| N11.3 | Diff viewer between versions |
| N11.4 | Timestamp and change summary |
| N11.5 | Restore previous version (author only) |

**Database Changes**
```sql
CREATE TABLE post_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Acceptance Criteria**
- [ ] Versions saved on edit
- [ ] Can view version history
- [ ] Can see diff between versions

---

## 6. Technical Architecture

### 6.1 Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│  React 19 + TypeScript + Vite + Tailwind CSS v4        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     Supabase                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │ PostgreSQL  │ │    Auth     │ │ Edge Functions  │   │
│  │  Database   │ │   (OAuth)   │ │ (Moderation)    │   │
│  └─────────────┘ └─────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Claude API                           │
│              (Comment Moderation)                       │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Database Schema (Current + Proposed)

```sql
-- EXISTING TABLES
profiles (id, display_name, avatar_url, bio, website, profile_complete, created_at, updated_at)
blog_posts (id, title, excerpt, body, author_id, published_at, tags, created_at, updated_at)
comments (id, post_id, user_id, content, parent_id, is_moderated, created_at, updated_at)
post_likes (id, post_id, user_id, created_at)
post_bookmarks (id, post_id, user_id, created_at)

-- PROPOSED ADDITIONS (Phase 1-3)
ALTER TABLE blog_posts ADD COLUMN slug TEXT UNIQUE;
ALTER TABLE blog_posts ADD COLUMN status TEXT DEFAULT 'published'; -- draft, published, scheduled
ALTER TABLE blog_posts ADD COLUMN scheduled_at TIMESTAMP;
ALTER TABLE comments ADD COLUMN edited_at TIMESTAMP;
ALTER TABLE post_likes ADD COLUMN reaction_type TEXT DEFAULT 'like';

-- NEW TABLES (Phase 3-6)
series (id, author_id, title, description, created_at)
author_follows (id, follower_id, author_id, created_at)
reading_list (id, user_id, post_id, is_read, created_at)
post_versions (id, post_id, title, body, version_number, created_at)
newsletter_subscribers (id, email, confirmed, created_at)
page_views (id, post_id, visitor_id, created_at) -- anonymized
```

### 6.3 New Dependencies (Proposed)

| Feature | Package | Purpose |
|---------|---------|---------|
| SEO | react-helmet-async | Dynamic meta tags |
| Editor | @tiptap/react | Rich text editing |
| Syntax | prism-react-renderer | Code highlighting |
| Email | resend | Newsletter delivery |
| PWA | vite-plugin-pwa | Service worker |
| Search | (built-in) | Supabase full-text search |

---

## 7. Implementation Phases

### Phase 1: Foundation & Discovery
**Duration**: 2-3 weeks
**Goal**: Make content findable

| Feature | ID | Effort |
|---------|-----|--------|
| Search | V1 | 3 days |
| SEO-friendly URLs | V2 | 2 days |
| Tag Pages | V6 | 1 day |
| Author Pages | V5 | 1 day |
| 404/Error Pages | V8 | 1 day |
| Sitemap | V9 | 1 day |

**Deliverables**
- [ ] Users can search for posts
- [ ] Posts have readable URLs
- [ ] Can browse by tag and author
- [ ] Graceful error handling
- [ ] Search engines can index site

---

### Phase 2: SEO & Distribution
**Duration**: 2 weeks
**Goal**: Grow audience

| Feature | ID | Effort |
|---------|-----|--------|
| SEO Metadata | V4 | 2 days |
| Newsletter Signup | V3 | 3 days |
| Related Posts | I3 | 2 days |
| Post Archives | I4 | 1 day |

**Deliverables**
- [ ] Posts preview correctly on social media
- [ ] Users can subscribe to newsletter
- [ ] Related content shown on posts
- [ ] Archive page for browsing

---

### Phase 3: Content Creation
**Duration**: 3-4 weeks
**Goal**: Enable contributors

| Feature | ID | Effort |
|---------|-----|--------|
| Post Creation UI | V7 | 5 days |
| Post Drafts | N4 | 2 days |
| Post Scheduling | N5 | 2 days |
| Post Series | N2 | 3 days |

**Deliverables**
- [ ] Authors can create posts in UI
- [ ] Drafts auto-save
- [ ] Can schedule posts
- [ ] Can create post series

---

### Phase 4: Reading Experience
**Duration**: 1-2 weeks
**Goal**: Polish UX

| Feature | ID | Effort |
|---------|-----|--------|
| Code Syntax Highlighting | I2 | 1 day |
| Reading Progress Bar | I1 | 0.5 days |
| Anchor Links | I8 | 0.5 days |
| Copy Code Button | I9 | 0.5 days |
| Image Optimization | I7 | 2 days |
| Image Lightbox | N9 | 1 day |

**Deliverables**
- [ ] Code is beautifully highlighted
- [ ] Progress indicator while reading
- [ ] Can link to specific sections
- [ ] Can copy code easily
- [ ] Images load fast
- [ ] Can zoom images

---

### Phase 5: Community & Engagement
**Duration**: 2-3 weeks
**Goal**: Build community

| Feature | ID | Effort |
|---------|-----|--------|
| Edit Own Comments | I5 | 1 day |
| Comment Sorting | I6 | 1 day |
| Follow Authors | N1 | 3 days |
| Comment Mentions | N7 | 2 days |
| Multiple Reactions | N8 | 2 days |
| Reading List | N3 | 1 day |

**Deliverables**
- [ ] Can edit comments
- [ ] Can sort comments
- [ ] Can follow authors
- [ ] Can mention users
- [ ] Multiple reaction types
- [ ] Reading list feature

---

### Phase 6: Advanced Features
**Duration**: 3-4 weeks
**Goal**: Power user features

| Feature | ID | Effort |
|---------|-----|--------|
| Analytics Dashboard | N6 | 5 days |
| Post Versions | N11 | 3 days |
| PWA/Offline | N10 | 3 days |

**Deliverables**
- [ ] Authors can see analytics
- [ ] Post edit history visible
- [ ] App works offline

---

## 8. Success Metrics

### 8.1 Key Performance Indicators (KPIs)

| Metric | Current | Phase 2 Target | Phase 6 Target |
|--------|---------|----------------|----------------|
| Monthly Visitors | - | 1,000 | 10,000 |
| Newsletter Subscribers | 0 | 100 | 1,000 |
| Avg. Session Duration | - | 2 min | 4 min |
| Pages per Session | - | 1.5 | 3 |
| Comment Rate | - | 5% | 10% |
| Return Visitor Rate | - | 20% | 40% |

### 8.2 Feature-Specific Metrics

| Feature | Success Metric |
|---------|----------------|
| Search | 10% of sessions use search |
| Newsletter | 5% visitor-to-subscriber rate |
| Related Posts | 15% click-through rate |
| Follow Authors | 20% of registered users follow someone |
| Reading List | 10% of users add posts to list |

### 8.3 Technical Metrics

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 90 |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Core Web Vitals | All green |
| Search Indexing | 100% of posts indexed |

---

## 9. Risks & Mitigations

### 9.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Search performance at scale | High | Medium | Start with Supabase, plan migration to Algolia |
| Email deliverability | Medium | Medium | Use established provider (Resend), warm up domain |
| Editor complexity | Medium | High | Start simple, iterate based on feedback |
| PWA caching issues | Low | Medium | Thorough testing, cache versioning |

### 9.2 Product Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Feature creep | High | High | Strict prioritization, MVP approach |
| Low adoption of new features | Medium | Medium | Analytics, user feedback, iteration |
| AI moderation errors | Medium | Low | Human review option, appeals process |

### 9.3 Resource Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Scope exceeds capacity | High | Medium | Phase approach, cut nice-to-haves first |
| External service costs | Medium | Low | Budget monitoring, usage alerts |

---

## 10. Appendix

### 10.1 Glossary

| Term | Definition |
|------|------------|
| **Slug** | URL-friendly version of title (e.g., "my-post-title") |
| **OG Tags** | Open Graph meta tags for social sharing |
| **PWA** | Progressive Web App - installable, offline-capable |
| **CLS** | Cumulative Layout Shift - Core Web Vital metric |
| **Lightbox** | Overlay for viewing enlarged images |

### 10.2 Related Documents

- [ROADMAP.md](./ROADMAP.md) - Feature roadmap summary
- [TODO.md](./TODO.md) - Current task tracking
- [CLAUDE.md](./CLAUDE.md) - Development guidelines

### 10.3 References

- [WPBeginner - Best Blogging Platforms](https://www.wpbeginner.com/beginners-guide/how-to-choose-the-best-blogging-platform/)
- [Gravatar Blog - Future of Blog UX](https://blog.gravatar.com/2024/12/23/blog-ux-best-practices/)
- [Dev.to vs Hashnode vs Medium](https://dev.to/shahednasser/dev-vs-hashnode-vs-medium-where-should-you-start-your-tech-blog-91i)
- [Tiny - 16 Blog Features](https://www.tiny.cloud/blog/best-blog-features/)

### 10.4 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | kbw | Initial PRD |
| 2.0 | Jan 2025 | kbw | Added 29 features across 6 phases |

---

*End of Document*
