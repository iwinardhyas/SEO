from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import spacy
import pandas as pd
from collections import Counter
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from supabase import create_client, Client
import json
import os
import os
from dotenv import load_dotenv # Tambahkan ini

# Muat variabel dari file .env
load_dotenv() 

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SERP_API_KEY = os.getenv("SERP_API_KEY")
# ... sisanya sama

# --- INITIALIZATION ---
app = FastAPI()

# Ambil Key dari Environment Variables (Vercel Settings)
# SUPABASE_URL = os.getenv("SUPABASE_URL", "")
# SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
# SERP_API_KEY = os.getenv("SERP_API_KEY", "")
SHEET_NAME = os.getenv("SHEET_NAME", "Analisis SEO")

# Inisialisasi Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load model spacy (Pastikan sudah masuk di requirements.txt)
nlp = spacy.load("en_core_web_sm")

# Model untuk input dari React
class CrawlRequest(BaseModel):
    keyword: str

# --- FUNCTIONS (LOGIKA ANDA) ---

def get_serp_links(query):
    url = "https://serpapi.com/search.json"
    params = {"q": query, "api_key": SERP_API_KEY, "num": 10}
    response = requests.get(url, params=params)
    results = response.json()
    return [item['link'] for item in results.get('organic_results', [])]

def scrape_content(url):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        for script in soup(["script", "style"]):
            script.decompose()
        return soup.get_text(separator=' ', strip=True)
    except:
        return ""

def extract_entities(text):
    doc = nlp(text)
    return [ent.text for ent in doc.ents if ent.label_ in ["ORG", "PRODUCT", "GPE", "NORP"]]

# --- API ENDPOINT ---

@app.post("/api/crawl")
async def start_crawling(request: CrawlRequest):
    keyword = request.keyword
    print(f"Memulai crawling untuk: {keyword}")

    links = get_serp_links(keyword)
    data_result = []

    for i, link in enumerate(links):
        content = scrape_content(link)
        if content:
            entities = extract_entities(content)
            entity_counts = Counter(entities)
            top_entities = entity_counts.most_common(10)
            
            data_result.append({
                "Rank": i + 1,
                "URL": link,
                "Total Entities": len(entities),
                "Top Keywords/Entities": top_entities
            })

    if not data_result:
        raise HTTPException(status_code=400, detail="Tidak ada data yang berhasil di-crawl")

    # Simpan ke DataFrame
    df = pd.DataFrame(data_result)

    # 1. Kirim ke Supabase
    df_supabase = df.copy()
    column_mapping = {
        "Rank": "rank", "URL": "url", 
        "Total Entities": "total_entities", 
        "Top Keywords/Entities": "top_keywords"
    }
    df_supabase = df_supabase.rename(columns=column_mapping)
    df_supabase['top_keywords'] = df_supabase['top_keywords'].astype(str)
    
    data_dict = df_supabase[["rank", "url", "total_entities", "top_keywords"]].to_dict(orient='records')
    supabase.table("search_results").insert(data_dict).execute()

    # 2. Kirim ke GSheet (Gunakan variabel environment untuk JSON Creds)
    # Catatan: Di Vercel, lebih baik simpan isi JSON creds di Env Var
    
    return {
        "status": "success",
        "keyword": keyword,
        "data": data_result
    }