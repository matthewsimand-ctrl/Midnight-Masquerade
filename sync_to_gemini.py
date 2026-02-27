import os
import google.generativeai as genai

# Configuration
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
# Get the list of changed files from the GitHub Action environment
changed_files_raw = os.environ.get("CHANGED_FILES", "")

def sync_files():
    if not GEMINI_API_KEY:
        print("Error: API Key not found.")
        return

    genai.configure(api_key=GEMINI_API_KEY)
    
    # Split the string of filenames into a list
    files_to_upload = changed_files_raw.split()

    for file_path in files_to_upload:
        # Basic check to see if the file exists and isn't the script itself
        if os.path.exists(file_path) and not file_path.endswith('.py') and not file_path.endswith('.yml'):
            
            display_name = os.path.basename(file_path)
            
            # 1. Cleanup: Delete old version if it exists
            for f in genai.list_files():
                if f.display_name == display_name:
                    print(f"Cleaning up old version of {display_name}...")
                    genai.delete_file(f.name)

            # 2. Upload the new version
            print(f"Syncing: {file_path}")
            try:
                new_file = genai.upload_file(path=file_path, display_name=display_name)
                print(f"Successfully synced {display_name}!")
            except Exception as e:
                print(f"Failed to upload {file_path}: {e}")

if __name__ == "__main__":
    sync_files()
