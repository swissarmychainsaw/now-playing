# Business Requirements Document: Now Playing Movie App

## 1. Introduction
### 1.1 Purpose
This document outlines the business requirements for the "Now Playing" movie application, a platform that helps users discover movies, view their details, and find where to watch them.

### 1.2 Project Overview
The application integrates with The Movie Database (TMDb) to provide comprehensive movie information, streaming availability, and personalized recommendations. It offers a user-friendly interface for browsing, searching, and interacting with movie content.

## 2. Business Requirements

### 2.1 Functional Requirements

#### 2.1.1 Movie Discovery
- Display trending/popular movies on the landing page
- Allow users to search for specific movies
- Show detailed movie information including title, release date, overview, and ratings
- Display movie posters and backdrops

#### 2.1.2 Movie Details
- Show comprehensive movie information including:
  - Title, release year, and runtime
  - Plot summary
  - Genres
  - Cast and crew information
  - User and critic ratings
  - Available streaming providers

#### 2.1.3 Watch Options
- Display where movies can be streamed, rented, or purchased
- Show available providers with their respective logos
- Link directly to the movie on the provider's platform
- Fallback to TMDb page if no direct streaming links are available

#### 2.1.4 User Interaction
- Allow users to like/dislike movies
- Save user preferences for personalized recommendations
- Track user's watch history
- Provide movie recommendations based on user preferences

#### 2.1.5 Authentication
- User registration and login
- Secure authentication using Firebase
- Persist user preferences and watch history

### 2.2 Non-Functional Requirements

#### 2.2.1 Performance
- Page load time under 2 seconds
- Smooth transitions and animations
- Efficient image loading with placeholders

#### 2.2.2 Usability
- Intuitive and responsive design
- Mobile-first approach
- Accessible interface following WCAG guidelines
- Clear visual hierarchy and navigation

#### 2.2.3 Security
- Secure API key management
- Protected user data
- Secure authentication flows

#### 2.2.4 Compatibility
- Support for modern web browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile, tablet, and desktop

## 3. Technical Requirements

### 3.1 Frontend
- React.js for building the user interface
- Material-UI (MUI) for UI components
- React Router for navigation
- Axios for API requests
- Firebase for authentication and data persistence

### 3.2 APIs
- **TMDb API** for movie data, images, and streaming providers
- **TMDb Watch Provider API** for streaming availability
- **Firebase Authentication** for user management
- **Firebase Realtime Database** for storing user preferences

### 3.3 Hosting & Deployment
- Hosting on Google FireBase
- Continuous Deployment from GitHub repository
- Environment variable management for API keys

## 4. User Stories

### 4.1 Movie Browser
- As a user, I want to browse popular and trending movies so that I can discover new content
- As a user, I want to search for specific movies by title so that I can find movies I'm interested in
- As a user, I want to filter movies by genre, release year, and rating so that I can narrow down my options

### 4.2 Movie Details
- As a user, I want to view detailed information about a movie so that I can decide if I want to watch it
- As a user, I want to see where a movie is available to stream so that I can watch it easily
- As a user, I want to see the cast and crew of a movie so that I can recognize actors and directors I like

### 4.3 Personalization
- As a user, I want to like/dislike movies so that I can receive better recommendations
- As a user, I want to see personalized recommendations based on my preferences so that I can discover movies I'll enjoy
- As a user, I want to save movies to a watchlist so that I can find them later

### 4.4 Landing Page
Feature: Landing Page
Default View Behavior
* Upon arriving at the landing page, the user sees:
    * A search input box
	* A blue "search button" under the box that says "Search"
	* Under the search functions there are 4 Recommendation buttons:
		* For You
    		* Oscar Winners
		* Popular 
		* Critics' Picks
* Below the 4 Recommendation buttons, a list of 5 recommended movies appears.
* These recommendations are based on the user's previously liked movies (from the Liked Movies page).
* Each movie card:
    * Is clickable and links to the movie's detail page
    * Displays the same metadata as used throughout the app (poster, title, ratings, etc.)
* Oscar Winners Button
	* Clicking this button refreshes the landing page.
* Below the buttons, a new list of 5 Oscar-winning movies is displayed.
* These movies are:
    * Aligned with the user’s liked movies
    * Filtered to exclude movies the user has already seen or liked
* Repeat clicks deliver a fresh set of unseen Oscar-winning recommendations.
Popular Button
	* Clicking this button refreshes the landing page.
	* Below the buttons, a list of 5 popular movies is displayed.
	* These movies are:
	    * Defined by the app's internal "popular" dataset (e.g., from TMDB or trending APIs)
	    * Closely aligned with the user’s liked movies
	    * Not previously shown to the user
