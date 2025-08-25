# Student-Management-System
A modern student management system built with React and Firebase. This responsive web app allows for easy CRUD operations on student records. It's a comprehensive final project demonstrating single-page application design, real-time database use, and a clean UI/UX.
# Student Management System

A modern, responsive web application for managing student records. Built with React and Firebase, this system provides a clean and efficient interface for administrators to perform CRUD (Create, Read, Update, Delete) operations on student data. This project serves as a comprehensive final year project for university students, demonstrating key principles of modern web development, including single-page applications, real-time database integration, and responsive UI/UX design.

---



## ✨ Key Features

* **Add New Students:** Easily add new students to the system through an intuitive modal form with input validation.
* **View Student List:** All students are displayed in a clean, organized, and responsive table.
* **Search & Filter:** Instantly search for students by name, email, or student ID with a real-time search bar.
* **Edit Student Information:** Update any student's details seamlessly. The changes are reflected instantly.
* **Delete Students:** Remove student records from the database with a confirmation step to prevent accidental deletions.
* **Real-time Database:** Powered by Firebase Firestore, all data is synchronized in real-time across all sessions.
* **Fully Responsive:** The user interface is designed to work flawlessly on desktops, tablets, and mobile devices.
* **Modern UI/UX:** Built with Tailwind CSS for a professional and aesthetically pleasing design.

---

## 🛠️ Technologies Used

* **Frontend:**
    * [**React**](https://reactjs.org/) - A JavaScript library for building user interfaces.
    * [**Tailwind CSS**](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
    * [**Lucide React**](https://lucide.dev/) - A beautiful and consistent icon library.

* **Backend & Database:**
    * [**Firebase Firestore**](https://firebase.google.com/docs/firestore) - A flexible, scalable NoSQL cloud database for real-time data synchronization.
    * [**Firebase Authentication**](https://firebase.google.com/docs/auth) - Used for secure, anonymous user sessions to manage data ownership.

---

## ⚙️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (version 14 or later)
* npm or yarn package manager
* A Firebase account (you can create one for free)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/student-management-system.git](https://github.com/your-username/student-management-system.git)
    cd student-management-system
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or if you use yarn:
    ```bash
    yarn install
    ```

3.  **Set up Firebase:**
    * Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    * In your project, create a new **Web App**.
    * Copy the `firebaseConfig` object provided.
    * Create a `.env.local` file in the root of your project directory.
    * Add your Firebase configuration to the `.env.local` file like this:
        ```
        REACT_APP_FIREBASE_CONFIG='{"apiKey": "AIza...", "authDomain": "your-project-id.firebaseapp.com", "projectId": "your-project-id", "storageBucket": "your-project-id.appspot.com", "messagingSenderId": "...", "appId": "..."}'
        ```
    * Go to the **Firestore Database** section in your Firebase project and create a database. Start in **test mode** for easy setup (you can configure security rules later).

4.  **Run the application:**
    ```bash
    npm start
    ```
    This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
