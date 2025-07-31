# Now Playing - Movie Recommendation App

A modern, responsive movie recommendation application built with React, Firebase, and the TMDB API. Rate movies, get personalized recommendations, and discover new films.

## Features

- 🔐 **Authentication**: Sign in with Google or email/password
- ⭐ **Rate Movies**: Rate movies on a 5-star scale
- ❤️ **Like/Dislike**: Quick thumbs up/down rating
- 🎬 **Movie Details**: View detailed information about movies
- 🔄 **Real-time Updates**: See your ratings update in real-time
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React 18, Vite, React Router
- **Styling**: Tailwind CSS
- **Backend**: Firebase Authentication, Firestore
- **APIs**: The Movie Database (TMDB) API
- **Deployment**: Vercel, Netlify, or Firebase Hosting

## Prerequisites

- Node.js 16+ and npm/yarn
- Firebase account
- TMDB API key
- Google OAuth credentials (for Google Sign-In)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/now-playing.git
   cd now-playing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_TMDB_API_KEY=your_tmdb_api_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Set up Firebase**
   - Create a new Firebase project
   - Enable Authentication (Email/Password and Google Sign-In)
   - Set up Firestore database with the following security rules:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{userId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
           match /ratings/{movieId} {
             allow read, write: if request.auth != null && request.auth.uid == userId;
           }
         }
       }
     }
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── context/         # React context providers
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # API and service functions
├── utils/           # Utility functions
├── App.jsx          # Main App component
└── main.jsx         # Application entry point
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for the movie data
- [Firebase](https://firebase.google.com/) for authentication and database
- [React Icons](https://react-icons.github.io/react-icons/) for the icon set
