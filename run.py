import os
import sys
import uvicorn

if __name__ == "__main__":
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    print(f"[+] Deployed Palmistry & Tarot Intelligence Platform on http://{host}:{port} ...")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
