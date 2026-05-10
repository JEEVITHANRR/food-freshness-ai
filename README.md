---
title: FreshAI-Backend
emoji: 🍃
colorFrom: green
colorTo: emerald
sdk: docker
app_port: 7860
---

# FreshAI Backend (FastAPI)

This is the production-grade AI backend for the FreshAI dashboard.

### Deployment on Hugging Face:
1. Create a new **Space**.
2. Select **Docker** as the SDK.
3. Choose the **Blank** template or simply upload these files.
4. Set your `GEMINI_API_KEY` in the Space **Settings > Variables and secrets**.

### Connection to Frontend:
Once deployed, copy your Space URL (e.g., `https://jeevithan-freshai-backend.hf.space`) and add it to your Vercel project as `NEXT_PUBLIC_API_URL`.
