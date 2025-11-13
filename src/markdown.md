# BookSnap: App Workflow and Features

## 1. Overview

BookSnap is a mobile-first web application designed to help users discover, track, and discuss their reading. Users can find books by searching for them manually or by scanning a physical book cover using their device's camera. They can then organize these books into personal library shelves: "Want to Read," "Reading," and "Finished." The app features a rich discussion section for each book and is integrated with Firebase for user authentication and data persistence. It also uses Genkit AI flows for features like book title extraction (OCR), recommendations, and username generation.

## 2. Core Features

### 2.1. Book Discovery

- **Manual Search:** Users can search for books by title or author. The app fetches live data from the Open Library API to provide real-time search results.
- **AI-Powered Book Scanning:** Users can either use their device's camera to take a picture of a book cover or upload an existing image. An AI-powered OCR flow extracts the book's title from the image and automatically initiates a search for it.

### 2.2. Personal Library Management with Firebase

- **User Authentication:** Users can sign up or log in using email/password or their Google account, powered by Firebase Authentication.
- **Persistent Library:** A user's library is stored in Firestore, ensuring their collection is saved and accessible across devices.
- **Three Reading Shelves:** Users can add any book to one of three shelves:
  - **Want to Read:** A wishlist for future reads.
  - **Reading:** Books the user is currently reading.
  - **Finished:** Books the user has completed.
- **Progress Tracking:** For books on the "Reading" shelf, users can track their progress with a slider. Setting the progress to 100% automatically moves the book to the "Finished" shelf.

### 2.3. AI-Powered Features

- **AI Recommendations:** On each book's detail page, users can get 3-5 personalized book recommendations based on the current book's title, author, and genres. Each recommendation includes the book's cover for better visual discovery.
- **AI Summary:** An "AI Corner" on the book detail page allows users to generate a concise summary or a relevant quote for the book.
- **AI Username Generation:** During profile setup, users can generate creative, book-themed usernames with the click of a button.

### 2.4. Profile Customization

- **Complete Profile Flow:** New users are guided through a profile completion process where they must choose a username and an avatar.
- **Avatar Selection:** Users can pick from a set of pre-defined avatars or upload their own image, which they can crop to a square.
- **Profile Management:** Logged-in users can visit their profile page to view their details, edit their profile, or sign out.

### 2.5. Community and Discussion

- **Threaded Discussions:** Each book has its own discussion section where users can post comments and reply to others, creating threaded conversations.
- **Anonymous Posting:** To encourage open conversation, signed-in users have the option to post any comment or reply anonymously.
- **Voting System:** Users can up-vote or down-vote comments and replies to highlight the most insightful or helpful contributions. Comments are ranked by their score.
- **Comment Deletion:** Users have the ability to delete their own comments or replies.

### 2.6. Progressive Web App (PWA)

- **Installable Experience:** BookSnap is a fully-featured PWA, meaning it can be "installed" directly onto a user's home screen from their browser.
- **Offline Access:** Thanks to service workers, key parts of the app can be cached and remain accessible even without a reliable internet connection.
- **App-like Feel:** When launched from the home screen, the app runs in its own window, providing a full-screen, native-like experience without the browser's address bar.

## 3. Application Workflow

### 3.1. Authentication and Profile Setup

1.  A new user can **Sign Up** via email or Google.
2.  After signing up, they are redirected to the **/auth/complete-profile** page.
3.  Here, they can choose an avatar and either enter a username manually or use the AI to **generate a book-related one**.
4.  Once the profile is complete, they are taken to their library.
5.  Existing users can **Log In** and will be redirected to their library if their profile is complete.

### 3.2. Home Page (`/`)

- **Entry Point:** The landing page features a clean design with floating book covers.
- **Primary Actions:** It presents two clear calls to action: "Search a Book" and "Scan a Book."

### 3.3. Scan Flow (`/scan`)

1. The user navigates to the Scan page, which requests camera access. The back camera is used by default.
2. The user can **flip the camera**, **upload a photo**, or **capture an image** of a book cover.
3. The image is sent to an AI flow that performs OCR to **extract the title**.
4. The user is automatically redirected to the **/search** page with the extracted title as the query, allowing them to see the search results and select the correct book.

### 3.4. Search & Book Details (`/search` and `/book/[id]`)

1.  From the search page, the user can type a query to find books.
2.  Tapping a book leads to the **Book Detail page**, showing the cover, title, author, rating, description, and genres.
3.  A logged-in user can use the **"Add to Library"** dropdown to save the book to their "Want to Read," "Reading," or "Finished" shelf.
4.  If the book is on the "Reading" shelf, a **progress tracker** is visible.
5.  The page also features a **Discussion** section and a section for **Recommendations**.

### 3.5. My Library & Profile (`/library` and `/profile`)

1.  The **/library** page shows a logged-in user's books, organized into three tabs. If the user is not logged in, they are prompted to do so.
2.  The **/profile** page displays the user's avatar, username, and email. It provides options to edit the profile or sign out. If a guest visits this page, they are presented with options to sign up, log in, or continue browsing as a guest.
