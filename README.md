# 🌍 GeoNotes: A Location-Aware Note-Taking Web Application

**Author:** Aditya Saxena  
**Course:** Modern Web Development  
**Institution:** Department of Computer Science, Loyalist College  
**Email:** aditya.saxena@torontomu.ca  
**Date:** May 30, 2025

---

## 📘 Project Overview

GeoNotes is a progressive web application (PWA) designed to let users take notes that are tagged with their current geographical location. This lightweight web app demonstrates how modern browser APIs can be combined to build a feature-rich, offline-capable note-taking solution without requiring any backend server.

---
## 🎥 Demo Video

Watch a quick demo of GeoNotes in action:  
[![Demo Video](https://img.youtube.com/vi/placeholder/0.jpg)](screenshots/Screen%20Recording%202025-05-31%20at%2012.38.45%20AM.mov)

Thanks
---
## 🧠 Learning Objectives

Students and developers will:

- Understand and implement Geolocation, LocalStorage, IndexedDB, and Service Worker APIs.
- Learn how to manage browser permissions and user consent using the Permissions API.
- Enhance UX with Notifications, Clipboard, Network Info, Speech Recognition, and Battery Status APIs.
- Build a modular, offline-first client-side application.

---

## 🚀 Features

- 🌐 Geolocation-based tagging of notes  
- 💾 Dual storage with `localStorage` and `IndexedDB`  
- 🔕 Notification alerts when near a saved location  
- 📋 One-click copy using Clipboard API  
- 🎤 Voice-to-text note creation via SpeechRecognition  
- ⚡ Battery-aware operation with Battery Status API  
- 🛰 Offline-first support with Service Worker  
- 🌐 Adaptive UI based on network status  

---

## 🧩 Architecture

The app follows a purely front-end architecture using:

- HTML5 + CSS3
- Vanilla JavaScript
- Browser-native APIs (no external libraries)

Architecture Diagram:  
![System Architecture](geonotes_architecture.png)

---

## 🛠 Browser APIs Used

| API Name | Purpose |
|----------|---------|
| **Geolocation** | Fetch user’s current location |
| **LocalStorage** | Simple key-value storage for fast access |
| **IndexedDB** | Scalable database for structured queries |
| **Notifications** | Location-based alerts and reminders |
| **Clipboard** | One-click copy functionality |
| **Permissions** | Manage API access control |
| **Network Information** | Detect offline/online mode |
| **Speech Recognition** | Voice-to-text note entry |
| **Battery Status** | Prevent heavy operations during low battery |
| **Service Worker** | Offline caching and PWA features |

---

## 📦 Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/profadityasaxena/GeoNotes---Browser-API-Tutorial.git
   cd GeoNotes---Browser-API-Tutorial
# GeoNotes---Browser-API-Tutorial
