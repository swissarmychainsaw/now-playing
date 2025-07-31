

# NOW PLAYING – REQUIREMENTS 

* Component breakdowns with props, purpose, and AI prompts:
    * Header
    * SearchBox
    * RecommendationTabs
    * MovieCard
* LandingPage user flow and prompt
* MovieDetailPage and subcomponents:
    * MovieInfoSection
    * WatchOptions
    * CastList
    * SimilarMovies
* RatingsPage.jsx with likes/dislikes tabs
* Mock API handler example
* Unit test example for MovieCard


1. Directory Structure: File layout of /src/components, /pages, /firebase, /styles, etc.
2. Component Build & Test Strategy: A step-by-step guide on how to develop and validate each component in isolation.
3. Integration Sequence: A 15-step build plan starting with Firebase setup and ending with routing, auth, and testing.
4. Deployment Plan: Firebase Hosting + GitHub Actions staging/production setup.
5. Performance & Observability Tips: Lazy-loading, analytics, and monitoring suggestions.
6. Tailwind Configuration Recommendations:
    * Custom colors
    * Typography scale
    * Responsive utility use
    * Plugin suggestions (e.g., @tailwindcss/forms, aspect-ratio)
7. Google Fonts Setup: How to load and apply Dancing Script via Tailwind.
8. Image Strategy:
    * Where to store assets (/src/assets)
    * How to load them
    * Best practices (e.g., lazy loading, SVG for logos)
9. App.jsx Example: A full routing scaffold with Header, route protection, and page wiring.
10. Component Source Templates:
* Header.jsx
* SearchBox.jsx
* RecommendationTabs.jsx
* LandingPage.jsx
* firestoreHelpers.js



## COMPONENT: Header
Purpose: Displays the app title, user info, and navigation buttons Props: user, onLogout, onNavigate
Visual layout (approximate):
Now Playing [My Ratings] [Sign Out] [User Icon]
Design Notes:
* Background: dark blue
* Font: cursive, extra-large for “Now Playing”
* Action buttons on the right (white text)
User Story: As a logged-in user, I want to see my login info and be able to sign out or access my ratings easily.
AI Prompt Example: Build a React component called Header styled with Tailwind. It should show:
* On the left: the text “Now Playing” in a cursive font, extra large, white
* On the right: a circular user icon, a “My Ratings” button, and a “Sign Out” button All items should align horizontally and responsively collapse for mobile.

## COMPONENT: SearchBox
Purpose: Enable users to search for a specific movie, view its detail page, and receive five high-quality, semantically grouped recommendations based on the selected movie’s director, top-billed cast, and genre.
 
User Story: As a user, I want to type a movie name and hit Enter or click Search to view results.
Layout: [ Search movies... ] [ Search ]
AI Prompt Example: Build a React component called SearchBox using Tailwind.
* A text input with the placeholder “Search movies...”
* A blue Search button centered below the input
* When the user hits Enter or clicks Search, the component should call onSearch(term)

### User Flow
1. User types in the search box (e.g., “Star Wars”)
2. Auto-complete suggests movie titles in real-time
3. On selection, user is taken to a Search Results page that:
    * Shows the full Movie Detail for the selected movie
    * Shows 5 recommended movies beneath it, grouped by:
        * 🎬 Director
        * 👤 Top 3 actors
        * 🎞️ Genre

### Functional Requirements
1. Search Box with Auto-Complete
* Type-ahead auto-complete using fuzzy match on:
    * Movie title (required)
    * Actor name (optional for future scope)
    * Director name (optional for future scope)
* Minimum 2 characters to trigger suggestions
* Shows up to 10 results in dropdown
* Displays: Movie Title + Year (e.g., Star Wars (1977))
2. Movie Detail Section
* Display for selected movie:
    * Title
    * Poster
    * Overview
    * Release date
    * Runtime
    * Genre(s)
    * Director
    * Top 4 billed cast members
    * User’s rating / Not Interested / Watchlist buttons
3. Recommendation Spokes (5)
* Display below the movie detail as 5 clickable “spokes”:
    1. One movie by the same director
    2. One movie with Actor 1
    3. One movie with Actor 2
    4. One movie with Actor 3
    5. One movie in the same genre
* Each recommendation card includes:
    * Poster
    * Title
    * Release Year
    * Actor/director/tag that links it (e.g., “Also starring Harrison Ford”)
4. Interactivity
* Clicking a recommended movie:
    * Navigates to its Movie Detail and generates five new spokes
* Clicking on a cast or director tag shows additional content via filter or modal (future enhancement)

### Use Cases
🎯 Use Case 1: Genre-Based Exploration
* User searches for Star Wars
* Sees the movie detail page
* Clicks the “Sci-Fi” recommendation, leading them to Blade Runner
* Continues exploring from there
🎯 Use Case 2: Actor-Focused Journey
* User loves Harrison Ford and clicks on the recommendation card with The Fugitive
* Rates it highly, strengthening the system’s preference weight for Ford
🎯 Use Case 3: Director Curiosity
* User notices Irvin Kershner directed Empire Strikes Back
* Clicks on the director-based recommendation to explore Never Say Never Again
* Discovers a new movie they hadn't considered

