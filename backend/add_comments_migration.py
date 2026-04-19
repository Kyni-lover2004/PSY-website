"""
Миграция: Добавление таблицы comments для пользовательских комментариев
Запускается после основной миграции, добавляет новую таблицу в существующую БД
"""
import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "psycho.db")

def add_comments_table():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Проверяем, существует ли уже таблица comments
    cursor.execute("""
        SELECT name FROM sqlite_master
        WHERE type='table' AND name='comments'
    """)
    exists = cursor.fetchone()

    if exists:
        print("⚠️ Таблица comments уже существует")
        conn.close()
        return

    # Создаём таблицу comments
    cursor.execute("""
        CREATE TABLE comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            user_login VARCHAR(100) NOT NULL,
            content TEXT NOT NULL,
            target_type VARCHAR(50) DEFAULT 'general' NOT NULL,
            target_id INTEGER,
            parent_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_deleted BOOLEAN DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
        )
    """)

    # Создаём индексы для ускорения выборки
    cursor.execute("""
        CREATE INDEX idx_comments_target ON comments(target_type, target_id)
    """)
    cursor.execute("""
        CREATE INDEX idx_comments_user ON comments(user_id)
    """)
    cursor.execute("""
        CREATE INDEX idx_comments_parent ON comments(parent_id)
    """)

    conn.commit()
    conn.close()

    print("✅ Таблица comments успешно создана")
    print("📋 Структура:")
    print("  - id: PRIMARY KEY")
    print("  - user_id: INTEGER (FK -> users.id)")
    print("  - user_login: VARCHAR(100)")
    print("  - content: TEXT (текст комментария)")
    print("  - target_type: VARCHAR(50) ('general', 'test_result', 'consultation')")
    print("  - target_id: INTEGER (ID объекта для привязки)")
    print("  - parent_id: INTEGER (для древовидных комментариев)")
    print("  - created_at: DATETIME")
    print("  - updated_at: DATETIME")
    print("  - is_deleted: BOOLEAN (мягкое удаление)")
    print("✅ Индексы созданы: idx_comments_target, idx_comments_user, idx_comments_parent")

if __name__ == "__main__":
    add_comments_table()
