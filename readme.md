# Wallipy

Wallipy is a React application that fetches and displays images from various subreddits. Users can save and like images, search a custom subreddit, and manage their liked posts. Authenticated users can also toggle the display of NSFW content.

![anime]()
![aiengine]()
![wallpaper]()
![custom]()

## Features

- Fetches and displays images from different subreddits.
- Supports different categories of subreddits, including anime, AI engines, and wallpapers.
- Allows searching for a custom subreddit.
- Displays images randomly and filters NSFW content based on user preferences.
- Allows users to log in and log out using Auth0 authentication.
- Allows authenticated users to save and like images.
- Provides a Liked Posts section for authenticated users to manage their liked posts.
- Downloads images upon user request.

## Installation

1. Clone the repository:
```
git clone https://github.com/tricticle/wallipy
```
2. Navigate to the project directory:
```
cd wallipy
```
3. Install the dependencies:
```
npm install
```
## Usage

1. Start the development server:


The application will be available at [http://localhost:3000](http://localhost:3000).

2. Log in to access the full functionality of the application.

3. Choose a category or enter a custom subreddit to fetch and display images.

4. Toggle the "Show NSFW" option to filter NSFW content.

5. Save images by clicking the "Save" button.

6. Like images by clicking the "Like" button. Liked images will be stored and can be managed in the Liked Posts section.

7. Download images by clicking the "Save" button and selecting the download option.

8. Log out to exit the application.

## Dependencies

The application relies on the following dependencies:

- React: A JavaScript library for building user interfaces.
- react-hooks/exhaustive-deps: A React lint rule plugin to ensure exhaustive dependencies for `useEffect` hooks.
- @auth0/auth0-react: An SDK for integrating Auth0 authentication into React applications.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

All credits for the artwork go to the talented creators on [Reddit](https://www.reddit.com/).