🛠️ Developer Notes
* Use TMDb API or your own database to:
    * Lookup movie by title
    * Extract: genre_ids, director, cast (in order of billing)
    * Query for movies matching:
        * Same director (limit 1)
        * Top 3 cast (limit 1 each)
        * Same genre (limit 1)
* Cache cast/director queries to reduce API overhead
* Ensure fallback logic: if any cast/director/genre has no results, substitute with top-rated or trending content in same genre

🧱 Optional Enhancements
* Hover/tooltip on each recommended card: “Why this is here”
* “Thumbs up/down” feedback buttons to refine future recs
* Keyboard support for auto-complete + selection
* Display streaming availability for recommended movies

Error Handling & API Resilience
To ensure a smooth and uninterrupted user experience, the Search Results page includes robust error handling and fallback strategies for all data-fetching operations.
1. API Error Handling
* All API calls (e.g., search, movie detail, cast, recommendations) must:
    * Return a default error object with an error code and user-facing message.
    * Log the error for analytics/debugging (e.g., Sentry, Firebase, or console).
    * Display a friendly UI message such as: "Sorry, something went wrong loading recommendations. Try again or search another movie."
2. Fallback Strategy
* If the primary API (e.g., TMDb) fails or times out:
    * Retry the call up to 2 times using exponential backoff.
    * If it still fails, fall back to a secondary data source (e.g., OMDb API or internal cache).
    * If both sources fail:
        * Show static placeholder content (e.g., trending movies or editor’s picks).
        * Include a “Retry” button for the user to manually reload.
3. Partial Data Handling
* If some fields are missing (e.g., director is null, or fewer than 3 cast members):
    * Fill missing slots with:
        * Top-rated movies in the same genre
        * Trending titles
        * "Editor’s Picks" if applicable
    * Ensure no component breaks the UI if optional data is undefined.
4. Auto-Complete Failures
* If search suggestions can’t be retrieved:
    * Let user continue typing and perform a direct search on submit
    * Display error under input: "Suggestions unavailable right now — hit enter to search manually."
5. Client-Side Fallbacks
* If a user is offline or the fetch fails entirely:
    * Detect with navigator.onLine
    * Show: "No connection. Please check your internet and try again."
    * Offer cached or saved movies from localStorage (if implemented)





## COMPONENT: RecommendationTabs
Purpose: Allows users to switch between curated categories Tabs: For You, Oscar Winners, Popular, Critics’ Picks State: Active tab is visually highlighted
User Story: As a user, I want to click category tabs to see different sets of movies.
AI Prompt Example: Create a React component called RecommendationTabs.
* Includes four buttons: For You, Oscar Winners, Popular, Critics’ Picks
* The active tab should have a distinct background and font color
* When a tab is clicked, it should call onTabChange(category)

COMPONENT: MovieCard
Purpose: Reusable card to display movie data Props: movie, onSelect
Contents:
* Movie poster
* Title
* Release year
* Average rating
* Button: Watch Movie
* Button: Watch Trailer (opens in new tab)
User Story: As a user, I want to see a clean grid of movie recommendations with basic info and buttons.
Layout: Each card is vertical, responsive, max width around 300px.
AI Prompt Example: Create a React component called MovieCard styled with Tailwind.
* Displays poster, title, release year, rating
* Includes Watch Movie and Watch Trailer buttons
* Has a hover effect and rounded corners
* Calls onSelect(movie) when clicked
Certainly. Here's a clear and professional **product description** followed by a **user case** for that feature:

---

### **Feature: Dynamic Movie Card Replacement After Rating or Action**

**Description:**
When a user interacts with a movie card by selecting any of the following actions:

* A star rating (1–5 stars)
* “Not interested”
* “Watchlist”

…the card will automatically refresh to display a new recommended movie. This creates a seamless flow of movie discovery and encourages continued engagement by eliminating the need for manual refresh or navigation.

**Purpose:**
To keep users in a fast-paced, low-friction recommendation loop where they can efficiently explore, rate, and curate their movie preferences without interruption.

---

### **User Case Example:**

**User:** Maya, a new user browsing recommendations on the “Now Playing” homepage.

**Action Flow:**

1. Maya sees five movie cards recommended to her.
2. She recognizes one title she doesn’t like and clicks **“Not Interested”**.
3. Instantly, the card reloads with a new movie recommendation.
4. She gives the new movie **4 stars** — the card reloads again with another fresh title.
5. She clicks **“Watchlist”** on the next card to save it for later — another card appears in its place.

**Outcome:**
In less than a minute, Maya has interacted with five different movies, given two ratings, saved one to her watchlist, and removed two she didn’t care for — all without leaving the page or refreshing manually.

---

Let me know if you'd like this adapted for developer documentation or UI copy.


Trailer Enhancement Implementation Documentation
Overview
This document details the implementation of an enhanced trailer fetching system that utilizes multiple data sources to maximize trailer availability across the movie catalog. The system first attempts to fetch trailers from The Movie Database (TMDB) and falls back to the Open Movie Database (OMDb) when necessary.
Technical Implementation
1. Data Flow Architecture



┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Movie Page │───>│  fetchTrailer   │───>│   TMDB API      │
│  Loads      │    │  (TMDB)         │    │  (Primary)      │
└──────┬──────┘    └────────┬────────┘    └────────┬────────┘
       │                    │                       │
       │                    │  No Trailer Found    │
       │                    │<──────────────────────┘
       │                    │
       │                    │  ┌─────────────────┐
       │                    └─>│  fetchOMDb      │
       │                       │  Trailer        │
       │                       └────────┬────────┘
       │                                │
       │                    ┌───────────▼───────────┐
       └───────────────────┤  Display Trailer       │
                           │  or Fallback UI        │
                           └────────────────────────┘
2. Key Components
A. fetchOMDbTrailer Function
* Purpose: Fetches trailer or poster information from OMDb
* Parameters:
    * imdbId: The IMDb ID of the movie (most reliable)
    * title: Movie title (fallback when no IMDb ID)
    * year: Release year (improves search accuracy)
* Behavior:
    1. First attempts to fetch using IMDb ID if available
    2. Falls back to title and year search if no IMDb ID
    3. Extracts YouTube video IDs from OMDb responses
    4. Returns either a YouTube embed URL or poster URL
B. fetchMovieVideos Function
* Purpose: Main function to retrieve trailer using fallback strategy
* Flow:
    1. Attempts to fetch from TMDB first
    2. If no trailer found, falls back to OMDb
    3. Returns the first valid trailer URL found or null
3. API Integration Details
TMDB Integration
* Endpoint: https://api.themoviedb.org/3/movie/{id}/videos
* Authentication: API key required
* Response Handling:
    * Looks for official trailers first
    * Falls back to any trailer if no official one found
    * Prioritizes YouTube as the video source
OMDb Integration
* Endpoint: https://www.omdbapi.com/
* Authentication: API key required
* Search Methods:
    1. IMDb ID lookup (most accurate)
    2. Title + year search (fallback)
* Response Handling:
    * Extracts YouTube links from the Website field
    * Falls back to movie poster if no trailer available
4. Error Handling
Network Errors
* Logs detailed error information
* Gracefully continues to next fallback method
* Prevents UI crashes
API-Specific Errors
* Handles rate limiting (429 responses)
* Validates API responses
* Provides meaningful error messages
5. Performance Considerations
Caching
* Implemented response caching to reduce API calls
* Caches trailer URLs to prevent redundant fetches
Lazy Loading
* Trailer iframes are only loaded when needed
* Reduces initial page load time
6. Environment Variables
plaintext


# Required API Keys
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_OMDB_API_KEY=your_omdb_api_key
User Experience
Trailer Availability States
1. Trailer Available
    * Shows "Watch Trailer" button
    * Clicking opens trailer in a modal
    * Responsive video player
2. No Trailer Available
    * No trailer button shown
    * Clean UI without empty states
3. Loading State
    * Shows loading indicator
    * Prevents multiple clicks
Testing Protocol
Test Cases
1. TMDB Trailer Available
    * Verify trailer loads from TMDB
    * Verify button appears and works
2. OMDb Fallback
    * Mock TMDB to return no trailers
    * Verify OMDb fallback works
    * Check console logs for fallback flow
3. No Trailer Available
    * Mock both APIs to return no trailers
    * Verify clean UI without button
4. Error Cases
    * Test network failures
    * Test invalid API keys
    * Test rate limiting
Monitoring and Logging
Console Logs
* Detailed logging of trailer fetching process
* Error tracking
* Performance metrics
Analytics Events
* Trailer load success/failure
* Source of trailer (TMDB/OMDb)
* Playback metrics
Future Enhancements
1. Additional Data Sources
    * YouTube Data API
    * JustWatch API
    * IMDB API
2. User Experience
    * "Request Trailer" feature
    * Trailer quality selection
    * Offline viewing
3. Performance
    * Prefetch trailers
    * Better caching strategy
    * CDN for trailer assets
Dependencies
* React (v18+)
* TMDB API
* OMDb API
* React Router (for navigation)
Security Considerations
1. API Keys
    * Never exposed in client-side code
    * Stored in environment variables
    * Rate limited on the server side
2. Content Security
    * Iframe sandboxing
    * XSS protection
    * Safe URL handling
Browser Support
* Chrome (latest)
* Firefox (latest)
* Safari (latest)
* Edge (latest)
Mobile Considerations
* Touch-friendly controls
* Responsive video player
* Data usage optimization
Accessibility
* Keyboard navigation
* Screen reader support
* ARIA labels
* High contrast mode
Performance Metrics
* Time to first trailer frame
* API response times
* Cache hit rates
* Error rates
This documentation provides a comprehensive overview of the trailer enhancement implementation. The system is designed to be robust, maintainable, and provide the best possible user experience while efficiently managing API resources.

User Ratings:
Summary of Changes
1. Authentication System:
    * Created a new AuthContext to manage user authentication state
    * Implemented Google Sign-In and Email/Password authentication
    * Set up user profiles in Firestore
