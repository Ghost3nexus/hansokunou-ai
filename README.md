# HAN-NO (販促脳.AI) - E-commerce Marketing Automation System

HAN-NO (販促脳.AI) is an AI-powered E-commerce marketing automation system. The project automates the creation of marketing strategies for online businesses by analyzing website content and social media trends, then generating actionable marketing proposals using GPT technology.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend](#backend)
- [Frontend](#frontend)
- [Contributing](#contributing)
- [License](#license)

## Overview

HAN-NO enables E-commerce marketers and business owners to:

1. Extract and analyze relevant data from their websites
2. Understand current social media trends related to their products/services
3. Receive AI-generated marketing proposals tailored to their business needs
4. Organize marketing information in Notion for easy access and collaboration
5. Get real-time notifications about new marketing insights via Slack

The system serves as a virtual marketing assistant, reducing the time and expertise needed to develop effective E-commerce marketing strategies while leveraging the latest AI capabilities.

## Project Structure

The project is organized into five main systems that work together in a pipeline architecture:

1. **HTML Parsing System**: Extracts structured data from E-commerce websites
2. **SNS Analysis System**: Analyzes social media platforms to identify trends and consumer sentiment
3. **GPT Proposal Generation System**: Processes gathered data to generate marketing strategies
4. **Notion Integration System**: Stores and organizes generated marketing plans
5. **Slack Notification System**: Delivers real-time alerts about new marketing insights

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Ghost3nexus/hansokunou-ai.git
   cd hansokunou-ai
   ```

2. Set up the backend and frontend (see respective sections below)

## Backend

The backend is built with FastAPI, providing a robust API for the frontend to interact with the AI systems.

### Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Running the Backend

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## Frontend

The frontend is built with Next.js, providing a modern and responsive user interface.

### Setup

```bash
cd frontend
npm install  # or yarn install
```

### Running the Frontend

```bash
npm run dev  # or yarn dev
```

The application will be available at http://localhost:3000

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
