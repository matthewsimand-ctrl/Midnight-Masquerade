import os
import time
# --- IMPORTING CORRECT SDK ---
from google import genai
from google.genai import types

# 1. Setup API Key
# Ensure this is set in GitHub Secrets as GEMINI_API_KEY
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")

# 2. Initialize Client
# This explicitly passes the key to the client
client = genai.Client(api_key=api_key)

# 3. File Path Configuration
file_path = "src/components/RulesModal.tsx"                
timestamp = int(time.time())
display_name = f"RulesModal_{timestamp}.tsx"

print(f"Syncing: {file_path} as {display_name}")

# 4. Upload File
try:
    # --- USE 'file=' FOR THE NEW SDK ---
    uploaded_file = client.files.upload(
        file=file_path, 
        config=types.UploadFileConfig(
            display_name=display_name,
            mime_type="text/plain" # Explicitly set mime type
        )
    )

    print(f"✅ Successfully synced: {display_name}")
    print(f"✅ File ID: {uploaded_file.name}")
    # THIS IS THE URI YOU NEED FOR YOUR APP
    print(f"✅ Active URI: {uploaded_file.uri}")

except Exception as e:
    print(f"❌ Failed to upload: {e}")
    # Provide maximum info for debugging
    import traceback
    traceback.print_exc()                
    exit(1)
