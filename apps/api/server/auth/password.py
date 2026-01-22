from passlib.context import CryptContext

# Create password context with bcrypt
# Using bcrypt 4.0.1 and passlib 1.7.4 for compatibility
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Handles the bcrypt 72-byte limitation by truncating passwords that are too long.
    This is a known bcrypt limitation - passwords longer than 72 bytes are automatically
    truncated to prevent ValueError.

    Args:
        password: Plain text password to hash

    Returns:
        Hashed password string
    """
    # bcrypt has a 72-byte limit, truncate if necessary
    if len(password.encode('utf-8')) > 72:
        password = password[:72]

    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to verify against

    Returns:
        True if password matches, False otherwise
    """
    # Apply the same truncation for consistency
    if len(plain_password.encode('utf-8')) > 72:
        plain_password = plain_password[:72]

    return pwd_context.verify(plain_password, hashed_password)
