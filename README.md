# 🤖 AI CV & Project Evaluator (Rakamin Mini Project)

This backend service automatically evaluates a candidate’s **CV** and **Project Report** using an **LLM + RAG** (Retrieval-Augmented Generation) pipeline.  
It retrieves relevant context from ground-truth documents (Job Description, Case Study Brief, and Scoring Rubrics) and produces a **structured JSON result** and a **final PDF report**.

---

## 🧱 Tech Stack

| Component | Technology Used |
|------------|-----------------|
| Backend Framework | Node.js + Express |
| Job Queue | BullMQ + Redis |
| Vector Database | Weaviate |
| Embedding & LLM | Google Gemini API |
| PDF Processing | pdfjs-dist, pdfkit |
| Containerization | Docker Compose |
| Report Generation | PDFKit (dynamic PDF) |

---

## 🚀 Features Overview

- **RAG Ingestion Pipeline** — using Weaviate + Gemini Embeddings.  
- **Ground-truth PDF Generator** — generates Job Description, Case Brief, and Rubrics automatically.  
- **Asynchronous Job Handling** — via BullMQ worker queue.  
- **Weighted Scoring System** — computes fair averages based on rubric weights.  
- **Deterministic LLM Prompting** — ensures consistent structured JSON outputs.  
- **PDF Report Export** — generates a candidate evaluation report in human-readable format.

---

## ⚙️ Getting Started

### **1. Clone the Repository**

```bash
git clone https://github.com/yogadep/ai-cv-evaluator.git
cd ai-cv-evaluator

set env

docker compose build







