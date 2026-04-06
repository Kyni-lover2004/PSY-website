"""
Полная миграция базы данных PSY Website v4.0
- Удаляет email и phone из users И consultations
- Оставляет telegram для связи
- Добавляет поля category и topic для консультаций
- Пересоздаёт БД с нуля
"""
import sqlite3
import os
from datetime import datetime
from passlib.context import CryptContext

DB_PATH = os.path.join(os.path.dirname(__file__), "psycho.db")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def migrate_database():
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
            print("🗑️ Старая база данных удалена")
        except PermissionError:
            print("⚠️ База данных заблокирована. Переименовываем старую...")
            old_db = DB_PATH.replace(".db", f"_old_{int(datetime.utcnow().timestamp())}.db")
            os.rename(DB_PATH, old_db)
            print(f"🗑️ Старая база переименована в: {old_db}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # === 1. Users (без email и phone) ===
    cursor.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            login VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            telegram VARCHAR(100),
            gender VARCHAR(10),
            orientation VARCHAR(20),
            role VARCHAR(20) DEFAULT 'user' NOT NULL,
            session_id VARCHAR(100) UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            compatibility_code VARCHAR(50) UNIQUE,
            archetype_scores JSON,
            active_archetypes JSON,
            is_active BOOLEAN DEFAULT 1
        )
    """)
    print("✅ Таблица users создана (без email/phone)")

    # === 2. Questions (вопросы архетипов) ===
    cursor.execute("""
        CREATE TABLE questions (
            id INTEGER PRIMARY KEY,
            gender_type VARCHAR(10) NOT NULL,
            text TEXT,
            archetype_code VARCHAR(10) NOT NULL,
            order_index INTEGER NOT NULL,
            is_active BOOLEAN DEFAULT 1
        )
    """)
    print("✅ Таблица questions создана")

    # === 3. Answers (ответы на вопросы архетипов) ===
    cursor.execute("""
        CREATE TABLE answers (
            id INTEGER PRIMARY KEY,
            session_id VARCHAR(100) NOT NULL,
            question_id INTEGER NOT NULL,
            value BOOLEAN NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions(id)
        )
    """)
    print("✅ Таблица answers создана")

    # === 4. Test Results (результаты ВСЕХ тестов) ===
    cursor.execute("""
        CREATE TABLE test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            user_login VARCHAR(100) NOT NULL,
            user_telegram VARCHAR(100),
            test_type VARCHAR(50) NOT NULL,
            gender VARCHAR(10),
            total_score REAL DEFAULT 0.0,
            archetype_result VARCHAR(10),
            archetype_name VARCHAR(200),
            scores_breakdown TEXT,
            result_text TEXT,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    print("✅ Таблица test_results создана")

    # === 5. Consultations (без phone/email, с category/topic) ===
    cursor.execute("""
        CREATE TABLE consultations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name VARCHAR(100) NOT NULL,
            telegram VARCHAR(100),
            category VARCHAR(100),
            topic VARCHAR(200),
            request_text TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'new' NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    print("✅ Таблица consultations создана (без phone/email, с category/topic/telegram)")

    # === 6. Archetype Descriptions ===
    cursor.execute("""
        CREATE TABLE archetype_descriptions (
            id INTEGER PRIMARY KEY,
            code VARCHAR(10) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            color VARCHAR(20),
            chakra INTEGER,
            description TEXT,
            strengths TEXT,
            weaknesses TEXT
        )
    """)
    print("✅ Таблица archetype_descriptions создана")

    # === 7. Couples (совместимость пар) ===
    cursor.execute("""
        CREATE TABLE couples (
            id INTEGER PRIMARY KEY,
            user1_code VARCHAR(50) NOT NULL,
            user2_code VARCHAR(50) NOT NULL,
            compatibility_index VARCHAR(20),
            a_count INTEGER DEFAULT 0,
            p_count INTEGER DEFAULT 0,
            score REAL DEFAULT 0,
            interpretation TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("✅ Таблица couples создана")

    # === 8. Tests (кастомные тесты) ===
    cursor.execute("""
        CREATE TABLE tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("✅ Таблица tests создана")

    # === 9. Test Questions ===
    cursor.execute("""
        CREATE TABLE test_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            order_index INTEGER NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (test_id) REFERENCES tests(id)
        )
    """)
    print("✅ Таблица test_questions создана")

    # === 10. Answer Options (варианты ответов для кастомных тестов) ===
    cursor.execute("""
        CREATE TABLE answer_options (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            text VARCHAR(500) NOT NULL,
            score REAL DEFAULT 0.0,
            order_index INTEGER NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY (question_id) REFERENCES test_questions(id)
        )
    """)
    print("✅ Таблица answer_options создана")

    # === ЗАПОЛНЯЕМ ДАННЫЕ ===

    # Создаём админа
    admin_password = "admin123"
    cursor.execute("""
        INSERT INTO users (login, password_hash, telegram, role, session_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        "admin",
        hash_password(admin_password),
        "@admin_psy",
        "admin",
        "admin-session-001",
        datetime.utcnow().isoformat()
    ))
    print(f"\n✅ Админ создан: login=admin, password={admin_password}")

    # === Женские архетипы ===
    female_archetypes = [
        ("2.1", "Ксения (Сестра/Артемида)", "#4169E1", 6, "Архетип сестры/охотницы. Независимая, целеустремленная.", "Независимость, целеустремленность", "Может быть отстраненной"),
        ("2.2", "Кира (Стратег/Афина)", "#8B00FF", 7, "Архетип стратега. Рациональная, умная.", "Мудрость, стратегическое мышление", "Может быть холодной"),
        ("2.3", "Катерина (Хранительница/Гестия)", "#87CEEB", 5, "Архетип хранительницы. Создаёт уют.", "Спокойствие, уют, мудрость", "Может быть замкнутой"),
        ("2.4", "Карина (Возлюбленная/Афродита)", "#FFA500", 2, "Архетип любви и красоты.", "Чувственность, творчество", "Может быть эмоциональной"),
        ("2.5", "Клара (Мать/Деметра)", "#FF0000", 1, "Архетип матери. Заботливая, тёплая.", "Заботливость, доброта, нежность", "Может растворяться в детях"),
        ("2.6", "Кристина (Дочь/Персефона)", "#008000", 4, "Архетип дочери. Мягкая, адаптивная.", "Гибкость, адаптивность", "Может быть зависимой"),
        ("2.7", "Каллерия (Жена/Гера)", "#FFD700", 3, "Архетип жены. Верная, ориентирована на семью.", "Верность, преданность", "Может быть зависимой от партнёра"),
    ]
    cursor.executemany(
        "INSERT INTO archetype_descriptions (code, name, color, chakra, description, strengths, weaknesses) VALUES (?, ?, ?, ?, ?, ?, ?)",
        female_archetypes
    )

    # === Мужские архетипы ===
    male_archetypes = [
        ("1.1", "Константин (Правитель/Зевс)", "#4B0082", None, "Архетип правителя. Уверенный, лидер.", "Лидерство, ответственность", "Не заботится о чувствах"),
        ("1.2", "Кирилл (Эмоциональный/Посейдон)", "#0000FF", None, "Архетип эмоционального. Яркие чувства.", "Эмоциональность, глубина", "Нестабильность"),
        ("1.3", "Клемент (Потусторонний/Гадес)", "#2F4F4F", None, "Архетип потустороннего. Погружён в себя.", "Интуиция, глубина", "Сложно адаптироваться"),
        ("1.4", "Кузьма (Умный/Гермес)", "#FFD700", None, "Архетип путника. Постоянно в движении.", "Гибкость, ум", "Непостоянство"),
        ("1.5", "Кондратий (Гармоничный/Аполлон)", "#FF6347", None, "Архетип гармоничного. Любит точность.", "Дипломатичность, логика", "Не хватает чувств"),
        ("1.6", "Кристиан (Ранимый/Гефест)", "#708090", None, "Архетип творца. Чувствительный.", "Творчество, глубина", "Замкнутость"),
        ("1.7", "Клим (Воинственный/Арес)", "#8B0000", None, "Архетип воина. Эмоциональный, импульсивный.", "Энергия, страсть", "Импульсивность"),
    ]
    cursor.executemany(
        "INSERT INTO archetype_descriptions (code, name, color, chakra, description, strengths, weaknesses) VALUES (?, ?, ?, ?, ?, ?, ?)",
        male_archetypes
    )
    print("✅ Архетипы заполнены (7 женских + 7 мужских)")

    # === Женские вопросы (35 вопросов) ===
    female_questions = [
        ("Мне нравится быть в образе мамы, такой теплой и заботливой.", "2.5", 1),
        ("Я с детства любила мечтать, я путешествовала в своих мирах.", "2.6", 2),
        ("Я всегда чувствовала себя в ответе за взрослых.", "2.5", 3),
        ("Девочкой меня называли «пацанкой».", "2.1", 4),
        ("Когда родители ссорились, я старалась стать незаметной.", "2.3", 5),
        ("Я с детства планировала свою свадьбу.", "2.7", 6),
        ("Тема секса вызывала любопытство.", "2.4", 7),
        ("Глава семьи – отец, он опора и сила.", "2.2", 8),
        ("С детства я была «хорошей девочкой».", "2.5", 9),
        ("Я с детства любила командовать мальчиками.", "2.1", 10),
        ("Мне хотелось казаться красивой и привлекательной.", "2.4", 11),
        ("Я с детства была лидером, заводилой.", "2.1", 12),
        ("Мне хотелось быть полезной и нужной.", "2.5", 13),
        ("Я любила играть в «дочки-матери».", "2.5", 14),
        ("Мне нравилось быть в центре внимания.", "2.4", 15),
        ("Я с детства мечтала о карьере.", "2.2", 16),
        ("Я с детства любила заботиться о других.", "2.5", 17),
        ("Я с детства была очень чувствительной.", "2.4", 18),
        ("Мне хотелось быть независимой.", "2.1", 19),
        ("Я с детства любила порядок и уют.", "2.3", 20),
        ("Я с детства мечтала о большой семье.", "2.7", 21),
        ("Мне хотелось быть сильной и независимой.", "2.2", 22),
        ("Я с детства любила помогать маме.", "2.5", 23),
        ("Я с детства любила быть красивой.", "2.4", 24),
        ("Я с детства любила командовать.", "2.1", 25),
        ("Мне хотелось быть любимой.", "2.7", 26),
        ("Я с детства любила уединение.", "2.3", 27),
        ("Я с детства мечтала о путешествиях.", "2.4", 28),
        ("Я с детства была очень эмоциональной.", "2.4", 29),
        ("Я с детства любила планировать.", "2.2", 30),
        ("Мне хотелось быть заботливой.", "2.5", 31),
        ("Я с детства любила быть в центре внимания.", "2.4", 32),
        ("Я с детства мечтала о карьере и власти.", "2.2", 33),
        ("Я с детства любила заботиться о животных.", "2.5", 34),
        ("Мне хотелось быть независимой и свободной.", "2.1", 35),
    ]
    cursor.executemany(
        "INSERT INTO questions (text, archetype_code, order_index, gender_type) VALUES (?, ?, ?, 'female')",
        female_questions
    )
    print(f"✅ Женские вопросы добавлены: {len(female_questions)} шт")

    # === Мужские вопросы (35 вопросов) ===
    male_questions = [
        ("Я с детства любил быть лидером.", "1.1", 1),
        ("Я с детства был эмоциональным.", "1.2", 2),
        ("Я с детства любил уединение.", "1.3", 3),
        ("Я с детства любил общаться.", "1.4", 4),
        ("Я с детства любил порядок.", "1.5", 5),
        ("Я с детства был чувствительным.", "1.6", 6),
        ("Я с детства был энергичным.", "1.7", 7),
        ("Мне хотелось власти.", "1.1", 8),
        ("Мне хотелось любить.", "1.2", 9),
        ("Мне хотелось быть одному.", "1.3", 10),
        ("Мне хотелось общаться.", "1.4", 11),
        ("Мне хотелось гармонии.", "1.5", 12),
        ("Мне хотелось творить.", "1.6", 13),
        ("Мне хотелось побеждать.", "1.7", 14),
        ("Я любил командовать.", "1.1", 15),
        ("Я любил переживать.", "1.2", 16),
        ("Я любил думать.", "1.3", 17),
        ("Я любил говорить.", "1.4", 18),
        ("Я любил мир.", "1.5", 19),
        ("Я любил создавать.", "1.6", 20),
        ("Я любил бороться.", "1.7", 21),
        ("Я мечтал о власти.", "1.1", 22),
        ("Я мечтал о любви.", "1.2", 23),
        ("Я мечтал о покое.", "1.3", 24),
        ("Я мечтал о славе.", "1.4", 25),
        ("Я мечтал о гармонии.", "1.5", 26),
        ("Я мечтал о творчестве.", "1.6", 27),
        ("Я мечтал о победе.", "1.7", 28),
        ("Я был уверенным.", "1.1", 29),
        ("Я был страстным.", "1.2", 30),
        ("Я был замкнутым.", "1.3", 31),
        ("Я был общительным.", "1.4", 32),
        ("Я был спокойным.", "1.5", 33),
        ("Я был ранимым.", "1.6", 34),
        ("Я был воинственным.", "1.7", 35),
    ]
    cursor.executemany(
        "INSERT INTO questions (text, archetype_code, order_index, gender_type) VALUES (?, ?, ?, 'male')",
        male_questions
    )
    print(f"✅ Мужские вопросы добавлены: {len(male_questions)} шт")

    conn.commit()
    conn.close()

    print("\n" + "=" * 60)
    print("✅ МИГРАЦИЯ БД v4.0 ЗАВЕРШЕНА!")
    print("=" * 60)
    print("\n📋 Структура БД:")
    print("  ✅ users — без email/phone, только telegram")
    print("  ✅ consultations — без phone/email, с category/topic/telegram")
    print("  ✅ test_results — результаты всех тестов")
    print("  ✅ questions — 35 женских + 35 мужских вопросов")
    print("  ✅ archetype_descriptions — 14 архетипов")
    print("  ✅ tests, test_questions, answer_options — кастомные тесты")
    print("\n🔐 Данные админа:")
    print(f"  Логин: admin")
    print(f"  Пароль: {admin_password}")
    print("=" * 60)

if __name__ == "__main__":
    migrate_database()