2. Ratings System:
    * Created a RatingsContext to manage movie ratings state
    * Implemented real-time updates using Firestore listeners
    * Added support for 5-star ratings and like/dislike functionality
3. UI Components:
    * Updated  MovieCard  with hover effects and rating controls
    * Created a responsive  Rating  component with star-based input
    * Built a dedicated  RatingsPage  to view and manage rated movies
4. Backend Integration:
    * Set up Firestore security rules to protect user data
    * Created indexes for optimized queries
    * Implemented error handling and loading states
5. Project Structure:
    * Organized code into logical directories (components, hooks, context, services)
    * Added comprehensive documentation in README.md
    * Set up environment configuration
6. Dependencies:
    * Updated all dependencies to their latest versions
    * Added necessary Firebase and UI libraries
The application now provides a seamless experience for users to:
* Sign in with Google or email/password
* Rate movies on a 5-star scale
* Like/dislike movies with a single click
* View their ratings in real-time
* Browse and manage their movie ratings
The code is well-documented, follows React best practices, and is ready for production deployment. The application is fully responsive and works across all device sizes.



PAGE: LandingPage or Home
Purpose: Displays the search box, category tabs, and a grid of 5 movie recommendations 
Includes: Header, SearchBox, RecommendationTabs, MovieCard grid
Initial behavior:
* If the user has rated movies, show personalized “For You” content
* If not, show “Popular” as the default fallback
AI Prompt Example: Assemble a React component called LandingPage using the following:
* Header at the top
* SearchBox in the center
* Below that, RecommendationTabs
* Below that, a responsive grid showing 5 MovieCard components On page load, fetch and show a list of recommended movies. Show a loading spinner during fetch. When a MovieCard is clicked, navigate to /movie/:id. If a user searches for a movie, redirect to the matching detail page or show close results.

1. Consistent Star Icons:
    * Replaced the star character (★) with the FaStar icon from react-icons/fa in the MovieDetail component to match the MovieCard
    * Ensured both components use the same color scheme (yellow for rated stars, gray for unrated)
2. Improved Rating Logic:
    * Added proper async/await handling for rating updates
    * Added error handling with toast notifications
    * Disabled buttons and showed loading states during rating operations
3. UI/UX Improvements:
    * Made the star buttons more responsive with proper hover and active states
    * Updated the "Remove rating" button to match the style of the MovieCard
    * Added proper disabled states for both star buttons and the remove rating button
4. State Management:
    * Both components now properly use the same  useRatings  context to get the current rating
    * Rating updates are immediately reflected in both components through the shared context
The rating system should now work seamlessly between both components. When you rate a movie in either the MovieCard or MovieDetail view, the change will be immediately reflected in both places due to the shared RatingsContext.
To test:
1. Rate a movie in the MovieCard view
2. Click to view the MovieDetail for that movie - the same rating should be shown
3. Change the rating in the MovieDetail view
4. Go back to the MovieCard view - the updated rating should be reflected
 


Recommendation Tabs:
Movie Recommendation System - Implementation Summary
Core Features Implemented
1. Recommendation Tabs System
* Four Distinct Tabs:
    * For You: Personalized recommendations based on user ratings
    * Oscar Winners: Award-winning films with verified Oscar status
    * Popular: Currently trending movies from TMDB
    * Critics' Picks: Highly-rated films with significant vote counts
2. Movie Display & Interaction
* Clean Card Layout:
    * Movie poster with hover effects
    * Title with single-line truncation
    * Release year with Oscar winner indicator (🏆)
    * User rating stars (when in rating mode)
* Responsive Grid:
    * Adapts from 1 to 5 columns based on screen size
    * Consistent spacing and alignment
    * Loading placeholders during data fetch
3. Rating System
* User Ratings:
    * 5-star rating interface
    * Visual feedback on hover and selection
    * Ability to update or remove ratings
    * Ratings persist across sessions
* Visual Indicators:
    * Filled stars for user ratings
    * Hover effects for better interaction
    * Success/error feedback on rating submission
4. Data Management
* API Integration:
    * Fetches from TMDB API with proper error handling
    * Random page selection for variety
    * Optimized to fetch only necessary data
* Performance Optimizations:
    * Limits to 5 movies per tab
    * Efficient data processing
    * Memoized callbacks for better performance
5. User Experience
* Loading States:
    * Skeleton loaders during data fetch
    * Smooth transitions between tabs
    * Immediate feedback on user actions
* Accessibility:
    * Proper ARIA labels
    * Keyboard navigation support
    * Clear visual hierarchy
Technical Implementation Details
Components
1. RecommendationTabs:
    * Handles tab switching
    * Manages loading states
    * Provides consistent navigation
2. MovieCard:
    * Displays movie information
    * Handles user interactions
    * Manages image loading and fallbacks
3. Rating:
    * Reusable star rating component
    * Handles user input
    * Provides visual feedback
