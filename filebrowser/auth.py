import sqlite3
import secrets
import hashlib
from pathlib import Path
from typing import Optional

DB_PATH = Path.cwd() / "filebrowser.db"

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    password_hash BLOB NOT NULL,
    salt BLOB NOT NULL,
    iterations INTEGER NOT NULL
);
"""

DEFAULT_ITERATIONS = 200_000


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.executescript(SCHEMA_SQL)
    return conn


essential_keys = ("password_hash", "salt", "iterations")


def set_password(password: str, iterations: int = DEFAULT_ITERATIONS) -> None:
    if not isinstance(password, str) or len(password) == 0:
        raise ValueError("Password must be a non-empty string")
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    with _get_conn() as conn:
        conn.execute(
            "INSERT INTO auth (id, password_hash, salt, iterations) VALUES (1, ?, ?, ?)\n"
            "ON CONFLICT(id) DO UPDATE SET password_hash=excluded.password_hash, salt=excluded.salt, iterations=excluded.iterations",
            (dk, salt, iterations),
        )
        conn.commit()


def get_password_record() -> Optional[tuple]:
    with _get_conn() as conn:
        cur = conn.execute("SELECT password_hash, salt, iterations FROM auth WHERE id = 1")
        row = cur.fetchone()
        return row


def verify_password(password: str) -> bool:
    rec = get_password_record()
    if not rec:
        return False
    stored_hash, salt, iterations = rec
    test_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations))
    return secrets.compare_digest(stored_hash, test_hash)


def is_password_set() -> bool:
    return get_password_record() is not None
