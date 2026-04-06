"""
PSY Website Backend v4.0 - FULL DB REBUILD
- Без email/phone, только telegram
- Consultations с category/topic/telegram
- Все результаты тестов сохраняются
- Админка получает все данные
"""
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from passlib.context import CryptContext
from jose import JWTError, jwt
from collections import defaultdict
import logging
import uuid
import os
import re
import secrets
import asyncio
import aiohttp

# === КОНФИГУРАЦИЯ ===
SECRET_KEY = os.environ.get("SECRET_KEY", "psycho-secure-key-2026-" + "a" * 40)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
DATABASE_URL = "sqlite:///./psycho.db"
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
FRONTEND_URLS = [FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"]
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

# === ЛОГИРОВАНИЕ ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('psycho.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# === RATE LIMITING ===
class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)
        self.max_requests = 10000  # Увеличено до 10000 запросов
        self.window = 60           # За 60 секунд (1 минуту)
        self.login_attempts = defaultdict(int)
        self.login_lockouts = {}

    def is_rate_limited(self, client_ip: str) -> bool:
        now = datetime.now(timezone.utc).timestamp()
        self.requests[client_ip] = [t for t in self.requests[client_ip] if now - t < self.window]
        if len(self.requests[client_ip]) >= self.max_requests:
            return True
        self.requests[client_ip].append(now)
        return False

    def is_login_locked(self, client_ip: str) -> bool:
        if client_ip in self.login_lockouts:
            if datetime.now(timezone.utc) < self.login_lockouts[client_ip]:
                return True
            else:
                del self.login_lockouts[client_ip]
                self.login_attempts[client_ip] = 0
        return False

    def record_login_attempt(self, client_ip: str, success: bool):
        if success:
            self.login_attempts[client_ip] = 0
        else:
            self.login_attempts[client_ip] += 1
            if self.login_attempts[client_ip] >= 5:
                self.login_lockouts[client_ip] = datetime.now(timezone.utc) + timedelta(minutes=15)
                logger.warning(f"IP {client_ip} заблокирован на 15 минут")

rate_limiter = RateLimiter()

# === FASTAPI APP ===
app = FastAPI(title="Psycho Archetypes API", version="4.0.0")

# === CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=3600,
)

# === SECURITY HEADERS ===
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    client_ip = request.client.host
    if rate_limiter.is_rate_limited(client_ip):
        return JSONResponse(status_code=429, content={"detail": "Слишком много запросов"})
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    return response

# === DATABASE ===
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def generate_code() -> str:
    return f"PSY-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:12].upper()}"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    # JWT требует чтобы sub был строкой
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def sanitize_string(value: str, max_length: int = 500) -> str:
    if not value:
        return value
    value = value.strip()[:max_length]
    value = re.sub(r'[<>&\'"\\]', '', value)
    return value

