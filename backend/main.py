# main.py
from fastapi import FastAPI, Request, HTTPException # type: ignore
from fastapi.responses import JSONResponse, RedirectResponse # type: ignore
import httpx # type: ignore
import os

app = FastAPI()

INSTAGRAM_CLIENT_ID = os.getenv("INSTAGRAM_CLIENT_ID", "YOUR_CLIENT_ID")
INSTAGRAM_CLIENT_SECRET = os.getenv("INSTAGRAM_CLIENT_SECRET", "YOUR_CLIENT_SECRET")
INSTAGRAM_REDIRECT_URI = os.getenv("INSTAGRAM_REDIRECT_URI", "https://localhost:3443/instagram/callback")

@app.get("/instagram/callback")
async def instagram_callback(code: str = None, error: str = None):
    if error:
        raise HTTPException(status_code=400, detail=f"Instagram OAuth error: {error}")
    if not code:
        raise HTTPException(status_code=400, detail="No code provided.")
    # 1) EXCHANGE CODE FOR SHORT-LIVED TOKEN
    form_data = {
        "client_id": INSTAGRAM_CLIENT_ID,
        "client_secret": INSTAGRAM_CLIENT_SECRET,
        "grant_type": "authorization_code",
        "redirect_uri": "INSTAGRAM_REDIRECT_URI",  # must match EXACTLY
        "code": code,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://api.instagram.com/oauth/access_token", data=form_data)
    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {resp.text}")

    data = resp.json()
    short_lived_token = data.get("access_token")
    user_id = data.get("user_id")

    # 2) EXCHANGE SHORT-LIVED TOKEN FOR LONG-LIVED TOKEN
    params = {
        "grant_type": "ig_exchange_token",
        "client_secret": INSTAGRAM_CLIENT_SECRET,
        "access_token": short_lived_token,
    }
    async with httpx.AsyncClient() as client:
        long_resp = await client.get("https://graph.instagram.com/access_token", params=params)
    if long_resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Long-lived token failed: {long_resp.text}")

    ll_data = long_resp.json()
    long_lived_token = ll_data.get("access_token")
    expires_in = ll_data.get("expires_in")

    # Return JSON or redirect somewhere
    return JSONResponse({
        "short_lived_token": short_lived_token,
        "long_lived_token": long_lived_token,
        "expires_in": expires_in,
        "user_id": user_id,
    })
