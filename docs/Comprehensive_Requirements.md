# Now Playing - Comprehensive Requirements Document

## Table of Contents
1. [Introduction](#1-introduction)
2. [User Interface Requirements](#2-user-interface-requirements)
3. [Functional Requirements](#3-functional-requirements)
4. [Use Cases](#4-use-cases)
5. [Technical Requirements](#5-technical-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Assumptions and Dependencies](#7-assumptions-and-dependencies)
8. [Success Metrics](#8-success-metrics)

## 1. Introduction

### 1.1 Purpose
This document outlines the comprehensive requirements for the "Now Playing" movie application, a platform that helps users discover, explore, and find where to watch movies.

### 1.2 Project Overview
The application integrates with The Movie Database (TMDb) to provide movie information, streaming availability, and personalized recommendations. It offers a clean, responsive interface for browsing, searching, and interacting with movie content.

### 1.2.1 Authentication and Access Control

The application uses Google Authentication via Firebase as the sole method for user login. No other authentication providers (e.g. email/password, phone) are enabled.
Implementation Overview

    Google-only Sign-In is enforced via Firebase Auth.

    On first login, a user profile is created and may be extended in Firestore.

    Authentication state is tracked globally and governs access to app routes.

    Sessions persist using Firebase’s native token and refresh system.

Authenticated Pages

The following pages require the user to be signed in:

    Landing Page (Main Recommendation View): Users enter a favorite movie and receive recommendations.

    Movie Detail Page: Provides detailed metadata about a selected movie.

    User Ratings Page: Displays all movies the user has interacted with via thumbs up/down.

Unauthenticated Pages

The following pages do not require authentication:

    Test Pages (e.g. /test-cards, /test-layouts): Used during development for previewing components such as movie cards or layout structure.

    404 / Fallback Page: Displayed for unknown routes.

Route Access Diagram

graph TD
    A[Google Sign-In Page] --> B[Landing Page<br>(Recommendations)]
    B --> C[Movie Detail Page]
    B --> D[User Ratings Page]

    subgraph Public Pages (No Auth)
        E[Test Pages<br>/test-cards, /test-layouts]
        F[404 / Fallback Page]
    end
Firestore & Storage Usage

    Cloud Firestore is used to store user profile data and movie interaction history.

    Each user’s data lives under /users/{uid}/ratings, keyed by their Firebase Auth uid
    Stack Overflow
    .

    Security rules enforce that a user can only read or write their own data:

match /users/{userId}/ratings/{doc} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

Firebase Storage (if used)

    For any uploaded assets (e.g. custom images), files are stored in Firebase Storage (backed by Google Cloud Storage).

    Access is strictly controlled via Firebase Storage Security Rules, ensuring only authenticated users can read/write their own files
    Firebase+1firebase.blog+1
    .

Best Practices & Compliance

    Avoid placing sensitive data in document IDs or field names (e.g. don’t stringify email within doc IDs)
    Firebase
    .

    Follow Firebase best practices: test security rules regularly, use staging vs production projects, and limit production data access to core team members
    MoldStud
    .

### 1.2.2 Deployment Environment
Hosting via Google

    The app is deployed using Firebase Hosting, powered by Google Cloud Platform (GCP).

    Hosting provides zero-config SSL, global CDN distribution, and optional serverless support (e.g., Cloud Functions or Cloud Run backends)
    Firebase
    .

    Deployment is managed via firebase.json and optionally automated via Cloud Build triggers connected to your GitHub repo
    cloud.google.com
    .

Regional Considerations

    Database and storage resources are provisioned in a specific geographic region or multi-region (e.g. us-west1, us-central1) to balance latency, availability, and cost
    cloud.google.com
    .

    The chosen region should match your primary user base and ensure compliance with residency or performance requirements.


Google Authentication & Data Storage
1. Authentication Flow
Provider: Google OAuth via Firebase Authentication
Implementation:
Users sign in using their Google accounts via a popup
Authentication state is managed by Firebase Auth
The app listens for auth state changes to update the UI accordingly
2. User Data Storage
Database: Firestore (NoSQL database)
Collection: users
Document Structure:
Document ID: User's UID from Firebase Auth
Fields:
likes
: Array of movie IDs the user has liked
dislikes: Array of movie IDs the user has disliked
lastUpdated: Timestamp of the last update
3. Data Usage Across Pages
a) Login Page (/login)
Handles Google sign-in
Creates/updates user document in Firestore upon first sign-in
Stores basic user info (email, display name) from Google profile
b) Landing Page (/)
Displays personalized movie recommendations
Uses user's 
likes
 and dislikes to filter and sort content
Shows "For You" tab with personalized recommendations
c) Movie Details Page (/movie/:id)
Shows like/dislike buttons
Updates user's preferences in real-time
Saves changes to Firestore
d) Liked Movies Page (/liked)
Displays all movies the user has liked
Pulls data from the user's 
likes
 array
Allows removing likes
4. Data Flow
User signs in with Google
App creates/loads user document in Firestore
User interactions (likes/dislikes) update local state
Changes are synced to Firestore
Other components listen for changes and update UI accordingly
5. Security
Firestore Security Rules should be implemented to ensure users can only read/write their own data
Authentication state is managed by Firebase Auth
Sensitive operations require an authenticated user
6. Dependencies
Firebase Authentication (for Google sign-in)
Firestore (for storing user preferences)
React Context API (for state management)
7. Important Considerations
The app uses optimistic UI updates for better user experience
Error handling is in place for failed operations
User preferences are synced across devices in real-time
The app handles offline scenarios gracefully
This architecture ensures a seamless user experience while maintaining data consistency across the application.


    
## 2. User Interface Requirements

### 2.1 Landing Page
- **Search Section**
  - Search input field with placeholder text
  - Blue "Search" button below the input field
  
- **Recommendation Categories**
  - Four category buttons in this order:
    1. For You (default) - Personalized recommendations
    2. Oscar Winners - Award-winning films
    3. Popular - Currently trending movies
    4. Critics' Picks - Highly rated by critics
  - Active category should be visually highlighted
  
- **Movie Display**
  - Grid layout of movie cards (5 movies)
  - Each card shows:
    - Movie poster
    - Title
    - Release year
    - Average rating
    - "Watch Movie" button
    - "Watch Trailer" button that takes the user to a new page and starts the trailer
  - Loading spinner during data fetch
  - Error message display when needed
  - "No results" state when no movies are found
 
    
### 2.1.1 UC-1: View Default Recommendations
**Actor**: User  
**Precondition**: User has opened the application  
**Main Flow**:
1. System loads the landing page
2. System displays loading spinner
3. System fetches personalized recommendations (or popular movies for new users)
5. System displays 5 movie cards in a grid
6. "For You" tab is highlighted by default
7. If a user has no saved ratings, then default to popular movies

#### UC-2: Switch Recommendation Category
**Actor**: User  
**Precondition**: User is on the landing page  
**Main Flow**:
1. User clicks on a different category tab (Oscar Winners, Popular, Critics' Picks)
2. System shows loading state
3. System fetches and displays relevant movies for the selected category
4. Selected tab is visually highlighted

#### UC-3: Search for Movies
**Actor**: User  
**Precondition**: User is on the landing page  
**Main Flow**:
1. User enters search term in the search box
2. User clicks the search button or presses Enter
3. System shows loading state
4. If the search term is available as a valid result, then the user is taken to the movie detail page for that movie
5. If the search term is invalid, meaning there is no title match for the movie then the system will deliver a list of movies that are close in name.
6. If no results, system shows "No movies found" message



### 2.2 Movie Detail Page
- **Movie Information**
  - Large movie poster, left justified
  - movie data, right justified.
  - Title and release year
  - Rating information and run time
  - Genre tags
  - Plot summary
  - Director
  - top three build cast members
  - thumbs up and thumbs down icon that when clicked get saved to the users data
  - text below the thumbs up and down icon that reads "Rate movies to get better recommendations!"
  
- **Watch Options**
  - Available streaming providers with logos, if available
  - if there are no streaming provider options, then show nothing
  - Direct links to watch on provider platforms
  - if there are no direct links to watch on provider platforms, then show nothing
  - Fallback to TMDb page if no direct links available
  
- **Additional Information**
  - Cast members with thumbnails
  - Director and key crew
  - User reviews (if available)
  - Similar movies section

### 2.3 MovieCard Component
- Reusable component used across the application
- Vertical layout (max width ~300px)
- Responsive grid layout
- Hover effects for better interactivity
- Consistent styling and interaction patterns
- Clickable to navigate to movie details

## 3. Functional Requirements

### 3.1 User Authentication
- Email/password registration and login
- Social authentication (Google, Facebook)
- Password reset functionality
- Persistent login session
- Protected routes for authenticated users

### 3.2 Movie Discovery
- Display personalized recommendations based on user preferences
- Show trending/popular movies
- Filter movies by genre, release year, and rating
- Search functionality with auto-suggestions

### 3.3 Movie Details
- Display comprehensive movie information
- Show available streaming options
- Display cast and crew information
- Show similar/recommended movies

### 3.4 User Interaction
- Like/dislike movies
- Add movies to watchlist
- Rate and review movies (future enhancement)
- View watch history
- Get personalized recommendations

## 4. Use Cases

### 4.1 Landing Page

### 4.2 Movie Detail Page

#### UC-4: View Movie Details
**Actor**: User  
**Precondition**: User has selected a movie from the landing page  
**Main Flow**:
1. System loads the movie detail page
2. System displays movie poster, title, and basic info
3. System fetches and displays additional details (cast, streaming options, etc.)
4. User can scroll to view all information

#### UC-5: Watch Movie
**Actor**: User  
**Precondition**: User is on a movie detail page  
**Main Flow**:
1. User clicks "Watch Movie" button
2. System displays available streaming options
3. User selects a streaming provider
4. System opens the movie on the selected provider's platform

### 4.3 User Authentication

#### UC-6: User Registration
**Actor**: New User  
**Precondition**: User is on the login/registration page  
**Main Flow**:
1. User clicks "Create Account"
2. User enters email and password
3. User submits the form
4. System creates new account
5. System logs user in and redirects to landing page

#### UC-7: User Login
**Actor**: Registered User  
**Precondition**: User is on the login page  
**Main Flow**:
1. User enters email and password
2. User clicks "Login"
3. System authenticates credentials
4. On success, system redirects to landing page
5. On failure, system displays error message

## 5. Technical Requirements

### 5.1 Frontend
- React.js for UI components
- React Router for navigation
- Axios for API requests
- Material-UI for UI components
- Responsive design for all screen sizes

### 5.2 Backend
- Firebase Authentication
- Firebase Firestore (for user data)
- TMDb API for movie data

### 5.3 Performance
- Initial page load < 2 seconds
- Image lazy loading
- Efficient state management
- Code splitting for better performance

## 6. Non-Functional Requirements

### 6.1 Performance
- Page load time under 2 seconds
- Smooth animations and transitions
- Efficient API usage to prevent rate limiting

### 6.2 Security
- Secure authentication using Firebase
- Protected routes for authenticated users
- Input validation on all forms
- Secure storage of user credentials

### 6.3 Usability
- Intuitive navigation
- Clear visual hierarchy
- Accessible design (WCAG 2.1 AA compliance)
- Clear error messages

## 7. Assumptions and Dependencies

### 7.1 Assumptions
- Users have a modern web browser
- Reliable internet connection is available
- TMDb API is accessible and within rate limits
- Streaming availability may vary by region

### 7.2 Dependencies
- TMDb API for movie data
- Firebase for authentication and data storage
- Material-UI for UI components
- React and React DOM
- React Router for navigation

## 8. Success Metrics
- User engagement (time spent, pages per session)
- Number of movies viewed
- User retention rate
- Search success rate
- Conversion rate (visitors to registered users)
- Error rates and crash reports
