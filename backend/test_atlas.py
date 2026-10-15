import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def run_test():
    load_dotenv()
    mongo_url = os.environ.get("MONGO_URL")
    
    # 5-second timeout to quickly catch IP firewall blocking
    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    
    try:
        print("Attempting direct insert to Atlas...")
        await client.lunara_db.readings.insert_one({"test_message": "Atlas is working!"})
        print("✅ SUCCESS! Document inserted.")
    except Exception as e:
        print(f"❌ FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(run_test())