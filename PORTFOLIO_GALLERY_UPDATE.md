# Portfolio Gallery Feature Update

## Overview
Updated the portfolio system from single-image uploads to Project Galleries supporting multiple images and videos per project.

## Backend API Changes
The backend now supports the following structure for portfolio projects:

### Upload Endpoint
- **URL**: `POST /api/artisans/portfolio`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `files` - Array of image/video files (max 10, 100MB total)
  - `title` - Project title (string)
  - `description` - Project description (string)
  - `price` - Price in dollars (number, optional)
  - `isForSale` - Boolean flag (default: true)

### Delete Endpoint
- **URL**: `DELETE /api/artisans/portfolio/:projectId`
- **Auth**: Bearer token required

### Project Structure
```javascript
{
  _id: "project_id",
  title: "Project Title",
  description: "Project description",
  price: 100,
  isForSale: true,
  coverImage: "/uploads/first-image.jpg", // Auto-set to first uploaded image
  media: [
    { url: "/uploads/image1.jpg", type: "image" },
    { url: "/uploads/video1.mp4", type: "video" },
    { url: "/uploads/image2.jpg", type: "image" }
  ]
}
```

## Frontend Changes

### 1. ArtisanProfilePage.jsx (Artisan's Own Profile)

#### Updated States (Lines 41-50)
- Changed from single file to multiple files:
  - `portfolioFile` → `portfolioFiles` (array)
  - `portfolioPreview` → `portfolioPreviews` (array of objects with url, type, name)
- Added new states:
  - `portfolioTitle` - Project title
  - `portfolioIsForSale` - Sale availability flag

#### Updated Upload Handler (Lines 220-227)
- Supports multiple file selection (max 10)
- Validates file count
- Creates previews for all files (images and videos)
- Stores files in array format

#### Updated Upload Function (Lines 229-255)
- Validates title, description, and files
- Builds FormData with new structure:
  - `title`, `description`, `price`, `isForSale`
  - Multiple `files` using `formData.append('files', file)` for each file
- Calls updated service with FormData directly

#### Updated Delete Handler (Lines 257-265)
- Now uses project ID instead of image URL
- Passes `projectId` to service

#### Updated Portfolio Display (Lines 665-736)
- Shows project title prominently
- Displays `coverImage` as thumbnail
- Shows "For Sale" badge if `isForSale` is true
- Shows media count badge (e.g., "🖼️ 5") if project has multiple files
- Uses `project._id` for deletion

#### Updated Upload Modal (Lines 1015-1150)
- Added project title input field
- Changed file input to accept multiple files: `<input type="file" multiple accept="image/*,video/*" />`
- Added preview grid showing all selected files
- Added "Available for Sale" checkbox
- Shows "Max 10 files, 100MB total" hint

### 2. ArtisanDetailsPage.jsx (Customer View)

#### Updated Portfolio Display (Lines 454-575)
- Backward compatible with old format (just URL strings)
- Shows project title, cover image, badges
- Displays "For Sale" badge if `isForSale` is true
- Shows media count badge if multiple files
- Order button always visible

### 3. craftsmanService.js

#### Updated uploadPortfolioImage (Lines 220-250)
- Now accepts `formData` directly instead of individual parameters
- Changed endpoint from `/artisans/upload-portfolio` to `/artisans/portfolio`
- No longer builds FormData internally (done in component)

#### Updated deletePortfolioImage (Lines 270-302)
- Now uses `projectId` instead of `imageUrl`
- Changed endpoint from `/artisans/delete-portfolio` to `/artisans/portfolio/:projectId`
- No longer sends body data (projectId in URL)

### 4. CraftsmanProfile.css

#### New Styles Added (Lines 500-545)
- `.for-sale-badge` - Green badge for items available for sale
- `.media-count-badge` - Dark badge showing number of media items
- `.portfolio-title` - Styling for project title (18px, bold)

## Features

### For Artisans:
1. ✅ Upload multiple images/videos per project (max 10, 100MB)
2. ✅ Set project title and description
3. ✅ Mark projects as "For Sale" or "Not For Sale"
4. ✅ Set prices for projects
5. ✅ Preview all files before upload (images and videos)
6. ✅ See media count on portfolio cards
7. ✅ Delete entire projects with all media

### For Customers:
1. ✅ View project titles
2. ✅ See "For Sale" badge on available items
3. ✅ See media count badge (e.g., "5 items")
4. ✅ Order any project
5. ✅ View project descriptions and prices

## Backward Compatibility
The frontend code handles both:
- **Old format**: Simple string URLs or objects with `imageUrl`
- **New format**: Project objects with `coverImage`, `media[]`, `title`, etc.

This ensures the app won't break if backend still has old portfolio data.

## Testing Checklist

### Upload Flow:
- [ ] Select multiple images (up to 10)
- [ ] Select mix of images and videos
- [ ] Add title, description, price
- [ ] Toggle "Available for Sale" checkbox
- [ ] Verify preview shows all selected files
- [ ] Submit and verify upload succeeds

### Display:
- [ ] Verify project title displays
- [ ] Verify "For Sale" badge appears when isForSale=true
- [ ] Verify media count badge appears when media.length > 1
- [ ] Verify cover image displays correctly

### Deletion:
- [ ] Delete a project
- [ ] Verify confirmation dialog
- [ ] Verify project removes from display

## API Integration Notes

Make sure your backend:
1. Accepts `files` array (not single file)
2. Auto-detects image vs video based on mimetype
3. Auto-sets first image as `coverImage`
4. Returns updated artisan object with portfolio structure
5. Validates file count (max 10) and size (max 100MB)

## File Size Limits
- **Max files per upload**: 10
- **Max total size**: 100MB
- **Accepted formats**: 
  - Images: jpg, jpeg, png, gif, webp
  - Videos: mp4, webm, mov, avi
