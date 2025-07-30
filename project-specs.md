# Now Playing - Movie Recommendation App

## Project Overview
A React-based movie recommendation application that allows users to discover, rate, and get personalized movie suggestions.

## Key Features

### Pages
1. **Landing Page**
   - Search functionality
   - Category tabs (For You, Oscar Winners, Popular, Critics' Picks)
   - Grid of movie recommendations
   - Displays 5 movie cards by default

2. **Movie Detail Page**
   - Detailed movie information
   - Streaming provider information
   - Cast list
   - Similar movies
   - Rating functionality (thumbs up/down)

3. **Ratings Page**
   - Tabs for Liked and Disliked movies
   - Grid layout of rated movies

### Components

#### Header
- Displays app title and navigation
- User authentication state
- Responsive design

#### SearchBox
- Search input field
- Search button
- Handles search submission

#### RecommendationTabs
- Tabs for different movie categories
- Active tab highlighting
- Category switching functionality

#### MovieCard
- Displays movie poster, title, and rating
- Hover effects
- Click handler for navigation

## Technical Requirements

### Directory Structure
```
/src
├── components/
│   ├── Header/
│   ├── SearchBox/
│   ├── RecommendationTabs/
│   ├── MovieCard/
│   ├── MovieInfoSection/
│   ├── WatchOptions/
│   ├── CastList/
│   └── SimilarMovies/
├── pages/
│   ├── Home/
│   ├── MovieDetail/
│   └── Ratings/
├── services/
├── utils/
└── App.jsx
```

### Styling
- Tailwind CSS for utility-first styling
- Responsive design for all screen sizes
- Consistent color scheme and typography

### Data Management
- TMDB API for movie data
- Local state management for UI state
- Context API for global state (if needed)

## User Flows

### Movie Discovery
1. User lands on the home page
2. Sees recommended movies in a grid
3. Can filter by category using tabs
4. Can search for specific movies

### Movie Rating
1. User views movie details
2. Rates movie using thumbs up/down
3. Rating is saved to their profile
4. Recommendations update based on ratings

## Technical Stack
- React 18+
- React Router v6
- Tailwind CSS
- TMDB API
- React Icons
- React Hot Toast for notifications

## Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

## Testing Strategy
- Unit tests for components
- Integration tests for user flows
- End-to-end tests for critical paths

## Deployment
- Vercel or Netlify for frontend hosting
- Environment-specific configurations
- CI/CD pipeline setup
