# Nimbus: Simplified Cloud Storage

**Nimbus** is a personal project aimed at making file storage and management straightforward and accessible. By focusing on the essentials, it provides a reliable and efficient way to upload, access, and share files without unnecessary complexity.

---

## 🚀 Tech Stack
Nimbus is built using modern technologies for simplicity and functionality:
- **React 19**: For building dynamic user interfaces.
- **Next.js 15**: Provides server-side rendering for better performance.
- **Appwrite**: Manages authentication, database, and file storage.
- **TailwindCSS**: Ensures clean, responsive design with utility-first CSS.
- **ShadCN**: Helps maintain consistent and reusable UI components.
- **TypeScript**: Adds type safety for fewer bugs and cleaner code.

---

## 🔑 Features
Nimbus focuses on the core functionalities that make file storage easier:
- **Authentication**: Sign up, log in, and log out securely using Appwrite.
- **File Uploads**: Quickly upload documents, images, audio, and video files.
- **File Management**: View, rename, and delete files effortlessly.
- **Downloads**: Retrieve files with one click.
- **File Sharing**: Share uploaded files with others easily.
- **Dashboard Insights**: See storage usage, recent uploads, and file summaries.
- **Global Search**: Find files quickly across all uploads.
- **Sorting**: Organize files by date, name, or size.
- **Responsive Design**: Works well on both desktop and mobile devices.

---

## 🛠 Quick Start

### Prerequisites
Ensure the following tools are installed:
- **Git**
- **Node.js**
- **npm** (or **yarn**)

---

### 📂 Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/JavaScript-Mastery-Pro/storage_management_solution.git
   cd storage_management_solution
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
    - Create a `.env.local` file in the project root.
    - Add the following:
      ```env
      NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
      NEXT_PUBLIC_APPWRITE_PROJECT=""
      NEXT_PUBLIC_APPWRITE_DATABASE=""
      NEXT_PUBLIC_APPWRITE_USERS_COLLECTION=""
      NEXT_PUBLIC_APPWRITE_FILES_COLLECTION=""
      NEXT_PUBLIC_APPWRITE_BUCKET=""
      NEXT_APPWRITE_KEY=""
      ```
    - Replace placeholders with your Appwrite credentials.

4. **Run the Project**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Improvements for Future Versions
Nimbus is functional, but there’s room for improvement:
1. **File Versioning**: Add a version history for uploaded files.
2. **Tagging**: Allow users to tag files for better organization.
3. **Better Sharing Options**: Provide links with expiration dates or access levels.
4. **Offline Support**: Introduce offline access with Progressive Web App (PWA) features.
5. **Notifications**: Notify users of large uploads, errors, or shared file updates.
6. **Customizable UI**: Let users tweak themes or layouts to fit their preferences.

---

## 📂 Explore More
- Check out my other projects at [m4rkyu.com](https://m4rkyu.com).
- Star the project on GitHub: [Nimbus Repository](https://github.com/JavaScript-Mastery-Pro/storage_management_solution).

---

Nimbus is a simple solution for anyone who wants to manage files without the hassle of complex systems. It’s lightweight, personal, and focused on making storage easier.