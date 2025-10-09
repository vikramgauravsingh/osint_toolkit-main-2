from database.database import SessionLocal
from database import crud
import logging
import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from jwt import PyJWKClient

oauth2_scheme = HTTPBearer(auto_error=False)

OIDC_ISSUER = os.getenv("OIDC_ISSUER", "")
OIDC_AUDIENCE = os.getenv("OIDC_AUDIENCE", "")
OIDC_JWKS_URL = os.getenv("OIDC_JWKS_URL", "")
OIDC_ALGORITHMS = os.getenv("OIDC_ALGORITHMS", "RS256").split(",")

logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s',
                    datefmt='%B-%d-%Y %H:%M:%S',
                    level=logging.INFO)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)):
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = credentials.credentials

    if not OIDC_ISSUER or not OIDC_AUDIENCE:
        # If OIDC not configured, allow all (development fallback)
        return {"sub": "dev", "scope": "*"}

    try:
        from urllib.request import urlopen
        import json

        jwks_url = OIDC_JWKS_URL
        if not jwks_url:
            discovery_url = OIDC_ISSUER.rstrip("/") + "/.well-known/openid-configuration"
            try:
                config = json.loads(urlopen(discovery_url).read())
                jwks_url = config.get("jwks_uri")
            except Exception:
                raise HTTPException(status_code=401, detail="OIDC discovery failed")

        jwk_client = PyJWKClient(jwks_url)
        signing_key = jwk_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=OIDC_ALGORITHMS,
            audience=OIDC_AUDIENCE,
            issuer=OIDC_ISSUER,
        )
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