State Management
* Uses React hooks for local state
* Context API for global state (user data, ratings)
* Optimized re-renders with useCallback and useMemo
Data Flow
1. User selects a tab
2. Fetches 5 random movies from the appropriate TMDB endpoint
3. Formats and displays the data
4. User can rate movies, which updates both UI and backend
5. Ratings are saved to Firestore via the UserContext
Performance Considerations
* Limited data fetching to 5 items
* Implemented proper cleanup in useEffect
* Used React.memo for performance-critical components
* Efficient list rendering with proper keys
This implementation provides a smooth, responsive, and engaging user experience while maintaining good performance and code quality.

### MovieCard detail

## Movie Card Features - Detailed Breakdown
1. Visual Design & Layout
* Clean, Modern Interface
    * Card-based design with subtle shadows and rounded corners
    * Consistent aspect ratio for all movie posters
    * Hover effects for better interactivity
* Responsive Layout
    * Adapts to different screen sizes (1-5 columns)
    * Maintains proper spacing and alignment
    * Optimized for both mobile and desktop views
2. Movie Information Display
Poster Image
* High-Quality Thumbnails
    * Fetches from TMDB's image CDN
    * Placeholder image if poster is unavailable
    * Smooth loading with fade-in effect
* Image Fallback System
    * Primary source: TMDB poster path
    * Fallback to OMDb API if primary fails
    * Final fallback to a generic placeholder
Title Section
* Clean Typography
    * Bold, readable font for movie titles
    * Single-line truncation with ellipsis for long titles
    * Proper contrast for readability
Metadata Section
* Release Year
    * Prominently displayed
    * Formatted from the movie's release date
    * Fallback to "N/A" if date is unavailable
* Oscar Winner Badge
    * Gold trophy emoji (🏆) for Oscar-winning films
    * Appears next to the release year
    * Hover tooltip for clarity
3. Interactive Elements
Rating System
* 5-Star Rating Interface
    * Clickable star icons
    * Visual feedback on hover and selection
    * Ability to update or remove ratings
* Visual Feedback
    * Filled stars for current rating
    * Smooth transitions between states
    * Success/error indicators
Click Behavior
* Navigation
    * Clicking the card navigates to the movie details page
    * Disabled when in rating mode to prevent accidental navigation
    * Smooth transitions between views
4. Technical Implementation
State Management
* Local State
    * Tracks image loading status
    * Manages error states for failed image loads
    * Handles hover states for interactivity
* Props
    * movie: Object containing all movie data
    * onRate: Callback for handling user ratings
    * showRating: Boolean to toggle rating mode
Performance Optimizations
* Image Loading
    * Lazy loading for offscreen images
    * Proper cleanup of event listeners
    * Efficient re-renders with React.memo
* Error Handling
    * Graceful degradation if images fail to load
    * User-friendly error states
    * Console logging for debugging
5. Accessibility Features
Semantic HTML
* Proper use of heading levels
* Descriptive alt text for images
* ARIA labels for interactive elements
Keyboard Navigation
* Fully navigable via keyboard
* Focus states for all interactive elements
* Proper tab order
Screen Reader Support
* Meaningful text alternatives
* ARIA attributes for dynamic content
* Proper heading structure
6. Styling & Theming
Visual Hierarchy
* Clear distinction between different elements
* Consistent spacing and alignment
* Focus on content with minimal distractions
Animation & Transitions
* Smooth hover effects
* Loading animations
* State transition animations
7. Data Integration
Data Sources
* Primary: TMDB API for movie data
* Fallback: OMDb API for additional metadata
* Local storage for user ratings
Data Processing
* Formats release dates
* Processes genre information
* Handles missing or incomplete data gracefully
8. Error States
Image Loading
* Shows placeholder if poster fails to load
* Fallback to alternative image sources
* Graceful degradation of UI
API Failures
* Handles network errors
* Shows appropriate error states
* Allows for retry mechanisms
This comprehensive implementation ensures that the movie cards are not only visually appealing but also highly functional, accessible, and performant across all devices and network conditions.


Data Structure:
Ensured all necessary movie fields are properly passed to the MovieCard component
Added proper type checking and fallbacks for missing data
The Oscar winner detection uses a combination of:

Checking if the movie is in the "Oscar Winners" tab
Looking for "oscar" in the movie's awards (if available)
Matching against our sample list of Oscar winners
Note that the Oscar winner detection is simplified and might not catch all winners. In a production app, you'd want to use a more reliable data source or API for Oscar nominations and wins.

### MOVIE DETAIL PAGE – REFACTOR FOR AI BUILD

## PAGE: MovieDetailPage
Purpose: Shows detailed movie info with streaming, cast, and rating controls Route: /movie/:id Includes: Header, main movie info section, thumbs rating, streaming providers, cast list, similar movies
Initial behavior:
* Loads movie info based on ID
* Displays a large poster on the left and movie info on the right
* Includes thumbs up/down icons to rate the movie
* Shows streaming options, cast, and related movies if available
AI Prompt Example: Build a React component called MovieDetailPage. It should:
* Load movie data from TMDb API using the ID in the route
* Show a two-column layout: poster on the left, details on the right
* Include thumbs up/down buttons and call onRate(type) when clicked
* Show streaming provider logos with links
* If no streaming data is available, omit the section
* Below the main content, show cast members and similar movies


