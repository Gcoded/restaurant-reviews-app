# Restaurant Reviews - Progressive Web Application
---
## Project Overview:

This project is from Udacity's Mobile Web Specialist Nanodegree program.  I updated the app by converting it from a static webpage to a Progressive Web Application.  The following features were added:

- Responsive on different sized displays and accessible for screen reader use
- Service worker capabilities to create a seamless offline experience
  - Caching of page assets
  - IndexedDB used to store and retrieve restaurant information
- Ability to add a review while online or offline
- Ability to mark a restaurant as a favorite


### To run the code and view the app:

You will need to have [node](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm) installed. Also, the app uses this [server](https://github.com/udacity/mws-restaurant-stage-3) provided by Udacity and the link includes instructions to get it started. Once you have everything installed or running, navigate to this project's folder in your terminal and do the following:

1. Run `npm install` to install all of the dependencies
2. Run `gulp sync` to run the build tasks and open the app in your browser (should be running at http://localhost:8000)
3. Explore the app and test out functionalilty, such as offline use (in Chrome: open Developer Tools -> Network tab -> check the offline box)




