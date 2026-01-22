"""Password hashing and verification utilities."""
from passlib.context import CryptContext

# Create password context for bcrypt hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plain text password.

    Args:
        password: Plain text password

    Returns:
        Hashed password

    Note:
        Bcrypt has a maximum password length of 72 bytes.
        Longer passwords will be truncated.
    """
    # Bcrypt has a 72 byte limit
    if len(password.encode('utf-8')) > 72:
        # Truncate to 72 bytes while respecting UTF-8 boundaries
        password_bytes = password.encode('utf-8')[:72]
        password = password_bytes.decode('utf-8', errors='ignore')

    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hashed password.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to check against

    Returns:
        True if password matches, False otherwise

    Note:
        Bcrypt has a maximum password length of 72 bytes.
        Longer passwords will be truncated for verification.
    """
    # Apply same truncation as hash_password for consistency
    if len(plain_password.encode('utf-8')) > 72:
        password_bytes = plain_password.encode('utf-8')[:72]
        plain_password = password_bytes.decode('utf-8', errors='ignore')

    return pwd_context.verify(plain_password, hashed_password)