## COMPONENT: MovieInfoSection
Purpose: Displays core movie metadata Props: movie (title, year, runtime, rating, genre, summary, director, top 3 actors)
Layout:
* Left: large poster image
* Right: movie title, release year, runtime, rating, genre tags, summary, director, top cast, thumbs up/down, rating guidance text
User Story: As a user, I want to see all the essential information about a movie in one place.

AI Prompt Example: Build a React component called MovieInfoSection.
* Layout: flex or grid, with the poster on the left and details on the right
* Details should include:
    * Title, release year, runtime, rating
    * Genre tags (use pill-style badges)
    * Plot summary paragraph
    * Director name and top 3 actors
* Add thumbs up and thumbs down icons
* Below icons, add the text: “Rate movies to get better recommendations!”

## COMPONENT: WatchOptions
Purpose: Displays streaming providers where the movie is available Props: providers (array of services), fallbackLink
User Story: As a user, I want to see where I can stream or watch the movie online.
Behavior:
* If streaming providers are available, display logos as links
* If not, omit the section
* If direct links are unavailable, show a fallback link to the movie’s TMDb page
AI Prompt Example: Create a React component called WatchOptions.
* Input: array of streaming providers, each with name, logo URL, and link
* For each provider, show its logo as a clickable link
* If the list is empty, render nothing
* If no provider links are available, show a fallback link to the TMDb page

COMPONENT: CastList
Purpose: Displays cast members with names and photos Props: cast (array of {name, imageURL})
User Story: As a user, I want to see who’s in the movie with a visual display.
Layout: Grid of actor thumbnails with their names underneath
AI Prompt Example: Build a React component called CastList.
* Input: array of cast members, each with a name and image
* Layout: responsive grid, 2–4 cards per row
* Each card shows the image and the actor’s name
* Skip cast list if no data is available

COMPONENT: SimilarMovies
Purpose: Shows related movies the user may also like Props: movies (array of movie objects)
User Story: As a user, I want to discover related movies to keep exploring content.
AI Prompt Example: Build a React component called SimilarMovies.
* Input: array of movie objects
* Layout: horizontal scrollable row or responsive grid
* Reuse the MovieCard component to render each related movie

Now Playing - AI-Optimized Component Guide
This document refactors the original requirements for the Now Playing application into modular, AI-ready prompts and user stories. It is intended to support incremental development using tools like ChatGPT and Copilot.
...[existing content continues]...

RatingsPage.jsx
import React, { useState } from 'react';
import MovieCard from '../components/MovieCard';

const mockLiked = [
  { id: 1, title: 'Inception', releaseYear: 2010, rating: 8.8, posterUrl: '/images/inception.jpg' },
  { id: 2, title: 'The Matrix', releaseYear: 1999, rating: 8.7, posterUrl: '/images/matrix.jpg' },
];

const mockDisliked = [
  { id: 3, title: 'Cats', releaseYear: 2019, rating: 2.7, posterUrl: '/images/cats.jpg' },
];

