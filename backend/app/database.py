import sqlite3
from datetime import datetime
from typing import Dict, Any

import os
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'pulmonary.db'))

CREATE_TABLE_SQL = '''
CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    input_type TEXT,
    input_text TEXT,
    svm_result TEXT,
    nb_result TEXT,
    final_prediction TEXT,
    confidence REAL,
    created_at TEXT
);
'''

CREATE_USER_TABLE_SQL = '''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    created_at TEXT
);
'''

_connection = None


def get_connection():
    global _connection
    if _connection is None:
        _connection = sqlite3.connect(DB_PATH, check_same_thread=False)
        _connection.row_factory = sqlite3.Row
        _ensure_table()
    return _connection


def _ensure_table():
    conn = _connection
    cur = conn.cursor()
    # prediction history
    cur.execute(CREATE_TABLE_SQL)
    # user accounts
    cur.execute(CREATE_USER_TABLE_SQL)
    conn.commit()


def save_prediction(data: Dict[str, Any]):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        '''
        INSERT INTO predictions (
            input_type, input_text, svm_result, nb_result,
            final_prediction, confidence, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ''',
        (
            data.get('input_type'),
            data.get('input_text'),
            data.get('svm_result'),
            data.get('nb_result'),
            data.get('final_prediction'),
            data.get('confidence'),
            datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()


def save_user(name: str, email: str, password_hash: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        '''
        INSERT INTO users (name, email, password_hash, created_at)
        VALUES (?, ?, ?, ?)
        ''',
        (name, email, password_hash, datetime.utcnow().isoformat()),
    )
    conn.commit()


def get_user_by_email(email: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM users WHERE email = ?', (email,))
    row = cur.fetchone()
    return dict(row) if row else None


def fetch_history():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM predictions ORDER BY id DESC')
    rows = cur.fetchall()
    return [dict(r) for r in rows]
