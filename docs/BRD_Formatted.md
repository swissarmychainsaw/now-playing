# Business Requirements Document: Now Playing Movie App

## 1. Introduction

### 1.1 Purpose
This document outlines the business requirements for the "Now Playing" movie application, a platform that helps users discover movies, view their details, and find where to watch them.

### 1.2 Project Overview
The application integrates with The Movie Database (TMDb) to provide comprehensive movie information, streaming availability, and personalized recommendations.

## 2. Business Requirements

### 2.1 Functional Requirements

#### 2.1.1 Movie Discovery
- Display trending/popular movies on the landing page
- Allow users to search for specific movies
- Show detailed movie information
- Display movie posters and backdrops

#### 2.1.2 Movie Details
- Title, release year, and runtime
- Plot summary
- Genres
- Cast and crew information
- User and critic ratings
- Available streaming providers

#### 2.1.3 Watch Options
- Display streaming/rental/purchase options
- Show provider logos
- Direct links to provider platforms
- Fallback to TMDb page if no links available

#### 2.1.4 User Interaction
- Like/dislike movies
- Save preferences
- Track watch history
- Personalized recommendations

#### 2.1.5 Authentication
- User registration and login
- Secure Firebase authentication
- Persistent user data

### 2.2 Non-Functional Requirements

#### 2.2.1 Performance
- Page load < 2 seconds
- Smooth animations
- Efficient image loading

#### 2.2.2 Usability
- Responsive design
- Mobile-first approach
- WCAG compliant
- Clear navigation

#### 2.2.3 Security
- Secure API key management
- Protected user data
- Secure auth flows

#### 2.2.4 Compatibility
- Modern browsers support
- Responsive layouts

## 3. Technical Requirements

### 3.1 Frontend
- React.js
- Material-UI
- React Router
- Axios
- Firebase

### 3.2 APIs
- TMDb API
- TMDb Watch Provider API
- Firebase Authentication
- Firebase Realtime Database

### 3.3 Hosting
- Google Firebase
- GitHub CI/CD
- Environment variables

## 4. User Stories

### 4.1 Movie Browser
- Browse popular/trending movies
- Search by title
- Filter by genre/year/rating

### 4.2 Movie Details
- View comprehensive movie info
- See streaming availability
- View cast and crew

### 4.3 Personalization
- Like/dislike movies
- Get recommendations
- Save to watchlist

### 4.4 Landing Page Features

#### Default View
- Search input
- Recommendation buttons:
  - Oscar Winners
  - Popular
  - Critics' Picks
- 5 recommended movies based on likes
- Clickable movie cards with consistent metadata

#### Recommendation Types
1. **Oscar Winners**
   - 5 Oscar-winning movies
   - Aligned with user preferences
   - Filters out seen/liked movies
   - Refreshes on click

2. **Popular**
   - 5 trending movies
   - Matches user preferences
   - Filters previously shown
   - New set on refresh

3. **Critics' Picks**
   - 5 highly-rated movies
   - Sorted by critic score
   - Secondary sort by preference
   - Filters seen items

### 4.5 MovieCard Component

#### Test Page
- URL: `/MovieCardTest`
- Displays single card (Star Wars)

#### Features
1. **Props**
   ```javascript
   {
     movie: Object,          // Movie details
     isLiked: Boolean,      // Like status
     isDisliked: Boolean,   // Dislike status
     onLike: Function,      // Like handler
     onDislike: Function,   // Dislike handler
     showActions: Boolean,  // Toggle buttons
     showOverview: Boolean, // Toggle description
     showRating: Boolean,   // Toggle stars
     onClick: Function      // Click handler
   }
   ```

2. **UI Elements**
   - Poster image with hover effect
   - Play button on hover
   - Title and release year
   - Star rating (5-star scale)
   - Genre tags (max 3)
   - Truncated overview (3 lines)
   - Like/dislike buttons with tooltips

3. **Interactivity**
   - Navigate to movie details on click
   - Visual feedback on interactions
   - Hover effects

4. **Responsive Design**
   - Flexbox layout
   - 2:3 aspect ratio for images
   - Responsive typography
   - Breakpoints:
     - xs: 1 column
     - sm: 2 columns
     - md: 3 columns
     - lg: 4 columns

5. **Accessibility**
   - Semantic HTML
   - ARIA attributes
   - Keyboard navigation
   - Screen reader support

## 5. Technical Specifications

### 5.1 Card Dimensions
- **Container**:
  - Width: 100% of parent
  - Max-width: 300px
  - Height: Auto

- **Image Section**:
  - Aspect ratio: 2/3
  - Full width
  - Rounded corners

- **Content Section**:
  - Title + year (single line)
  - Rating stars
  - Genre chips
  - Overview (optional)
  - Action buttons

## 6. Dependencies
- TMDb API key
- Firebase configuration
- Node.js/npm
- React 18+

## 7. Constraints
- API rate limits
- Content availability by region
- Reliance on TMDb data accuracy