# === TELEGRAM ===
class TelegramNotifier:
    def __init__(self, bot_token: str, chat_id: str):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.base_url = f"https://api.telegram.org/bot{bot_token}"

    async def send_consultation_notification(self, consultation: dict):
        message = f"""
📝 <b>НОВАЯ ЗАЯВКА НА КОНСУЛЬТАЦИЮ</b>

👤 <b>Имя:</b> {consultation.get('name', 'Не указано')}
💬 <b>Telegram:</b> {consultation.get('telegram', 'Не указан')}

📁 <b>Категория:</b> {consultation.get('category', 'Не указана')}
🎯 <b>Тема:</b> {consultation.get('topic', 'Не указана')}

💬 <b>Запрос:</b>
{consultation.get('request_text', 'Не указано')}

🕐 <b>Дата:</b> {consultation.get('created_at', 'N/A')}
🆔 <b>ID:</b> {consultation.get('id', 'N/A')}
"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/sendMessage",
                    json={"chat_id": self.chat_id, "text": message.strip(), "parse_mode": "HTML"}
                ) as response:
                    if response.status == 200:
                        logger.info("✅ Уведомление отправлено в Telegram")
        except Exception as e:
            logger.error(f"❌ Ошибка Telegram: {e}")

telegram_notifier = None

def init_telegram():
    global telegram_notifier
    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        telegram_notifier = TelegramNotifier(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
        logger.info("✅ Telegram бот инициализирован")

async def notify_consultation(consultation_data: dict):
    if telegram_notifier:
        asyncio.create_task(telegram_notifier.send_consultation_notification(consultation_data))

# === МОДЕЛИ SQLALCHEMY ===

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    login = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    telegram = Column(String(100), nullable=True)
    gender = Column(String(10), nullable=True)
    orientation = Column(String(20), nullable=True)
    role = Column(String(20), default="user", nullable=False, index=True)
    session_id = Column(String(100), unique=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    compatibility_code = Column(String(50), unique=True, nullable=True)
    archetype_scores = Column(JSON, nullable=True)
    active_archetypes = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)

    consultations = relationship("Consultation", back_populates="user", cascade="all, delete", passive_deletes=True)
    test_results = relationship("TestResult", back_populates="user", cascade="all, delete", passive_deletes=True)

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    gender_type = Column(String(10), nullable=False)
    text = Column(Text, nullable=True)
    archetype_code = Column(String(10), nullable=False)
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)

class Answer(Base):
    __tablename__ = "answers"
    id = Column(Integer, primary_key=True)
    session_id = Column(String(100), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    value = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Consultation(Base):
    __tablename__ = "consultations"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(100), nullable=False)
    telegram = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    topic = Column(String(200), nullable=True)
    request_text = Column(Text, nullable=False)
    status = Column(String(20), default="new", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="consultations")

class ArchetypeDescription(Base):
    __tablename__ = "archetype_descriptions"
    id = Column(Integer, primary_key=True)
    code = Column(String(10), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    color = Column(String(20), nullable=True)
    chakra = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)

class Couple(Base):
    __tablename__ = "couples"
    id = Column(Integer, primary_key=True)
    user1_code = Column(String(50), nullable=False)
    user2_code = Column(String(50), nullable=False)
    compatibility_index = Column(String(20), nullable=True)
    a_count = Column(Integer, default=0)
    p_count = Column(Integer, default=0)
    score = Column(Float, default=0)
    interpretation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Test(Base):
    __tablename__ = "tests"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    questions = relationship("TestQuestion", back_populates="test", cascade="all, delete", passive_deletes=True)

class TestQuestion(Base):
    __tablename__ = "test_questions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    test_id = Column(Integer, ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    test = relationship("Test", back_populates="questions")
    answer_options = relationship("AnswerOption", back_populates="question", cascade="all, delete", passive_deletes=True)

class AnswerOption(Base):
    __tablename__ = "answer_options"
    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("test_questions.id", ondelete="CASCADE"), nullable=False)
    text = Column(String(500), nullable=False)
    score = Column(Float, default=0.0)
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)

    question = relationship("TestQuestion", back_populates="answer_options")

class TestResult(Base):
    __tablename__ = "test_results"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_login = Column(String(100), nullable=False)
    user_telegram = Column(String(100), nullable=True)
    test_type = Column(String(50), nullable=False)
    gender = Column(String(10), nullable=True)
    total_score = Column(Float, default=0.0)
    archetype_result = Column(String(10), nullable=True)
    archetype_name = Column(String(200), nullable=True)
    scores_breakdown = Column(Text, nullable=True)
    result_text = Column(Text, nullable=True)
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="test_results")

# === PYDANTIC МОДЕЛИ ===

class UserCreate(BaseModel):
    login: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    telegram: Optional[str] = None
    gender: Optional[str] = None
    orientation: Optional[str] = None

class UserLogin(BaseModel):
    login: str = Field(..., max_length=50)
    password: str = Field(..., max_length=128)

class AnswerSubmit(BaseModel):
    question_id: int
    value: bool

class TestComplete(BaseModel):
    session_id: str = Field(..., max_length=100)
    answers: List[AnswerSubmit]
    gender: str
    login: Optional[str] = None
    orientation: Optional[str] = None
    user_id: Optional[int] = None  # Добавляем ID авторизованного пользователя

class ConsultationCreate(BaseModel):
    user_id: Optional[int] = None
    name: str = Field(..., min_length=2, max_length=100)
    telegram: Optional[str] = None
    category: Optional[str] = None
    topic: Optional[str] = None
    request_text: str = Field(..., min_length=10, max_length=2000)

class CompatibilityCheck(BaseModel):
    code1: str = Field(..., max_length=50)
    code2: str = Field(..., max_length=50)

class TestCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category: Optional[str] = Field(None, max_length=100)

class TestQuestionCreate(BaseModel):
    test_id: int
    text: str = Field(..., min_length=5, max_length=2000)
    order_index: int = Field(..., gt=0)

class AnswerOptionCreate(BaseModel):
    question_id: int
    text: str = Field(..., min_length=1, max_length=500)
    score: float = Field(..., ge=0)
    order_index: int = Field(..., gt=0)

class TestResultCreate(BaseModel):
    user_id: int
    test_type: str
    total_score: float = 0.0
    archetype_result: Optional[str] = None
    archetype_name: Optional[str] = None
    scores_breakdown: Optional[str] = None
    result_text: Optional[str] = None

# === АВТОРИЗАЦИЯ ===
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=401, detail="Токен недействителен")
        user_id = int(user_id_str)
    except JWTError:
        raise HTTPException(status_code=401, detail="Токен недействителен")
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Токен недействителен")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        logger.warning(f"Попытка доступа админ-панели: {current_user.login}")
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    return current_user

# === ТАБЛИЦА КОМПЛЕМЕНТАРНОСТИ ===
COMPLEMENTARITY = {
    "1.1": ["2.7", "2.5"], "1.2": ["2.7", "2.4"], "1.3": ["2.6", "2.3"],
    "1.4": ["2.5", "2.3", "2.4", "2.6"], "1.5": ["2.5", "2.2", "2.1", "2.6"],
    "1.6": ["2.4", "2.2", "2.3", "2.5"], "1.7": ["2.5", "2.7", "2.4"],
    "2.1": ["1.5", "1.4", "1.7"], "2.2": ["1.1", "1.5", "1.6"],
    "2.3": ["1.4", "1.7", "1.3"], "2.4": ["1.6", "1.7", "1.4", "1.2"],
    "2.5": ["1.5", "1.4", "1.6", "1.7"], "2.6": ["1.3", "1.5"],
    "2.7": ["1.1", "1.5", "1.6", "1.7"],
}

def calculate_status(score: int) -> str:
    if score >= 4: return "A"
    elif score == 3: return "M"
    elif score == 2: return "N"
    else: return "P"

def calculate_compatibility(scores1: Dict, scores2: Dict) -> Dict[str, Any]:
    active1 = {code: calculate_status(score) for code, score in scores1.items()}
    active2 = {code: calculate_status(score) for code, score in scores2.items()}
    A_count, P_count = 0, 0

    for code1, status1 in active1.items():
        if status1 != "A": continue
        for comp_code in COMPLEMENTARITY.get(code1, []):
            status2 = active2.get(comp_code, "P")
            if status2 in ["A", "M"]: A_count += 1
            elif status2 == "P": P_count += 1

    for code2, status2 in active2.items():
        if status2 != "A": continue
        for comp_code in COMPLEMENTARITY.get(code2, []):
            status1 = active1.get(comp_code, "P")
            if status1 in ["A", "M"]: A_count += 1
            elif status1 == "P": P_count += 1

    if A_count == 7 and P_count == 0: interpretation = "Максимальная прочность союза"
    elif A_count == 0 and P_count == 7: interpretation = "Минимальная прочность (развал)"
    elif P_count > 0 and A_count > P_count: interpretation = "База есть, но есть очаги конфликтов"
    elif A_count < P_count: interpretation = "Союз временный (против больше чем за)"
    else: interpretation = "Средняя совместимость"

    if A_count >= 3: interpretation += ". Отношения имеют тенденцию к сохранению"

    total = A_count + P_count
    score = (A_count / total * 100) if total > 0 else 50.0

    return {"index": f"{A_count}/{P_count}", "A_count": A_count, "P_count": P_count, "score": round(score, 1), "interpretation": interpretation}

# === INIT DB ===
@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)
    init_telegram()

    db = SessionLocal()
    try:
        # Создаём админа если нет
        admin = db.query(User).filter(User.login == "admin").first()
        if not admin:
            admin_password = "admin123"
            admin = User(
                login="admin",
                password_hash=hash_password(admin_password),
                telegram="@admin_psy",
                role="admin",
                session_id="admin-session-001"
            )
            db.add(admin)
            db.commit()
            logger.info(f"✅ Админ создан: login=admin, password={admin_password}")

        # Заполняем архетипы если пусто
        if db.query(ArchetypeDescription).count() == 0:
            female_archetypes = [
                {"code": "2.1", "name": "Ксения (Сестра/Артемида)", "color": "#4169E1", "chakra": 6,
                 "description": "Архетип сестры/охотницы. Независимая, целеустремленная.",
                 "strengths": "Независимость, целеустремленность", "weaknesses": "Может быть отстраненной"},
                {"code": "2.2", "name": "Кира (Стратег/Афина)", "color": "#8B00FF", "chakra": 7,
                 "description": "Архетип стратега. Рациональная, умная.",
                 "strengths": "Мудрость, стратегическое мышление", "weaknesses": "Может быть холодной"},
                {"code": "2.3", "name": "Катерина (Хранительница/Гестия)", "color": "#87CEEB", "chakra": 5,
                 "description": "Архетип хранительницы. Создаёт уют.",
                 "strengths": "Спокойствие, уют, мудрость", "weaknesses": "Может быть замкнутой"},
                {"code": "2.4", "name": "Карина (Возлюбленная/Афродита)", "color": "#FFA500", "chakra": 2,
                 "description": "Архетип любви и красоты.",
                 "strengths": "Чувственность, творчество", "weaknesses": "Может быть эмоциональной"},
                {"code": "2.5", "name": "Клара (Мать/Деметра)", "color": "#FF0000", "chakra": 1,
                 "description": "Архетип матери. Заботливая, тёплая.",
                 "strengths": "Заботливость, доброта, нежность", "weaknesses": "Может растворяться в детях"},
                {"code": "2.6", "name": "Кристина (Дочь/Персефона)", "color": "#008000", "chakra": 4,
                 "description": "Архетип дочери. Мягкая, адаптивная.",
                 "strengths": "Гибкость, адаптивность", "weaknesses": "Может быть зависимой"},
                {"code": "2.7", "name": "Каллерия (Жена/Гера)", "color": "#FFD700", "chakra": 3,
                 "description": "Архетип жены. Верная, ориентирована на семью.",
                 "strengths": "Верность, преданность", "weaknesses": "Может быть зависимой от партнёра"},
            ]
            for arch in female_archetypes:
                db.add(ArchetypeDescription(**arch))

            male_archetypes = [
                {"code": "1.1", "name": "Константин (Правитель/Зевс)", "color": "#4B0082",
                 "description": "Архетип правителя. Уверенный, лидер.",
                 "strengths": "Лидерство, ответственность", "weaknesses": "Не заботится о чувствах"},
                {"code": "1.2", "name": "Кирилл (Эмоциональный/Посейдон)", "color": "#0000FF",
                 "description": "Архетип эмоционального. Яркие чувства.",
                 "strengths": "Эмоциональность, глубина", "weaknesses": "Нестабильность"},
                {"code": "1.3", "name": "Клемент (Потусторонний/Гадес)", "color": "#2F4F4F",
                 "description": "Архетип потустороннего. Погружён в себя.",
                 "strengths": "Интуиция, глубина", "weaknesses": "Сложно адаптироваться"},
                {"code": "1.4", "name": "Кузьма (Умный/Гермес)", "color": "#FFD700",
                 "description": "Архетип путника. Постоянно в движении.",
                 "strengths": "Гибкость, ум", "weaknesses": "Непостоянство"},
                {"code": "1.5", "name": "Кондратий (Гармоничный/Аполлон)", "color": "#FF6347",
                 "description": "Архетип гармоничного. Любит точность.",
                 "strengths": "Дипломатичность, логика", "weaknesses": "Не хватает чувств"},
                {"code": "1.6", "name": "Кристиан (Ранимый/Гефест)", "color": "#708090",
                 "description": "Архетип творца. Чувствительный.",
                 "strengths": "Творчество, глубина", "weaknesses": "Замкнутость"},
                {"code": "1.7", "name": "Клим (Воинственный/Арес)", "color": "#8B0000",
                 "description": "Архетип воина. Эмоциональный, импульсивный.",
                 "strengths": "Энергия, страсть", "weaknesses": "Импульсивность"},
            ]
            for arch in male_archetypes:
                db.add(ArchetypeDescription(**arch))
            db.commit()
            logger.info("✅ Архетипы заполнены")

        # Заполняем вопросы если пусто
        if db.query(Question).count() == 0:
            female_q = [
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
            for text, code, order in female_q:
                db.add(Question(gender_type="female", text=text, archetype_code=code, order_index=order))

            male_q = [
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
            for text, code, order in male_q:
                db.add(Question(gender_type="male", text=text, archetype_code=code, order_index=order))
            db.commit()
            logger.info("✅ Вопросы заполнены (35 мужских + 35 женских)")
    finally:
        db.close()

# === GLOBAL ERROR HANDLER ===
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Необработанная ошибка: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Внутренняя ошибка сервера"})

# === API ENDPOINTS ===

@app.get("/")
async def root():
    return {"message": "Psycho Archetypes API", "status": "running", "version": "4.0.0"}

# === AUTH ===
@app.post("/api/auth/register")
async def register(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.login == data.login).first()
    if existing:
        raise HTTPException(400, "Пользователь уже существует")

    user = User(
        login=data.login.strip(),
        password_hash=hash_password(data.password),
        gender=data.gender,
        orientation=data.orientation,
        telegram=data.telegram,
        compatibility_code=None,  # Будет сгенерирован после прохождения теста
        role="user"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.id, "role": user.role})
    logger.info(f"Новый пользователь: {user.login} (ID: {user.id})")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id, "login": user.login, "telegram": user.telegram,
            "name": user.login, "gender": user.gender, "orientation": user.orientation,
            "role": user.role, "created_at": str(user.created_at)
        },
        "compatibility_code": None  # Тест ещё не пройден
    }

@app.post("/api/auth/login")
async def login(data: UserLogin, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host

    if rate_limiter.is_login_locked(client_ip):
        raise HTTPException(429, "Слишком много попыток входа. Подождите 15 минут.")

    user = db.query(User).filter(User.login == data.login).first()
    if not user:
        rate_limiter.record_login_attempt(client_ip, False)
        raise HTTPException(404, "Пользователь не найден")

    if not verify_password(data.password, user.password_hash):
        rate_limiter.record_login_attempt(client_ip, False)
        raise HTTPException(401, "Неверный пароль")

    rate_limiter.record_login_attempt(client_ip, True)
    token = create_access_token(data={"sub": user.id, "role": user.role})
    logger.info(f"Вход: {user.login} (ID: {user.id})")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id, "login": user.login, "telegram": user.telegram,
            "name": user.login, "gender": user.gender, "orientation": user.orientation,
            "role": user.role, "created_at": str(user.created_at)
        },
        "compatibility_code": user.compatibility_code
    }

# === QUESTIONS ===
@app.get("/api/questions/{gender}")
async def get_questions(gender: str, db: Session = Depends(get_db)):
    if gender not in ["male", "female"]:
        raise HTTPException(400, "Неверный параметр пола")

    questions = db.query(Question).filter(
        Question.gender_type == gender,
        Question.is_active == True
    ).order_by(Question.order_index).all()

    return [{
        "id": q.id, "text": sanitize_string(q.text, 1000) or "Вопрос в разработке",
        "archetype_code": q.archetype_code
    } for q in questions]

# === TEST COMPLETE ===
@app.post("/api/test/complete")
async def complete_test(data: TestComplete, db: Session = Depends(get_db)):
    try:
        if data.gender not in ["male", "female"]:
            raise HTTPException(400, "Неверный параметр пола")

        # Сохраняем ответы
        for ans in data.answers:
            db.add(Answer(session_id=data.session_id, question_id=ans.question_id, value=ans.value))

        # Считаем баллы
        scores = {}
        for ans in data.answers:
            if ans.value:
                q = db.query(Question).filter(Question.id == ans.question_id).first()
                if q:
                    scores[q.archetype_code] = scores.get(q.archetype_code, 0) + 1

        prefix = "1." if data.gender == "male" else "2."
        for i in range(1, 8):
            code = f"{prefix}{i}"
            if code not in scores:
                scores[code] = 0

        active_archetypes = {code: calculate_status(score) for code, score in scores.items()}

        # Ищем пользователя ТОЛЬКО по user_id (если авторизован)
        user = None
        if data.user_id:
            user = db.query(User).filter(User.id == data.user_id).first()
            if user:
                logger.info(f"Найден авторизованный пользователь: {user.login} (ID: {user.id})")
        
        # Если не авторизован, ищем по session_id или login
        if not user:
            user = db.query(User).filter(User.session_id == data.session_id).first()
            if not user and data.login:
                user = db.query(User).filter(User.login == data.login.strip()).first()

        # Если пользователя всё ещё нет — создаём
        if not user:
            code = generate_code()
            temp_password = secrets.token_urlsafe(16)
            user = User(
                login=data.login.strip() if data.login else f"user_{uuid.uuid4().hex[:8]}",
                password_hash=hash_password(temp_password),
                gender=data.gender,
                orientation=data.orientation,
                telegram=data.login,  # временно
                session_id=data.session_id,
                compatibility_code=code,
                archetype_scores=scores,
                active_archetypes=active_archetypes
            )
            db.add(user)
            logger.info(f"Создан новый временный пользователь: {user.login}")
        else:
            # Обновляем данные существующего пользователя
            user.archetype_scores = scores
            user.active_archetypes = active_archetypes
            user.gender = data.gender
            user.orientation = data.orientation
            user.session_id = data.session_id
            # Генерируем код только если его ещё нет
            if not user.compatibility_code:
                user.compatibility_code = generate_code()
                logger.info(f"Сгенерирован новый compatibility_code для {user.login}")

        try:
            db.commit()
            db.refresh(user)
        except Exception as commit_error:
            db.rollback()
            if "UNIQUE constraint failed" in str(commit_error) and "login" in str(commit_error):
                unique_login = f"{data.login.strip() if data.login else 'user'}_{uuid.uuid4().hex[:6]}"
                if not user.id:
                    user.login = unique_login
                else:
                    user.login = unique_login
                db.commit()
                db.refresh(user)
            else:
                raise HTTPException(status_code=500, detail=f"Ошибка сохранения: {str(commit_error)}")

        # Определяем основной архетип
        main_archetype_code = max(scores, key=scores.get) if scores else None
        main_archetype_name = None
        if main_archetype_code:
            arch_desc = db.query(ArchetypeDescription).filter(
                ArchetypeDescription.code == main_archetype_code
            ).first()
            main_archetype_name = arch_desc.name if arch_desc else None

        # === СОХРАНЯЕМ РЕЗУЛЬТАТ В test_results ===
        test_result = TestResult(
            user_id=user.id,
            user_login=user.login,
            user_telegram=user.telegram,
            test_type="archetype",
            gender=data.gender,
            total_score=sum(scores.values()),
            archetype_result=main_archetype_code,
            archetype_name=main_archetype_name,
            scores_breakdown=str(scores),
            result_text=f"Архетип: {main_archetype_name or main_archetype_code or 'Не определён'}"
        )
        db.add(test_result)
        db.commit()

        logger.info(f"Тест завершён: user={user.login}, archetype={main_archetype_name}, code={user.compatibility_code}")

        return {
            "session_id": data.session_id,
            "compatibility_code": user.compatibility_code,
            "scores": scores,
            "active_archetypes": active_archetypes,
            "archetype_code": main_archetype_code,
            "archetype_name": main_archetype_name
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка complete_test: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Ошибка: {str(e)}")

# === SAVE RESULTS TO AUTHORIZED USER ===
@app.post("/api/test/save-to-account")
async def save_results_to_account(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    code = data.get('compatibility_code')
    if not code:
        raise HTTPException(400, "Требуется compatibility_code")

    existing_user = db.query(User).filter(User.compatibility_code == code).first()
    if not existing_user:
        raise HTTPException(404, "Результаты не найдены")

    current_user.compatibility_code = existing_user.compatibility_code
    current_user.archetype_scores = existing_user.archetype_scores
    current_user.active_archetypes = existing_user.active_archetypes
    current_user.gender = existing_user.gender
    current_user.orientation = existing_user.orientation

    db.commit()
    db.refresh(current_user)

    logger.info(f"Результаты {code} сохранены в аккаунт {current_user.login}")
    return {"success": True, "compatibility_code": code, "archetype_scores": current_user.archetype_scores}

# === CONSULTATION (без phone/email!) ===
@app.post("/api/consultation")
async def create_consultation(data: ConsultationCreate, db: Session = Depends(get_db)):
    consultation = Consultation(
        user_id=data.user_id,
        name=sanitize_string(data.name, 100),
        telegram=data.telegram,
        category=data.category,
        topic=data.topic,
        request_text=sanitize_string(data.request_text, 2000)
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    logger.info(f"Новая заявка на консультацию от {consultation.name}")

    # Telegram notification
    await notify_consultation({
        "id": consultation.id,
        "name": consultation.name,
        "telegram": consultation.telegram,
        "category": consultation.category,
        "topic": consultation.topic,
        "request_text": consultation.request_text,
        "created_at": str(consultation.created_at)
    })

    return {"message": "Заявка отправлена", "id": consultation.id}

# === PROFILE ===
@app.get("/api/profile/{code}")
async def get_profile(code: str, db: Session = Depends(get_db)):
    if not re.match(r'^PSY-\d{8}-[A-Z0-9]{8,12}$', code):
        raise HTTPException(400, "Неверный формат кода")

    user = db.query(User).filter(User.compatibility_code == code).first()
    if not user:
        raise HTTPException(404, "Профиль не найден")

    scores = user.archetype_scores or {}
    active = user.active_archetypes or {}
    archetypes = db.query(ArchetypeDescription).all()
    arch_dict = {a.code: a for a in archetypes}

    result = []
    for code_a, score in sorted(scores.items(), key=lambda x: x[1], reverse=True):
        arch = arch_dict.get(code_a)
        status = active.get(code_a, calculate_status(score))
        result.append({
            "code": code_a, "name": arch.name if arch else code_a, "score": score,
            "status": status, "color": arch.color if arch else "#999",
            "chakra": arch.chakra if arch else None,
            "description": sanitize_string(arch.description, 500) if arch else "",
            "strengths": sanitize_string(arch.strengths, 300) if arch else "",
            "weaknesses": sanitize_string(arch.weaknesses, 300) if arch else ""
        })

    return {"compatibility_code": code, "archetypes": result, "gender": user.gender}

# === COMPATIBILITY ===
@app.post("/api/compatibility/check")
async def check_compatibility(data: CompatibilityCheck, db: Session = Depends(get_db)):
    user1 = db.query(User).filter(User.compatibility_code == data.code1).first()
    user2 = db.query(User).filter(User.compatibility_code == data.code2).first()

    if not user1 or not user2:
        raise HTTPException(404, "Коды не найдены")

    scores1 = user1.archetype_scores or {}
    scores2 = user2.archetype_scores or {}
    result = calculate_compatibility(scores1, scores2)

    couple = Couple(
        user1_code=data.code1, user2_code=data.code2,
        compatibility_index=result["index"], a_count=result["A_count"],
        p_count=result["P_count"], score=result["score"],
        interpretation=result["interpretation"]
    )
    db.add(couple)
    db.commit()

    return {"user1": {"login": user1.login, "code": data.code1}, "user2": {"login": user2.login, "code": data.code2}, **result}

# ========================================
# === ADMIN ENDPOINTS ===
# ========================================

@app.get("/api/admin/dashboard")
async def get_admin_dashboard(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "stats": {
            "total_users": db.query(User).count(),
            "total_consultations": db.query(Consultation).count(),
            "new_consultations": db.query(Consultation).filter(Consultation.status == "new").count(),
            "total_tests": db.query(Test).filter(Test.is_active == True).count(),
            "total_results": db.query(TestResult).count()
        },
        "recent_consultations": [
            {
                "id": c.id, "user_id": c.user_id, "name": c.name,
                "telegram": c.telegram, "category": c.category, "topic": c.topic,
                "status": c.status, "created_at": str(c.created_at)
            }
            for c in db.query(Consultation).order_by(Consultation.created_at.desc()).limit(10).all()
        ],
        "recent_users": [
            {"id": u.id, "login": u.login, "telegram": u.telegram, "role": u.role, "created_at": str(u.created_at)}
            for u in db.query(User).order_by(User.created_at.desc()).limit(10).all()
        ]
    }

@app.get("/api/admin/users")
async def get_all_users(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id, "login": u.login, "telegram": u.telegram,
            "gender": u.gender, "role": u.role, "created_at": str(u.created_at),
            "is_active": u.is_active, "compatibility_code": u.compatibility_code
        }
        for u in users
    ]

@app.post("/api/admin/users/{user_id}/role")
async def update_user_role(user_id: int, data: dict, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    role = data.get("role")
    if role not in ["admin", "user"]:
        raise HTTPException(400, "Роль: 'admin' или 'user'")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Пользователь не найден")

    user.role = role
    db.commit()
    logger.info(f"{current_user.login} изменил роль {user.login} на {role}")
    return {"message": f"Роль изменена на '{role}'", "user_id": user_id}

@app.delete("/api/admin/users/{user_id}")
async def delete_user(user_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    if current_user.id == user_id:
        raise HTTPException(400, "Нельзя удалить себя")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Пользователь не найден")

    # Delete related test_results first (cascade will handle this automatically)
    db.query(TestResult).filter(TestResult.user_id == user_id).delete()
    
    db.delete(user)
    db.commit()
    logger.info(f"{current_user.login} удалил пользователя ID: {user_id}")
    return {"message": "Пользователь удален", "user_id": user_id}

@app.get("/api/admin/test-results")
async def get_all_test_results(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    results = db.query(TestResult).order_by(TestResult.completed_at.desc()).all()
    return [
        {
            "id": r.id, "user_id": r.user_id, "user_login": r.user_login,
            "user_telegram": r.user_telegram, "test_type": r.test_type,
            "gender": r.gender, "archetype_code": r.archetype_result,
            "archetype_name": r.archetype_name, "total_score": r.total_score,
            "scores_breakdown": r.scores_breakdown, "result_text": r.result_text,
            "completed_at": str(r.completed_at)
        }
        for r in results
    ]

@app.get("/api/admin/test-results/{user_id}")
async def get_user_test_results(user_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    results = db.query(TestResult).filter(TestResult.user_id == user_id).order_by(TestResult.completed_at.desc()).all()
    return [
        {
            "id": r.id, "user_login": r.user_login, "user_telegram": r.user_telegram,
            "test_type": r.test_type, "gender": r.gender, "archetype_code": r.archetype_result,
            "archetype_name": r.archetype_name, "total_score": r.total_score,
            "scores_breakdown": r.scores_breakdown, "result_text": r.result_text,
            "completed_at": str(r.completed_at)
        }
        for r in results
    ]

@app.get("/api/admin/consultations")
async def get_consultations(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    consultations = db.query(Consultation).order_by(Consultation.created_at.desc()).all()
    return [
        {
            "id": c.id, "user_id": c.user_id, "name": c.name,
            "telegram": c.telegram, "category": c.category, "topic": c.topic,
            "request": c.request_text, "status": c.status,
            "created_at": str(c.created_at)
        }
        for c in consultations
    ]

@app.post("/api/admin/consultations/{consultation_id}/status")
async def update_consultation_status(consultation_id: int, data: dict, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    status = data.get("status")
    if status not in ["new", "in_progress", "completed", "cancelled"]:
        raise HTTPException(400, "Неверный статус")

    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(404, "Консультация не найдена")

    consultation.status = status
    db.commit()
    logger.info(f"{current_user.login} обновил статус заявки #{consultation_id} на {status}")
    return {"message": "Статус обновлен", "consultation_id": consultation_id, "new_status": status}

@app.get("/api/admin/questions")
async def admin_get_questions(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    questions = db.query(Question).all()
    return [
        {
            "id": q.id, "gender_type": q.gender_type, "text": q.text,
            "archetype_code": q.archetype_code, "order_index": q.order_index,
            "is_active": q.is_active
        }
        for q in questions
    ]

@app.get("/api/admin/archetypes")
async def admin_get_archetypes(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    archetypes = db.query(ArchetypeDescription).all()
    return [
        {
            "id": a.id, "code": a.code, "name": a.name, "color": a.color,
            "chakra": a.chakra, "description": a.description,
            "strengths": a.strengths, "weaknesses": a.weaknesses
        }
        for a in archetypes
    ]

# === TESTS (Admin) ===
@app.post("/api/tests")
async def create_test(test: TestCreate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    new_test = Test(
        title=sanitize_string(test.title, 200),
        description=sanitize_string(test.description, 2000),
        category=sanitize_string(test.category, 100)
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    logger.info(f"{current_user.login} создал тест #{new_test.id}")
    return {"message": "Тест создан", "test_id": new_test.id, "title": new_test.title}

@app.put("/api/tests/{test_id}")
async def update_test(test_id: int, test: TestCreate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    test_db = db.query(Test).filter(Test.id == test_id).first()
    if not test_db:
        raise HTTPException(404, "Тест не найден")
    test_db.title = sanitize_string(test.title, 200)
    test_db.description = sanitize_string(test.description, 2000)
    test_db.category = sanitize_string(test.category, 100)
    db.commit()
    return {"message": "Тест обновлен", "test_id": test_id}

@app.delete("/api/tests/{test_id}")
async def delete_test(test_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(404, "Тест не найден")
    
    db.delete(test)
    db.commit()
    logger.info(f"{current_user.login} удалил тест #{test_id}")
    return {"message": "Тест удален", "test_id": test_id}

@app.get("/api/tests")
async def get_all_tests(db: Session = Depends(get_db)):
    tests = db.query(Test).filter(Test.is_active == True).all()
    return [
        {"id": t.id, "title": t.title, "description": t.description,
         "category": t.category, "created_at": str(t.created_at)}
        for t in tests
    ]

@app.get("/api/tests/{test_id}")
async def get_test(test_id: int, db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(404, "Тест не найден")
    return {
        "id": test.id, "title": test.title, "description": test.description,
        "category": test.category, "is_active": test.is_active
    }

@app.post("/api/tests/questions")
async def create_question(question: TestQuestionCreate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    logger.info(f"Получены данные для вопроса: test_id={question.test_id}, text={question.text[:50]}..., order_index={question.order_index}")
    
    # Проверяем существование теста
    test_exists = db.query(Test).filter(Test.id == question.test_id).first()
    if not test_exists:
        raise HTTPException(404, f"Тест с ID {question.test_id} не найден")
    
    new_question = TestQuestion(
        test_id=question.test_id,
        text=sanitize_string(question.text, 2000),
        order_index=question.order_index
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    logger.info(f"{current_user.login} добавил вопрос к тесту #{question.test_id}")
    return {"message": "Вопрос добавлен", "question_id": new_question.id}

@app.delete("/api/tests/questions/{question_id}")
async def delete_question(question_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    question = db.query(TestQuestion).filter(TestQuestion.id == question_id).first()
    if not question:
        raise HTTPException(404, "Вопрос не найден")
    db.delete(question)
    db.commit()
    return {"message": "Вопрос удален", "question_id": question_id}

@app.get("/api/tests/{test_id}/questions")
async def get_test_questions(test_id: int, db: Session = Depends(get_db)):
    questions = db.query(TestQuestion).filter(
        TestQuestion.test_id == test_id,
        TestQuestion.is_active == True
    ).order_by(TestQuestion.order_index).all()
    return [{"id": q.id, "text": q.text, "order_index": q.order_index} for q in questions]

@app.post("/api/tests/answers")
async def create_answer_option(answer: AnswerOptionCreate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    new_answer = AnswerOption(
        question_id=answer.question_id,
        text=sanitize_string(answer.text, 500),
        score=answer.score,
        order_index=answer.order_index
    )
    db.add(new_answer)
    db.commit()
    db.refresh(new_answer)
    return {"message": "Вариант добавлен", "answer_id": new_answer.id}

@app.put("/api/tests/answers/{answer_id}")
async def update_answer_option(answer_id: int, answer: AnswerOptionCreate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    answer_db = db.query(AnswerOption).filter(AnswerOption.id == answer_id).first()
    if not answer_db:
        raise HTTPException(404, "Вариант не найден")
    answer_db.text = sanitize_string(answer.text, 500)
    answer_db.score = answer.score
    answer_db.order_index = answer.order_index
    db.commit()
    return {"message": "Вариант обновлен", "answer_id": answer_id}

@app.delete("/api/tests/answers/{answer_id}")
async def delete_answer_option(answer_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    answer = db.query(AnswerOption).filter(AnswerOption.id == answer_id).first()
    if not answer:
        raise HTTPException(404, "Вариант не найден")
    db.delete(answer)
    db.commit()
    return {"message": "Вариант удален", "answer_id": answer_id}

@app.get("/api/questions/{question_id}/answers")
async def get_answer_options(question_id: int, db: Session = Depends(get_db)):
    answers = db.query(AnswerOption).filter(
        AnswerOption.question_id == question_id,
        AnswerOption.is_active == True
    ).order_by(AnswerOption.order_index).all()
    return [{"id": a.id, "text": a.text, "score": a.score, "order_index": a.order_index} for a in answers]

# === TEST RESULTS ===
@app.post("/api/test-results")
async def save_test_result(result: TestResultCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_result = TestResult(
        user_id=result.user_id,
        user_login=current_user.login,
        user_telegram=current_user.telegram,
        test_type=result.test_type,
        gender=current_user.gender,
        total_score=result.total_score,
        archetype_result=result.archetype_result,
        archetype_name=result.archetype_name,
        scores_breakdown=result.scores_breakdown,
        result_text=result.result_text
    )
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    return {"message": "Результат сохранен", "result_id": new_result.id}

@app.get("/api/users/{user_id}/results")
async def get_user_results(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(403, "Доступ запрещен")
    results = db.query(TestResult).filter(TestResult.user_id == user_id).all()
    return [
        {"id": r.id, "test_type": r.test_type, "total_score": r.total_score,
         "result_text": r.result_text, "completed_at": str(r.completed_at)}
        for r in results
    ]

@app.get("/api/tests/{test_id}/results")
async def get_test_results(test_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    results = db.query(TestResult).filter(TestResult.test_type == str(test_id)).all()
    return [
        {"id": r.id, "user_id": r.user_id, "user_login": r.user_login,
         "total_score": r.total_score, "result_text": r.result_text,
         "completed_at": str(r.completed_at)}
        for r in results
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