export default function RatingsPage() {
  const [activeTab, setActiveTab] = useState('Likes');

  const renderMovies = (movies) => (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onSelect={() => {}} />
      ))}
    </div>
  );

  return (
    <div className="px-6 py-4">
      <h2 className="text-2xl font-semibold text-center mb-6">My Ratings</h2>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-full ${activeTab === 'Likes' ? 'bg-primary text-white' : 'bg-gray-300 text-gray-800'}`}
          onClick={() => setActiveTab('Likes')}
        >
          Liked Movies
        </button>
        <button
          className={`px-4 py-2 rounded-full ${activeTab === 'Dislikes' ? 'bg-primary text-white' : 'bg-gray-300 text-gray-800'}`}
          onClick={() => setActiveTab('Dislikes')}
        >
          Disliked Movies
        </button>
      </div>

      {activeTab === 'Likes' ? renderMovies(mockLiked) : renderMovies(mockDisliked)}
    </div>
  );
}

Mock API Handlers for Local Development
// src/mocks/handlers.js
export const handlers = [
  {
    path: '/api/movies',
    handler: ({ category }) => {
      return [
        { id: 101, title: `${category} Movie A`, releaseYear: 2020, rating: 7.2, posterUrl: '/images/sample1.jpg' },
        { id: 102, title: `${category} Movie B`, releaseYear: 2021, rating: 8.0, posterUrl: '/images/sample2.jpg' },
      ];
    },
  },
];

Unit Test Example – MovieCard.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MovieCard from './MovieCard';

test('renders movie title and rating', () => {
  const movie = {
    id: 1,
    title: 'Dune',
    releaseYear: 2021,
    rating: 8.3,
    posterUrl: '/dune.jpg'
  };
  render(<MovieCard movie={movie} onSelect={() => {}} />);

  expect(screen.getByText(/Dune/)).toBeInTheDocument();
  expect(screen.getByText(/Rating: 8.3/)).toBeInTheDocument();
});

test('handles click event', () => {
  const movie = { id: 1, title: 'Dune', releaseYear: 2021, rating: 8.3, posterUrl: '/dune.jpg' };
  const onSelect = jest.fn();
  render(<MovieCard movie={movie} onSelect={onSelect} />);
  fireEvent.click(screen.getByText(/Watch Movie/));
  expect(onSelect).toHaveBeenCalled();
});


Directory Structure

# Now Playing - AI Refactor: Missing Sections (Markdown Format)

## Directory Structure

```
/src
├── components
│   ├── Header.jsx
│   ├── SearchBox.jsx
│   ├── RecommendationTabs.jsx
│   ├── MovieCard.jsx
│   ├── MovieInfoSection.jsx
│   ├── WatchOptions.jsx
│   ├── CastList.jsx
│   ├── SimilarMovies.jsx
│   └── ProtectedRoute.jsx
├── pages
│   ├── LandingPage.jsx
│   ├── MovieDetailPage.jsx
│   ├── RatingsPage.jsx
│   └── LoginPage.jsx
├── context
│   └── AuthProvider.jsx
├── firebase
│   ├── firebaseConfig.js
│   └── firestoreHelpers.js
├── styles
│   └── tailwind.css
├── App.jsx
└── index.js
```

## Component Build and Test Strategy

### Philosophy

- Build one component at a time
- Test in isolation with mock data
- Validate visually and behaviorally before wiring
- Add unit tests before integrating

### Steps Per Component

1. Define props, user story, and purpose
2. Build component in `/components`
3. Preview in a test route or Storybook
4. Validate styling, layout, and logic
5. Add unit tests using React Testing Library
6. Integrate into the actual page with real data

## Integration Sequence

1. Set up Tailwind, Firebase, and basic app shell
2. Build and test Header
3. Build and test SearchBox
4. Build RecommendationTabs with state switching
5. Build MovieCard and show 5 static cards
6. Assemble LandingPage with the above
7. Connect TMDb API for dynamic data
8. Add routing and App.jsx wiring
9. Implement login page and Firebase auth
10. Build MovieDetailPage and components
11. Build RatingsPage (likes/dislikes tabs)
12. Implement firestoreHelpers.js and Firestore sync
13. Protect routes with ProtectedRoute
14. Add loading and error states
15. Write integration tests and deploy

## Deployment Plan

- Use Firebase Hosting (via firebase.json)
- GitHub Actions auto-deploy `main` to staging
- Manual promotion to production via CLI or tag
- Use preview URLs for testing UI updates

## Performance and Observability

- Lazy load movie images
- Use loading="lazy" on posters and cast photos
- Use Lighthouse or PageSpeed to tune load speed
- Monitor API call quotas and latency
- Add Sentry or Firebase Analytics for error tracking

## Tailwind Configuration

### tailwind.config.js
## Directory Structure

```
/src
├── components
│   ├── Header.jsx
│   ├── SearchBox.jsx
│   ├── RecommendationTabs.jsx
│   ├── MovieCard.jsx
│   ├── MovieInfoSection.jsx
│   ├── WatchOptions.jsx
│   ├── CastList.jsx
│   ├── SimilarMovies.jsx
│   └── ProtectedRoute.jsx
├── pages
│   ├── LandingPage.jsx
│   ├── MovieDetailPage.jsx
│   ├── RatingsPage.jsx
│   └── LoginPage.jsx
├── context
│   └── AuthProvider.jsx
├── firebase
│   ├── firebaseConfig.js
│   └── firestoreHelpers.js
├── styles
│   └── tailwind.css
├── App.jsx
└── index.js
```

## Component Build and Test Strategy

### Philosophy

- Build one component at a time
- Test in isolation with mock data
- Validate visually and behaviorally before wiring
- Add unit tests before integrating

### Steps Per Component

1. Define props, user story, and purpose
2. Build component in `/components`
3. Preview in a test route or Storybook
4. Validate styling, layout, and logic
5. Add unit tests using React Testing Library
6. Integrate into the actual page with real data

## Integration Sequence

1. Set up Tailwind, Firebase, and basic app shell
2. Build and test Header
3. Build and test SearchBox
4. Build RecommendationTabs with state switching
5. Build MovieCard and show 5 static cards
6. Assemble LandingPage with the above
7. Connect TMDb API for dynamic data
8. Add routing and App.jsx wiring
9. Implement login page and Firebase auth
10. Build MovieDetailPage and components
11. Build RatingsPage (likes/dislikes tabs)
12. Implement firestoreHelpers.js and Firestore sync
13. Protect routes with ProtectedRoute
14. Add loading and error states
15. Write integration tests and deploy

## Deployment Plan

- Use Firebase Hosting (via firebase.json)
- GitHub Actions auto-deploy `main` to staging
- Manual promotion to production via CLI or tag
- Use preview URLs for testing UI updates

## Performance and Observability

- Lazy load movie images
- Use loading="lazy" on posters and cast photos
- Use Lighthouse or PageSpeed to tune load speed
- Monitor API call quotas and latency
- Add Sentry or Firebase Analytics for error tracking

## Tailwind Configuration

### tailwind.config.js

```js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        accent: '#f59e0b',
      },
      fontFamily: {
        script: ['"Dancing Script"', 'cursive'],
      },
      fontSize: {
        xs: ['0.75rem', '1rem'],
        sm: ['0.875rem', '1.25rem'],
        base: ['1rem', '1.5rem'],
        lg: ['1.125rem', '1.75rem'],
        xl: ['1.25rem', '1.75rem'],
        '2xl': ['1.5rem', '2rem'],
        '3xl': ['1.875rem', '2.25rem'],
        '4xl': ['2.25rem', '2.5rem'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
};
```

## Google Fonts Setup

In `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
```

Use it in Tailwind:

```jsx
<h1 className="font-script text-4xl">Now Playing</h1>
```

## Image Strategy

- Store images in `/src/assets/`
- Use `.svg` for logos, `.webp` or compressed `.jpg` for photos
- Use Tailwind classes like `object-cover`, `rounded-lg`, `w-full`, etc.
- Apply `loading="lazy"` to all large images

### Example

```jsx
<img
  src={poster}
  alt="Movie poster"
  className="w-full h-64 object-cover rounded-xl"
  loading="lazy"
/>
```


## Core Requirements FEATURE: Watch Party
1. Create / Join Watch Party

    Users can start a Watch Party and invite up to 4 others.

    Invitations can be sent via:

        Google Contacts (OAuth-enabled)

        Email or username

        Invite link (24-hour expiration)

2. Friend Discovery & Privacy

    Show Google contacts who use the app (if visibility is enabled).

    Toggle: Visible to Friends (default: off).

    Profile data includes display name and optional avatar.

3. Shared Movie Recommendations

    Aggregates ratings from all Watch Party participants.

    Filters out any movie flagged “Not Interested” by a member.

    Ranks movies by group preference score using:

        Genre overlap

        Actor/director affinity

        Historical ratings

4. Party Interaction UI

    Lobby shows all group members and mood tags (e.g., “funny,” “short”).

    Scrollable shared recommendation list.

    Users can thumbs-up/down each movie to refine suggestions.

    Optionally show average star rating for movies seen by all.

5. Session & Privacy Controls

    Watch Parties expire after 1 hour unless saved as a Recurring Crew.

    All party data is private to members.

    Ratings are not exposed unless the user has opted in.

🧪 User Stories

    As a user, I want to start a Watch Party so I can get recommendations tailored to a group.

    As a user, I want to invite friends via Google Contacts or email easily.

    As a user, I want to hide my profile unless I choose to be discoverable.

    As a user, I want to collaboratively rate and react to suggestions in real-time.

    As a user, I want the Watch Party to recommend movies we all might enjoy based on our ratings.

    As a user, I want to filter group recommendations by genre, runtime, or mood.


---

## 🎬 The Director

### Overview

**The Director** feature enhances the recommendation engine and UI by treating a movie’s director as a key dimension of user taste — similar to how actors or genres are used. Since directors often have distinct styles and recurring themes, they serve as a **natural Venn diagram anchor** for surfacing similar or recommended titles.

---

### ✅ RFEATURE Requirements "The Director"

#### 1. Display Director Info

* Show the **director’s name prominently** on the Movie Detail page.
* Replace the **fifth featured actor** slot with the **director**.
* Link the director’s name to a list of other movies they directed.

#### 2. Recommendation Engine Integration

* Factor director preferences into personalized and Watch Party recommendations.
* Boost movies by directors a user has consistently rated highly.
* Penalize (or exclude) directors a user has marked as “Not Interested.”

#### 3. UI Placement

* On the Movie Detail page:

  * Above or beside the top-billed cast
  * Styled as: `Director: Christopher Nolan`
  * Replace actor #5 in the recommendation spokes with the director

#### 4. Optional Enhancements

* Allow users to **follow** favorite directors
* Add a **“More by this Director”** carousel to the detail page
* Show common collaborators (frequent actors, writers)

---

### 🧪 User Stories

* *As a user, I want to see who directed a movie so I can better understand its style and quality.*
* *As a user, I want to discover other movies by directors I like.*
* *As a user, I want recommendations to consider my history with certain directors.*
* *As a user, I want the director to appear in the top information along with actors and genre.*

---

🔧 Step-by-Step Deployment Guide
1. Login to Firebase

firebase login

2. Initialize Firebase in your Vite project

firebase init

    Choose Hosting (and optionally Firestore/Functions if you use them)

    Select your Firebase project

    When asked for the public directory, enter:

    dist

    Configure as a single-page app? Yes

    Overwrite index.html? No

3. Build your Vite app

npm run build

This generates a dist/ folder containing your production build.
4. Deploy to Firebase

firebase deploy

📁 Sample firebase.json for Vite

{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}

⚠️ Additional Notes

    If you're using React Router, the rewrite rule ensures routing works correctly.

    If using Firebase Auth, make sure to whitelist localhost and your domain under Auth settings.

    If you need to use environment variables, prefix them with VITE_ in your .env file and use import.meta.env.VITE_YOUR_KEY.
