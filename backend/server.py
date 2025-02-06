from fastapi import FastAPI, Request, Depends, HTTPException # type: ignore
from fastapi.responses import RedirectResponse # type: ignore
import requests # type: ignore
import os
from dotenv import load_dotenv # type: ignore

load_dotenv()

app = FastAPI()

CLIENT_ID = os.getenv("INSTAGRAM_CLIENT_ID")
CLIENT_SECRET = os.getenv("INSTAGRAM_CLIENT_SECRET")
REDIRECT_URI ="https://localhost:3443/instagram/callback"
GRAPH_API_VERSION="v22.0"
PERMISSIONS = ["instagram_business_basic",
               "instagram_business_manage_messages", 
               "instagram_business_manage_comments", 
               "instagram_business_content_publish", 
               "instagram_business_manage_insights",]

token_storage = {}


@app.get("/instagram/auth")
def authenticate():
    """ Redirects to Instagram OAuth """
    auth_url = (
        "https://www.instagram.com/oauth/authorize"
        f"?client_id={CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        "&response_type=code"
        f"&scope={','.join(PERMISSIONS)}"
    )
    return RedirectResponse(auth_url)
    

@app.get("/instagram/callback")
def get_access_token(code: str):
    """ Exchanges authorization code for a short-lived access token """
    short_lived_token_url = "https://api.instagram.com/oauth/access_token"
    payload = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI,
        "code": code,
    }

    response = requests.post(short_lived_token_url, data=payload)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to get short-lived access token")
    
    data = response.json()
    short_lived_token = data["access_token"]
    user_id = data["user_id"]

    token_storage[user_id] = {"short_lived_token": short_lived_token}
    print(f"received the short lived token: {short_lived_token}")
    return get_long_lived_access_token(short_lived_token, user_id)


def get_long_lived_access_token(short_lived_access_token: str, user_id: str):
    """Exchanges short-lived token for a long-lived token."""
    long_lived_token_url = "https://graph.instagram.com/access_token"
    payload = {
        "client_secret": CLIENT_SECRET,
        "grant_type": "ig_exchange_token",
        "access_token": short_lived_access_token,
    }


    print(f"\n[DEBUG] Requesting long-lived token with payload: {payload}")

    response = requests.get(long_lived_token_url, params=payload)

    print(f"[DEBUG] Instagram API Response: {response.status_code} - {response.text}")

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to get long-lived access token")

    data = response.json()
    long_lived_token = data["access_token"]

    print(f"[DEBUG] Long-lived access token: {long_lived_token}")

    token_storage[user_id]["long_lived_token"] = long_lived_token
    return {"message": "Long-lived access token obtained", "access_token": long_lived_token}


@app.post("/instagram/publish")
def publish_post(user_id: str, image_url: str, caption: str):
    """ Publishes a post on Instagram """
    if user_id not in token_storage or "long_lived_token" not in token_storage[user_id]:
        raise HTTPException(status_code=401, detail="User not authenticated")

    access_token = token_storage[user_id]["long_lived_token"]

    # Step 1: Create media container
    media_url = f"https://graph.instagram.com/{GRAPH_API_VERSION}/{user_id}/media"
    media_payload = {
        "image_url": image_url,
        "caption": caption,
        "access_token": access_token,
    }

    media_response = requests.post(media_url, json=media_payload)
    if media_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to create media container")

    creation_id = media_response.json().get("id")

    # Step 2: Publish media container
    publish_url = f"https://graph.instagram.com/{GRAPH_API_VERSION}/{user_id}/media_publish"
    publish_payload = {
        "creation_id": creation_id,
        "access_token": access_token,
    }

    publish_response = requests.post(publish_url, json=publish_payload)
    if publish_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to publish post")

    return {"message": "Post published successfully", "media_id": publish_response.json().get("id")}