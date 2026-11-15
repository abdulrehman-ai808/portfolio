# Abdul Rehman — Portfolio Website

> Modern, bright, and minimal personal portfolio highlighting academic journey at **Jain University**, verified **LinkedIn Learning certifications**, and a zero-dependency Python REST server for contact form inquiries.

---

## 🌟 Features

- **LinkedIn Learning Certifications**:
  - **Learning Graph Neural Networks** (Sep 29, 2026) · ID: `f822939f7887c44af2f3821a2444f1582e227d0e4cc332595b326afef66f1d7b`
  - **Programming Foundations: Discrete Mathematics** (Sep 29, 2026) · ID: `effad5aba6eed140fe6ecf1d1c7af7d367df37a44c6c3fc1a6b008d08dbcc53c`
  - Interactive Lightbox Modal for high-definition certificate inspection.
  - 1-Click Copy Credential ID and direct verification links.
- **Academic Focus (Jain University)**:
  - Bento Grid layout showcasing computer science foundations, discrete mathematics, and neural representations.
- **Interactive Contact Form & Local REST API**:
  - `POST /api/contact` handles form submissions asynchronously without page reloads.
  - Submissions are persistently stored in `contacts.json`.
  - Built-in Inquiries Inbox Modal with live message count badge and message review/deletion.
- **Simple, Bright & Minimal UI/UX**:
  - Built with clean HTML5, custom CSS, and vanilla JavaScript.
  - Typography using **Plus Jakarta Sans** and **JetBrains Mono**.
  - Fully responsive across desktop, tablet, and mobile.

---

## 📂 Project Structure

```text
abdul-rehman-portfolio/
├── assets/
│   ├── css/
│   │   └── style.css              # Bright, modern minimal stylesheet
│   ├── js/
│   │   └── app.js                 # Lightbox, copy helpers, contact form AJAX
│   └── images/
│       ├── cert-gnn.jpg           # Learning Graph Neural Networks certificate
│       └── cert-discrete-math.jpg # Discrete Mathematics certificate
├── index.html                     # Main portfolio page
├── server.py                      # Python HTTP server & REST API
├── contacts.json                  # Inquiries datastore
└── README.md
```

---

## 🚀 Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/abdulrehman-ai808/portfolio.git
   cd portfolio
   ```

2. **Start the local server**:
   ```bash
   python server.py
   ```

3. **Open in browser**:
   ```
   http://localhost:8080
   ```
   *(If port 8080 is busy, the server automatically selects 8081, 8082, etc.)*
