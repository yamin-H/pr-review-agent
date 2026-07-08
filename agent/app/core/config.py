from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
DATABASE_URL = os.getenv("DATABASE_URL")
NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:3000")

# Temporary debug — remove after fix
print(f"GITHUB_TOKEN loaded: {GITHUB_TOKEN[:10] if GITHUB_TOKEN else 'NOT FOUND'}")