import base64

import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Get your Client ID and Client Secret from the X Developer Portal
client_id = os.getenv("X_CLIENT_ID")
client_secret = os.getenv("X_CLIENT_SECRET")

if not client_id or not client_secret:
    print("Error: X_CLIENT_ID and X_CLIENT_SECRET environment variables must be set.")
    exit(1)

# Step 1: Get a Bearer Token (Client Credentials Grant)
token_url = "https://api.x.com/oauth2/token"
token_payload = {
    "grant_type": "client_credentials"
}
token_headers = {
    "Authorization": f"Basic {base64.b64encode(f'{client_id}:{client_secret}'.encode()).decode()}",  # Use base64.b64encode
    "Content-Type": "application/x-www-form-urlencoded"
}

try:
    token_response = requests.post(token_url, data=token_payload, headers=token_headers)
    token_response.raise_for_status()
    token_data = token_response.json()
    bearer_token = token_data["access_token"]
    print("Bearer Token obtained successfully!")

except requests.exceptions.RequestException as e:
    print(f"Error getting bearer token: {e}")
    try:
        error_details = token_response.json()
        print("X API Error Details:", error_details)
    except ValueError:
        print(f"HTTP Error: {token_response.status_code}")
    exit(1)

# Step 2: Try to Post a Tweet (Check Permissions!)
tweet_url = "https://api.x.com/2/tweets"
tweet_payload = {"text": "Testing OAuth 2.0 with requests (Essential tier)."}  # Keep it simple initially
tweet_headers = {
    "Authorization": f"Bearer {bearer_token}",
    "Content-Type": "application/json"
}

try:
    tweet_response = requests.post(tweet_url, json=tweet_payload, headers=tweet_headers)
    tweet_response.raise_for_status()
    print("Tweet posted (if permissions allow):")
    print(tweet_response.json())

except requests.exceptions.RequestException as e:
    print(f"Error posting tweet: {e}")
    try:
        error_details = tweet_response.json()
        print("X API Error Details:", error_details)
    except ValueError:
        print(f"HTTP Error: {tweet_response.status_code}")
