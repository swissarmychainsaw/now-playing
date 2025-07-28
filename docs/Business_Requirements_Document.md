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
- Hosting on Netlify or Vercel
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
