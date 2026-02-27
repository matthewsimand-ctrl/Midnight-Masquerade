import os
import mimetypes
import time
from datetime import datetime
from google import genai

# Configuration
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
changed_files_raw = os.environ.get("CHANGED_FILES", "")

def get_mime_type(file_path):
    extension_map = {
        '.tsx': 'text/plain', '.ts': 'text/plain',
        '.jsx': 'text/plain', '.py': 'text/plain',
        '.json': 'application/json'
    }
    ext = os.path.splitext(file_path)[1].lower()
    return extension_map.get(ext) or mimetypes.guess_type(file_path)[0] or 'text/plain'

def sync_files():
    if not GEMINI_API_KEY:
        print("Error: API Key not found.")
        return

    # Initialize the client
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    # Identify which files to process
    files_to_upload = changed_files_raw.split()

    for file_path in files_to_upload:
        if os.path.exists(file_path) and not file_path.endswith(('.py', '.yml')):
            
            # Create a unique display name with a timestamp
            timestamp = datetime.now().strftime("%H%M")
            base_name = os.path.basename(file_path)
            name_part, ext_part = os.path.splitext(base_name)
            unique_display_name = f"{name_part}_{timestamp}{ext_part}"
            
            mime_type = get_mime_type(file_path)

            # 1. Cleanup old versions
            print(f"Cleaning up old versions of {name_part}...")
            try:
                for f in client.files.list():
                    if f.display_name.startswith(name_part):
                        client.files.delete(name=f.name)
            except Exception as e:
                print(f"Cleanup note: {e}")

            # 2. Upload using the correct 'file=' keyword
            print(f"Syncing: {file_path} as {unique_display_name}")
            try:
                new_file = client.files.upload(
                    file=file_path,  # <--- This is the correct keyword for google-genai
                    config={'display_name': unique_display_name, 'mime_type': mime_type}
                )
                
                # 3. Wait for the file to be ACTIVE
                while new_file.state.name == "PROCESSING":
                    print("Waiting for Google to process file...")
                    time.sleep(4)
                    new_file = client.files.get(name=new_file.name)
                
                print(f"✅ Successfully synced and ACTIVE: {unique_display_name}")
            except Exception as e:
                print(f"❌ Failed to upload {file_path}: {e}")

# ... (your existing code to upload the file)
file = genai.upload_file(path=file_path)
print(f"✅ Active URI: {file.uri}") # Add this line

if __name__ == "__main__":
    sync_files()
