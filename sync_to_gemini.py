import os
import time
from google import genai
from google.genai import types

# 1. Setup Client
# The SDK automatically looks for the GEMINI_API_KEY environment variable
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")

client = genai.Client(api_key=api_key)

# 2. File Path Configuration
# Assuming this script runs from root and the file is in src/components
file_path = "src/components/RulesModal.tsx"
timestamp = int(time.time())
display_name = f"RulesModal_{timestamp}.tsx"

print(f"Syncing: {file_path} as {display_name}")

# 3. Upload File using the NEW SDK syntax
try:
    # 'client.files.upload' is the new method
    uploaded_file = client.files.upload(
        path=file_path,
        config=types.UploadFileConfig(
            display_name=display_name,
            mime_type="text/plain"
        )
    )

    print(f"✅ Successfully synced: {display_name}")
    print(f"✅ File ID: {uploaded_file.name}")
    # THIS IS THE URI YOU NEED FOR YOUR APP
    print(f"✅ Active URI: {uploaded_file.uri}")

except Exception as e:
    print(f"❌ Failed to upload: {e}")
    exit(1)
