import os
import time
from google import genai
from google.genai import types

# 1. Setup Client
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")

client = genai.Client(api_key=api_key)

# 2. File Path Configuration
file_path = "src/components/RulesModal.tsx"
timestamp = int(time.time())
display_name = f"RulesModal_{timestamp}.tsx"

print(f"Syncing: {file_path} as {display_name}")

# 3. Upload File using the UPDATED SDK syntax
try:
    # --- CHANGED 'path' to 'file' HERE ---
    uploaded_file = client.files.upload(
        file=file_path, 
        config=types.UploadFileConfig(
            display_name=display_name,
            mime_type="text/plain"
        )
    )
    # --------------------------------------

    print(f"✅ Successfully synced: {display_name}")
    print(f"✅ File ID: {uploaded_file.name}")
    # THIS IS THE URI YOU NEED FOR YOUR APP
    print(f"✅ Active URI: {uploaded_file.uri}")

except Exception as e:
    print(f"❌ Failed to upload: {e}")
    exit(1)
