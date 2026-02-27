import os
import google.generativeai as genai

# Configuration
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
FILE_TO_SYNC = "your_data_file.txt"  # Change this to your actual filename!
DISPLAY_NAME = "GitHub_Synced_File"

def sync_file():
    if not GEMINI_API_KEY:
        print("Error: GEMINI_API_KEY not found in environment.")
        return

    genai.configure(api_key=GEMINI_API_KEY)

    # 1. Find and Delete existing files with the same name to keep it clean
    existing_files = genai.list_files()
    for f in existing_files:
        if f.display_name == DISPLAY_NAME:
            print(f"Deleting old version: {f.name}")
            genai.delete_file(f.name)

    # 2. Upload the fresh version
    print(f"Uploading {FILE_TO_SYNC}...")
    new_file = genai.upload_file(path=FILE_TO_SYNC, display_name=DISPLAY_NAME)
    print(f"Sync Complete! New URI: {new_file.uri}")

if __name__ == "__main__":
    sync_file()
