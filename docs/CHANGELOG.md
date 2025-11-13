# Changelog

All notable changes to Taktak will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Email Service**: Automated license key delivery via email for Desktop and Cloud Sync purchases
  - Professional HTML email templates with download links
  - Separate templates for Desktop license and Cloud Sync subscription
  - SMTP configuration with nodemailer
  - Error handling and retry logic for failed email deliveries

- **Download Page**: Post-purchase download page at `/download`
  - Platform detection (Windows, macOS, Linux)
  - License key display with copy-to-clipboard functionality
  - Download buttons for all platforms
  - Step-by-step installation and activation instructions
  - Links to GitHub releases and support

- **Dashboard Statistics**: Real-time dashboard metrics
  - Active workflows count
  - Successful execution runs count
  - Failed execution runs count
  - Pending/running execution count
  - Auto-refresh on page load

### Changed
- **LemonSqueezy Integration**: Updated checkout flow
  - Desktop purchases now redirect to `/download` page instead of dashboard
  - Receipt button text changed to "Download Now" for Desktop purchases
  - Receipt thank you note updated to mention email delivery
  - License keys automatically sent via email after successful purchase

- **Desktop Landing Page**: Updated download buttons
  - Changed from direct download links to pricing page redirect
  - Button text updated to show price: "Get Taktak Desktop - $29"
  - Added subtitle: "One-time payment • Lifetime license • Free updates"
  - Implemented paid-first model (purchase → license → download)

### Fixed
- **Dashboard Statistics Bug**: Fixed hardcoded zero values
  - Dashboard now fetches real data from API
  - Displays actual workflow and execution counts
  - Shows loading state while fetching data
  - Error handling with toast notifications

- **Logo Display Issue**: Fixed broken logo images
  - Configured Vite `publicDir` to serve from root public folder
  - Logo now properly accessible at `/logo.png` path

### Technical Details

#### Email Service (`apps/server/src/services/emailService.ts`)
- Uses nodemailer with SMTP configuration
- Supports both Desktop and Cloud Sync license emails
- HTML email templates with responsive design
- Automatic platform-specific download links
- Error logging and graceful failure handling

#### Dashboard Component (`apps/client/src/pages/Dashboard.tsx`)
- Fetches workflows via `api.workflows.list()`
- Fetches executions via `api.executions.list()`
- Filters by status: active, success, error, running
- Updates state with real-time counts
- Loading indicators during data fetch

#### Download Page (`apps/client/src/pages/Download.tsx`)
- Platform detection using `navigator.userAgent`
- License key from URL params or email prompt
- Download links to GitHub releases
- Installation instructions per platform
- Support links and FAQ section

---

## Previous Releases

### Phase 1-6 (Completed)
- Clean & Standardize codebase
- Local LLM Integration (Phi-3)
- Vertical Templates (18 workflows)
- OpenRouter Integration (4-tier AI fallback)
- Electron Desktop App
- License Key System
- LemonSqueezy Payment Integration
- Auto-Updater with GitHub releases
- Windows/Mac/Linux Installers
- VPS Deployment Configuration

---

## Deployment Status

**Current Version**: 1.0.0-beta  
**Production Ready**: 95%  
**Remaining Tasks**:
- Record demo video
- Create first GitHub release
- Configure SSL certificates for VPS

---

## Documentation

- [VPS Deployment Guide](./VPS_DEPLOYMENT.md)
- [Video Recording Guide](./VIDEO_RECORDING_GUIDE.md)
- [LemonSqueezy Setup](./LEMONSQUEEZY_SETUP.md)
- [Building Installers](./BUILDING_INSTALLERS.md)
- [Testing Results](./TESTING_RESULTS.md)

