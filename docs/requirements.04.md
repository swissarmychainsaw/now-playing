

NOW PLAYING – LANDING PAGE REFACTOR FOR AI BUILD

lready in Your Version
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



COMPONENT: Header
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

COMPONENT: SearchBox
Purpose: Provides search functionality for movies Props: onSearch
User Story: As a user, I want to type a movie name and hit Enter or click Search to view results.
Layout: [ Search movies... ] [ Search ]
AI Prompt Example: Build a React component called SearchBox using Tailwind.
* A text input with the placeholder “Search movies...”
* A blue Search button centered below the input
* When the user hits Enter or clicks Search, the component should call onSearch(term)

COMPONENT: RecommendationTabs
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

PAGE: LandingPage
Purpose: Displays the search box, category tabs, and a grid of 5 movie recommendations Includes: Header, SearchBox, RecommendationTabs, MovieCard grid
Initial behavior:
* If the user has rated movies, show personalized “For You” content
* If not, show “Popular” as the default fallback
AI Prompt Example: Assemble a React component called LandingPage using the following:
* Header at the top
* SearchBox in the center
* Below that, RecommendationTabs
* Below that, a responsive grid showing 5 MovieCard components On page load, fetch and show a list of recommended movies. Show a loading spinner during fetch. When a MovieCard is clicked, navigate to /movie/:id. If a user searches for a movie, redirect to the matching detail page or show close results.

Great. Here is the next section of your requirements, rewritten in AI-optimized, plain-text format: Movie Detail Page and its components.

MOVIE DETAIL PAGE – REFACTOR FOR AI BUILD

PAGE: MovieDetailPage
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

COMPONENT: MovieInfoSection
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

COMPONENT: WatchOptions
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




