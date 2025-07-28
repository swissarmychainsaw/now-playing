# Now Playing - Business Requirements Document (v3)

## 1. Project Overview
Now Playing is a modern web application that provides movie recommendations and information using data from The Movie Database (TMDb) API. The application features personalized recommendations, search functionality, and detailed movie information.

## 2. User Interface Requirements

### 2.1 Landing Page
- **Search Section**
  - Search input field with placeholder text
  - Blue "Search" button below the input field
  
- **Recommendation Categories**
  - Four category buttons in this order:
    1. For You (default)
    2. Oscar Winners
    3. Popular
    4. Critics' Picks
  - Active category should be visually highlighted
  
- **Movie Display**
  - Grid layout of movie cards (5 movies)
  - Each card shows:
    - Movie poster
    - Title
    - Release year
    - Average rating
    - "Watch Movie" button
  - Loading spinner during data fetch
  - Error message display when needed

### 2.2 Movie Detail Page
- Movie poster
- Title and release year
- Overview/description
- Genres
- Runtime
- Cast members
- "Watch Movie" button linking to TMDb provider
- Back button

### 2.3 MovieCard Component
- Reusable component used across the application
- Vertical layout (max width ~300px)
- Responsive grid layout
- Consistent styling and interaction
- Clickable to navigate to movie details

## 3. Functional Requirements

### 3.1 Authentication
- Public access to movie details
- Protected routes for user-specific features
- User context management

### 3.2 Movie Recommendations
- **For You**
  - Based on user's liked movies
  - Shows 5 recommended movies
  - Excludes already liked/seen movies
  
- **Oscar Winners**
  - High-rated award-winning movies
  - Minimum 7.5 rating
  - Minimum 1000 votes
  - English language
  - Released after 2000
  
- **Popular**
  - Currently trending movies
  - Sorted by popularity
  - Minimum 6.0 rating
  - Minimum 50 votes
  
- **Critics' Picks**
  - Top-rated movies by critics
  - Minimum 100 votes
  - Released after 2015

### 3.3 Search Functionality
- Search by movie title
- Case-insensitive search
- Results update on button click
- Display loading state during search
- Show appropriate message for no results

## 4. Technical Requirements

### 4.1 Frontend
- React 18+
- React Router v6 for navigation
- Material-UI (MUI) for UI components
- Axios for API requests
- Context API for state management
- Responsive design

### 4.2 Backend Integration
- TMDb API v3
- API key configuration via environment variables
- Error handling for API failures
- Rate limiting consideration

### 4.3 State Management
- Loading states for all async operations
- Error handling and display
- User authentication state
- Movie recommendation state

### 4.4 Performance
- Lazy loading of components
- Image optimization
- Efficient API calls
- Caching where appropriate

## 5. Data Models

### 5.1 Movie
```typescript
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
  videos: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }>;
  };
}
```

### 5.2 User
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  likedMovies: number[];
  watchedMovies: number[];
}
```

## 6. API Integration

### 6.1 TMDb API Endpoints
- Base URL: `https://api.themoviedb.org/3`
- Required Headers:
  - `Authorization: Bearer <api_key>`
  - `Content-Type: application/json`

### 6.2 Key Endpoints
- `GET /discover/movie` - Discover movies by criteria
- `GET /movie/{movie_id}` - Get movie details
- `GET /search/movie` - Search for movies
- `GET /movie/popular` - Get popular movies
- `GET /movie/top_rated` - Get top rated movies

## 7. Environment Variables
```env
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

## 8. Error Handling
- Network errors
- API rate limits
- Invalid API responses
- Missing data
- Authentication failures

## 9. Testing Requirements
- Unit tests for utility functions
- Component tests for UI components
- Integration tests for API calls
- End-to-end tests for critical user flows

## 10. Deployment
- Firebase Hosting
- Environment-specific configurations
- Build optimization
- Performance monitoring

## 11. Future Enhancements
- User profiles
- Watchlists
- Social features
- Offline support
- Dark mode
- Internationalization

## 12. Dependencies
- React 18+
- React Router 6+
- Material-UI 5+
- Axios
- Firebase (for authentication)
- date-fns (for date manipulation)

## 13. Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with required variables
4. Start development server: `npm start`
5. Build for production: `npm run build`

## 14. Known Issues
- [ ] Loading spinner may get stuck in some edge cases
- [ ] Recommendation buttons need testing with various user states
- [ ] Error handling could be more user-friendly

## 15. Change Log

### v3.0.0 (Current)
- Complete rewrite of recommendation engine
- Improved error handling and loading states
- Added comprehensive documentation

### v2.0.0
- Added user authentication
- Implemented personalized recommendations
- Enhanced UI/UX

### v1.0.0
- Initial release
- Basic movie search and display
- Static recommendations
