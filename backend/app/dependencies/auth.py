from fastapi import Request, HTTPException, Depends
from firebase_admin import auth
from ..core.firebase import get_auth

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    id_token = auth_header.split("Bearer ")[1]
    try:
        # Allow 60 seconds of clock skew for Windows time desync issues
        decoded_token = auth.verify_id_token(id_token, clock_skew_seconds=60)
        return decoded_token
    except Exception as e:
        import sys
        print(f"Token verification error: {e}", file=sys.stderr)
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
