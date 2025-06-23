# Frontend Documentation

### 📚 Table of Contents

- [Overview](#-overview)
- [❓ What's Included?](#-whats-included)
- [🖇️ Core Dependencies](#️-core-dependencies)
- [🗂️ Project Structure](#️-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Run with Docker manually](#run-with-docker-manually)
    - [Explanation of the Run Command:](#explanation-of-the-run-command)
  - [Run with Docker compose](#run-with-docker-compose)
- [💡 Scripts](#-scripts)
- [📝 License](#-license)

## Overview

This document provides an in-depth explanation of the architecture and organization of the frontend system. The system is modular and scalable, designed for maximum reuse of components and services across different modules.

## ❓ What's Included?

- [x] Authentication: Provides a secure login system for users.
- [x] Authorization: Implements role-based access control to manage user permissions.
- [x] Multiple Language: Supports localization and enables users to switch between different languages.
- [x] Form Validation: Includes form validation functionality to ensure data integrity and improve user experience.
- [x] Error Handling: Handles and displays error messages in a user-friendly manner.
- [x] API Integration: Integrates with external APIs to fetch data and provide dynamic content.
- [ ] Theme (Light/Dark/System): Offers a choice of light, dark, or system-based theme for a personalized user experience.
- [ ] Responsive Design: Ensures the application is optimized for various screen sizes and devices.
- [ ] Testing: Includes a test suite with unit tests and integration tests for reliable code quality.
- [ ] Documentation: Provides comprehensive documentation to guide developers and users.

## 🖇️ Core Dependencies

[&#8593; Back to top](#-table-of-contents)

| Library     | Version                                                          | Description                                                                           |
| ----------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Vue         | ![Vue](https://img.shields.io/badge/%5E3.5.13-blue.svg)          | A progressive JavaScript framework for building user interfaces.                      |
| Vite        | ![Vite](https://img.shields.io/badge/%5E6.3.5-blue.svg)          | Next-generation frontend build tooling for fast and efficient development.            |
| Vue Router  | ![Vue Router](https://img.shields.io/badge/%5E4.5.1-blue.svg)    | Official router for Vue.js, used for managing application routes.                     |
| Vue i18n    | ![Vue i18n](https://img.shields.io/badge/%5E9.14.4-blue.svg)     | Internationalization plugin for Vue.js applications, enabling multi-language support. |
| Pinia       | ![Pinia](https://img.shields.io/badge/%5E3.0.3-blue.svg)         | An intuitive store for Vue.js applications, providing centralized state management.   |
| Axios       | ![Axios](https://img.shields.io/badge/%5E1.10.0-blue.svg)        | Promise-based HTTP client for making API requests.                                    |
| UnoCSS      | ![Tailwind CSS](https://img.shields.io/badge/%5E66.2.3-blue.svg) | A highly customizable CSS framework for rapid web development.                        |
| VeeValidate | ![VeeValidate](https://img.shields.io/badge/%5E4.15.1-blue.svg)  | Painless Vue form.                                                                    |
| Zod         | ![Zod](https://img.shields.io/badge/%5E3.25.67-blue.svg)         | Schema validation with static type inference.                                         |

## 🗂️ Project Structure

```
frontend/
├── public/                 # Static assets
├── src/                    # Source code
│   ├── assets/             # Images, icons, etc.
│   ├── components/         # Vue components
│   ├── modules/            # Pages (used in routing)
       ├── auth
       ├── worklog
       ├── ...
│   ├── router/             # Vue Router configuration
│   ├── stores/             # Pinia stores
│   ├── middleware/         # Route middlewares
│   ├── locales/            # i18n translations
│   ├── App.vue             # Root component
│   └── main.ts             # Entry point
├── vite.config.js          # Vite configuration
├── uno.config.js           # UnoCSS config
└── package.json            # Project dependencies and scripts
```

### Modules

- **Purpose**: Each module is self-contained and encapsulates specific features or domains. It follows a consistent template to ensure uniformity and scalability.

  #### Module Template:

  Each module directory contains:

  - **Locale**: Translations for the module
  - **Components**: Reusable Vue components specific to the module
  - **Pages**: Vue components representing pages in the module
  - **Layouts (optional)**: Custom layouts for module pages
  - **Services**: API calls and business logic related to the module
  - **Store**: Module-specific state management using **Pinia**
  - **Middleware (optional)**: Route guards or logic executed before entering module routes
  - **Utils (optional)**: Module-specific utilities
  - **Constants**: Module-specific constants
  - **Style**: Local styles for the module

---

## Module Communication

- **Limit Direct Communication:**  
  To maintain a clean architecture, avoid direct communication between modules through nested imports. This practice can lead to messy code and disrupt the independent functionality of each module.

- **Use Shared Module for Communication:**  
  Instead of relying on direct imports, facilitate communication between modules via the Store in the Shared module. This approach promotes consistency and maintains the independence of each module's features.

#### Benefits of This Approach:

1. **Improved Maintainability:**  
   By centralizing communication, it becomes easier to manage and modify module interactions without affecting the overall architecture.

2. **Encapsulation of Features:**  
   Each module can evolve independently, allowing for the development of features without the risk of unintentional side effects on other modules.

3. **Enhanced Testing:**  
   Isolated modules with defined communication paths make it easier to test functionalities in isolation, ensuring reliability and reducing complexity.

4. **Scalability:**  
   As your application grows, maintaining clear communication channels will help manage complexity and scale the system more effectively.

## 🚀 Getting Started

### Prerequisites

[&#8593; Back to top](#-table-of-contents)

1. [Node Js](https://nodejs.org/en/) version `v20+`. The current Long Term Support (LTS) release is an ideal starting point.
2. [Visual Studio Code](https://code.visualstudio.com/download). Visual Studio Code is the free and open-sourced code editor. It is one of the top most editor used especially for JavaScript application development.

   **Recommended Plugin for VSCode**

   - [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
   - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
   - [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
   - [Prettier ESLint](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint)
   - [Auto Rename Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag)
   - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
   - [Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph)
   - [GitLens — Git supercharged](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)

### Environment config

Need to prefix VITE\_

```
VITE_APP_PORT=3008
VITE_BASE_API_URL={api-endpoint}
...
```

## 💡 Scripts

The following scripts are available:

| Script            | Action                                                               |
| ----------------- | -------------------------------------------------------------------- |
| `nvm use`         | Ensure that you're using the correct Node.js version for the project |
| `npm install`     | Installs the project dependencies.                                   |
| `npm run dev`     | Runs the application in development mode.                            |
| `npm run build`   | Builds the production-ready optimized bundle.                        |
| `npm run preview` | Starts the preview server using Vite.                                |
| `npm run lint`    | Runs ESLint to lint the project files and fix any issues.            |
| `npm run format`  | Formats the source code using Prettier.                              |