* Repeat clicks return a new set of unseen recommendations.
Critics’ Picks Button
	* Clicking this button refreshes the landing page.
	* Below the buttons, a list of 5 highly rated movies by critics appears.
	* These movies are:
	    * Primary sort: Critic rating (e.g., Rotten Tomatoes score)
	    * Secondary sort: Similarity to user’s liked movies
	    * Filtered to exclude previously seen items
	    * Each click delivers a new batch of recommendations.
Reusable Card Component
* All recommended movies on the landing page should use a shared, reusable movie card component.
* This component must:
    * Be visually and functionally consistent across pages (landing, movie details, liked movies)
    * Include core metadata such as poster, title, release year, critic and audience ratings, trailer link, and like/dislike controls
    * Support click-through to the movie detail page via the image or title

### 4.5 MovieCard

Create a test page where only one card is displayed on the page for testing purposes. Use “Star Wars” as the movie to test. Make the URL /MovieCardTest

Here's a breakdown of the MovieCard component's structure and features:
Key Features:
1. Props:
    * movie: Object containing movie details (title, poster_path, vote_average, etc.)
    * isLiked/isDisliked: Boolean states for like/dislike buttons
    * onLike/onDislike: Callback functions for button clicks
    * showActions: Toggle for like/dislike buttons
    * showOverview: Toggle for movie overview text
    * showRating: Toggle for rating display
    * onClick: Custom click handler (optional)
2. UI Components:
    * Poster Image: Displays the movie poster with hover effect
    * Play Button: Appears on hover over the poster
    * Title & Year: Movie title with release year
    * Rating: Star rating display (converted from 10-point scale to 5 stars)
    * Genre Chips: Displays up to 3 genre tags
    * Overview: Truncated movie description (3 lines max)
    * Action Buttons: Like/Dislike buttons with tooltips
3. Interactivity:
    * Clicking the card navigates to the movie detail page
    * Like/Dislike buttons with visual feedback
    * Hover effects on the card and buttons
4. Responsive Design:
    * Flexbox layout that adapts to different container sizes
    * Proper image aspect ratio (2:3)
    * Responsive typography and spacing
5. Accessibility:
    * Semantic HTML elements
    * ARIA labels and roles
    * Keyboard navigation support
    * Tooltips for interactive elements 	 1	Overall Card Dimensions:
    * Width: 100% of parent container (controlled by Grid)
    * Height: Auto (adjusts to content)
    * Max Width: 300px (from the container we added)
* Image Section:
    * Aspect Ratio: 2/3 (height is 1.5x the width)
    * Full width of the card
    * Rounded top corners
* Content Section:
    * Title and year on the same line
    * Rating stars below
    * Genre chips in a row below that
    * Overview text (if shown)
    * Action buttons at the bottom
* Grid Layout:
    * On extra-small screens: 1 column (full width)
    * On small screens: 2 columns
    * On medium screens: 3 columns
    * On large screens: 4 columns


## 5. Data Model

### 5.1 Movie
- id: string (TMDb ID)
- title: string
- overview: string
- release_date: string (ISO format)
- poster_path: string (URL)
- backdrop_path: string (URL)
- genres: Array<{id: number, name: string}>
- runtime: number (minutes)
- vote_average: number
- vote_count: number
- streaming_providers: Array<Provider>

### 5.2 Provider
- provider_id: number
- provider_name: string
- logo_path: string
- type: 'flatrate' | 'rent' | 'buy'

### 5.3 User
- uid: string (Firebase UID)
- email: string
- displayName: string
- photoURL: string
- liked_movies: Array<movie_id>
- disliked_movies: Array<movie_id>
- watchlist: Array<movie_id>

## 6. Future Enhancements

### 6.1 Social Features
- Share movies with friends
- Create and share watchlists
- Follow other users
- See what friends are watching

### 6.2 Advanced Personalization
- Machine learning-based recommendations
- Mood-based movie suggestions
- Watch party feature

### 6.3 Platform Expansion
- Mobile applications (iOS/Android)
- Smart TV applications
- Browser extensions

## 7. Success Metrics
- Number of active users
- Average session duration
- Click-through rate on streaming links
- User retention rate
- Number of movies liked/disliked per user
- Conversion rate for streaming providers

## 8. Assumptions and Constraints
- Reliable internet connection required
- TMDb API rate limits apply
- Streaming availability varies by region
- Some movies may not be available on any streaming platform

## 9. Dependencies
- TMDb API key
- Firebase project configuration
- Domain name and SSL certificate

## 10. Approval

Prepared by: [Your Name]  
Date: July 28, 2025  
Approved by: [Approver's Name]  
Date: [Approval Date]
