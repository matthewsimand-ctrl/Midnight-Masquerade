import os
import sys
import time
from google import genai
from google.genai import types

# -----------------------------
# 1. Validate environment
# -----------------------------
api_key = os.environ.get("GEMINI_API_KEY")
changed_files_env = os.environ.get("CHANGED_FILES", "")

if not api_key:
    print("❌ GEMINI_API_KEY environment variable not set")
    sys.exit(1)

changed_files = [f.strip() for f in changed_files_env.split() if f.strip()]

if not changed_files:
    print("ℹ️ No changed files detected. Exiting.")
    sys.exit(0)

print("Detected changed files:")
for f in changed_files:
    print(" -", f)

# -----------------------------
# 2. Initialize Gemini client
# -----------------------------
try:
    client = genai.Client(api_key=api_key)
except Exception as e:
    print("❌ Failed to initialize Gemini client:", e)
    sys.exit(1)

# -----------------------------
# 3. Sanity check (auth test)
# -----------------------------
print("\n🔎 Testing API authentication...")

try:
    test_response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents="Respond with the word OK"
    )
    print("✅ Auth success:", test_response.text.strip())
except Exception as e:
    print("❌ API auth test failed")
    print(e)
    sys.exit(1)

# -----------------------------
# 4. Upload relevant files
# -----------------------------
print("\n📤 Uploading changed files...")

uploaded_any = False

for file_path in changed_files:
    if not os.path.exists(file_path):
        print(f"⚠️ Skipping missing file: {file_path}")
        continue

    # Only upload frontend/game rule files (adjust as needed)
    if not file_path.endswith((".tsx", ".ts", ".js", ".json", ".txt")):
        print(f"⏭ Skipping non-supported file: {file_path}")
        continue

    try:
        timestamp = int(time.time())
        display_name = f"{os.path.basename(file_path)}_{timestamp}"

        uploaded_file = client.files.upload(
            file=file_path,
            config=types.UploadFileConfig(
                display_name=display_name,
                mime_type="text/plain"
            )
        )

        print(f"\n✅ Uploaded: {file_path}")
        print("   File ID:", uploaded_file.name)
        print("   URI:", uploaded_file.uri)

        uploaded_any = True

    except Exception as e:
        print(f"\n❌ Upload failed for {file_path}")
        print(e)

# -----------------------------
# 5. Final status
# -----------------------------
if not uploaded_any:
    print("\nℹ️ No files uploaded.")
else:
    print("\n🎉 Sync complete.")
