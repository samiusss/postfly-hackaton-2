import os
from mastodon import Mastodon
from dotenv import load_dotenv

load_dotenv()

# Mastodon credentials (from .env file)
api_base_url = os.getenv("MASTODON_API_BASE_URL")
client_id = os.getenv("MASTODON_CLIENT_KEY")
client_secret = os.getenv("MASTODON_CLIENT_SECRET")
access_token = os.getenv("MASTODON_ACCESS_TOKEN")

if not all([api_base_url, access_token]): # client_id and client_secret only needed for auth flow
    print("Error: Missing Mastodon credentials in .env file (API_BASE_URL and ACCESS_TOKEN are required).")
    exit(1)

try:
    mastodon = Mastodon(
        api_base_url=api_base_url,
        access_token=access_token,
    )

    # Post a toot (text only)
    status = mastodon.status_post("Tooting from Python! #mastodon #python")
    print(f"Toot posted successfully! ID: {status['id']}")

    # Example: Posting with a poll
    # poll_options = ["Option 1", "Option 2", "Option 3"]
    # poll = mastodon.status_post("Poll time!", poll=poll_options, poll_expires_in=3600) # Expires in 1 hour
    # print(f"Toot with poll posted! ID: {poll['id']}")

except Exception as e:
    print(f"Error: {e}")