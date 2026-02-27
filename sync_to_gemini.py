import os
import mimetypes
from google import genai

# Configuration
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
changed_files_raw = os.environ.get("CHANGED_FILES", "")

def get_mime_type(file_path):
    # Manually map common code extensions that the system might miss
    extension_map = {
        '.tsx': 'text/plain',
        '.ts': 'text/plain',
        '.jsx': 'text/plain',
        '.py': 'text/plain',
        '.json': 'application/json'
    }
    ext = os.path.splitext(file_path)[1].lower()
    return extension_map.get(ext) or mimetypes.guess_type(file_path)[0] or 'text/plain'

def sync_files():
    if not GEMINI_API_KEY:
        print("Error: API Key not found.")
        return

    # Using the new GenAI Client
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    files_to_upload = changed_files_raw.split()

    for file_path in files_to_upload:
        if os.path.exists(file_path) and not file_path.endswith('.py') and not file_path.endswith('.yml'):
            
            display_name = os.path.basename(file_path)
            mime_type = get_mime_type(file_path)
            
            # 1. Cleanup
            for f in client.files.list():
                if f.display_name == display_name:
                    print(f"Cleaning up old version of {display_name}...")
                    client.files.delete(name=f.name)

            # 2. Upload with explicit MIME type
            print(f"Syncing: {file_path} as {mime_type}")
            try:
                # In this SDK version, the path is a keyword argument 'path'
                # but it must be the ONLY positional-style argument or 
                # strictly followed by the config.
                new_file = client.files.upload(
                    path=file_path, 
                    config={'display_name': display_name, 'mime_type': mime_type}
                )
                print(f"Successfully synced {display_name}!")
            except Exception as e:
                # If 'path' fails, the SDK might want 'file'
                try:
                    new_file = client.files.upload(
                        file=file_path, 
                        config={'display_name': display_name, 'mime_type': mime_type}
                    )
                    print(f"Successfully synced {display_name}!")
                except Exception as e2:
                    print(f"Failed to upload {file_path}: {e2}")

if __name__ == "__main__":
    sync_files()

# Add this at the end of your sync_files() function:
for f in client.files.list():
    if f.display_name == "RulesModal.tsx":
        print(f"Verified! File {f.display_name} exists with URI: {f.uri}")
        # This URI changes every time you upload a new version
