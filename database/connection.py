"""
CustomerConnect — Database Connection Manager
Provides thread-safe SQLite connection factory with foreign keys enabled.
"""

import sqlite3
from contextlib import contextmanager
from typing import Generator
import config
from database.schema import SCHEMA_SQL


def get_db_connection(db_path: str = config.DATABASE_PATH) -> sqlite3.Connection:
    """Return an SQLite connection with Row factory and PRAGMA foreign_keys active."""
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


@contextmanager
def get_db_cursor(db_path: str = config.DATABASE_PATH) -> Generator[sqlite3.Cursor, None, None]:
    """Context manager for atomic database operations."""
    conn = get_db_connection(db_path)
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def initialize_database(db_path: str = config.DATABASE_PATH) -> None:
    """Initialize schema tables and indexes."""
    conn = get_db_connection(db_path)
    try:
        conn.executescript(SCHEMA_SQL)
        conn.commit()
    finally:
        conn.close()
