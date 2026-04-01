from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
import uuid

# === КОНФИГУРАЦИЯ ===
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

DATABASE_URL = "sqlite:///./psycho.db"

app = FastAPI(title="Psycho Archetypes API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === БАЗА ДАННЫХ ===
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# === МОДЕЛИ БАЗЫ ДАННЫХ ===
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=True)
    password_hash = Column(String(256), nullable=True)
    gender = Column(String(10), nullable=False)  # "male" или "female"
    orientation = Column(String(20), nullable=True)
    session_id = Column(String(100), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    answers = relationship("Answer", back_populates="user", cascade="all, delete-orphan")
    profiles = relationship("Profile", back_populates="user", cascade="all, delete-orphan")
    consultations = relationship("Consultation", back_populates="user", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    gender_type = Column(String(10), nullable=False)  # "male" или "female"
    text = Column(Text, nullable=True)  # Может быть null для мужских вопросов
    archetype_code = Column(String(10), nullable=False)  # "1.1", "2.5" и т.д.
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)


class Answer(Base):
    __tablename__ = "answers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), nullable=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    value = Column(Boolean, nullable=False)  # true/false
    created_at = Column(DateTime, default=datetime.utcnow)
    
    question = relationship("Question")
    user = relationship("User", back_populates="answers")


class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    archetype_scores = Column(JSON, nullable=False)  # {"1.1": 5, "1.2": 3, ...}
    active_archetypes = Column(JSON, nullable=False)  # {"1.1": "A", "1.2": "P", ...}
    compatibility_code = Column(String(20), unique=True, index=True)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="profiles")


class Couple(Base):
    __tablename__ = "couples"
    
    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user2_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    compatibility_index = Column(String(20), nullable=True)  # "A/P" формат
    compatibility_score = Column(Float, nullable=True)
    report_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Consultation(Base):
    __tablename__ = "consultations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    request_text = Column(Text, nullable=False)
    status = Column(String(20), default="new")  # new, processed, done
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="consultations")


class ArchetypeDescription(Base):
    __tablename__ = "archetype_descriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    color = Column(String(20), nullable=True)
    chakra = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)


# === PYDANTIC СХЕМЫ ===
class UserCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    gender: str
    orientation: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class AnswerSubmit(BaseModel):
    question_id: int
    value: bool


class TestComplete(BaseModel):
    answers: List[AnswerSubmit]
    goal: str  # "archetype", "compatibility", "selfdiscovery", "consultation"
    partner_code: Optional[str] = None
    consultation_request: Optional[str] = None


class CompatibilityCheck(BaseModel):
    code1: str
    code2: str


class ConsultationCreate(BaseModel):
    request_text: str


class QuestionUpdate(BaseModel):
    text: Optional[str] = None
    is_active: Optional[bool] = None


class ArchetypeDescriptionUpdate(BaseModel):
    description: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None


# === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def generate_compatibility_code() -> str:
    timestamp = datetime.now().strftime("%Y%m%d")
    random_part = uuid.uuid4().hex[:8].upper()
    return f"PSY-{timestamp}-{random_part}"


# === ТАБЛИЦА КОМПЛЕМЕНТАРНОСТИ ===
COMPLEMENTARITY = {
    "1.1": ["2.7", "2.5"],
    "1.2": ["2.7", "2.4"],
    "1.3": ["2.6", "2.3"],
    "1.4": ["2.5", "2.3", "2.4", "2.6"],
    "1.5": ["2.5", "2.2", "2.1", "2.6"],
    "1.6": ["2.4", "2.2", "2.3", "2.5"],
    "1.7": ["2.5", "2.7", "2.4"],
    "2.1": ["1.5", "1.4", "1.7"],
    "2.2": ["1.1", "1.5", "1.6"],
    "2.3": ["1.4", "1.7", "1.3"],
    "2.4": ["1.6", "1.7", "1.4", "1.2"],
    "2.5": ["1.5", "1.4", "1.6", "1.7"],
    "2.6": ["1.3", "1.5"],
    "2.7": ["1.1", "1.5", "1.6", "1.7"],
}


def calculate_archetype_status(score: int) -> tuple:
    """Возвращает (статус, вес)"""
    if score >= 4:
        return ("A", 1.0)  # Активный
    elif score == 3:
        return ("M", 0.5)  # Средний
    elif score == 2:
        return ("N", 0.0)  # Неопределенный
    else:
        return ("P", -1.0)  # Пассивный


def calculate_compatibility(profile1: Profile, profile2: Profile) -> Dict[str, Any]:
    """Расчет совместимости между двумя профилями"""
    scores1 = profile1.archetype_scores
    scores2 = profile2.archetype_scores
    active1 = profile1.active_archetypes
    active2 = profile2.active_archetypes
    
    A_count = 0  # Активные совпадения
    P_count = 0  # Пассивные конфликты
    
    # Проверяем все архетипы первого партнера
    for code1, status1 in active1.items():
        if status1 != "A":  # Только активные архетипы
            continue
        
        # Получаем комплементарные архетипы
        complementary_codes = COMPLEMENTARITY.get(code1, [])
        
        for comp_code in complementary_codes:
            status2 = active2.get(comp_code, "P")
            
            if status2 == "A" or status2 == "M":
                A_count += 1
            elif status2 == "P":
                P_count += 1
    
    # Проверяем архетипы второго партнера
    for code2, status2 in active2.items():
        if status2 != "A":
            continue
        
        complementary_codes = COMPLEMENTARITY.get(code2, [])
        
        for comp_code in complementary_codes:
            status1 = active1.get(comp_code, "P")
            
            if status1 == "A" or status1 == "M":
                if comp_code not in [c for c in COMPLEMENTARITY.get(code2, []) if active1.get(c) in ["A", "M"]]:
                    A_count += 1
            elif status1 == "P":
                P_count += 1
    
    # Интерпретация
    if P_count == 0:
        interpretation = "Максимальная прочность союза"
    elif A_count == 0:
        interpretation = "Минимальная прочность (риск развала)"
    elif P_count > 0 and A_count / P_count > 1:
        interpretation = "База есть, но есть очаги конфликтов"
    elif A_count < P_count:
        interpretation = "Союз временный (против больше чем за)"
    else:
        interpretation = "Средняя совместимость"
    
    # Правило спасения: если A >= 3, отношения сохраняются
    if A_count >= 3:
        interpretation += ". Отношения имеют тенденцию к сохранению"
    
    index_str = f"{A_count}/{P_count}"
    score = A_count / (A_count + P_count) if (A_count + P_count) > 0 else 0.5
    
    return {
        "index": index_str,
        "A_count": A_count,
        "P_count": P_count,
        "score": round(score * 100, 1),
        "interpretation": interpretation
    }


# === МАРШРУТЫ API ===

@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)
    
    # Инициализация описаний архетипов
    db = SessionLocal()
    try:
        if db.query(ArchetypeDescription).count() == 0:
            # Женские архетипы (2.x)
            female_archetypes = [
                {"code": "2.1", "name": "Ксения (Сестра/Артемида)", "color": "#4169E1", "chakra": 6},
                {"code": "2.2", "name": "Кира (Стратег/Афина)", "color": "#8B00FF", "chakra": 7},
                {"code": "2.3", "name": "Катерина (Хранительница/Гестия)", "color": "#87CEEB", "chakra": 5},
                {"code": "2.4", "name": "Карина (Возлюбленная/Афродита)", "color": "#FFA500", "chakra": 2},
                {"code": "2.5", "name": "Клара (Мать/Деметра)", "color": "#FF0000", "chakra": 1},
                {"code": "2.6", "name": "Кристина (Дочь/Персефона)", "color": "#008000", "chakra": 4},
                {"code": "2.7", "name": "Каллерия (Жена/Гера)", "color": "#FFD700", "chakra": 3},
            ]
            # Мужские архетипы (1.x)
            male_archetypes = [
                {"code": "1.1", "name": "Константин (Правитель/Зевс)", "color": "#4B0082"},
                {"code": "1.2", "name": "Кирилл (Эмоциональный/Посейдон)", "color": "#0000FF"},
                {"code": "1.3", "name": "Клемент (Потусторонний/Гадес)", "color": "#2F4F4F"},
                {"code": "1.4", "name": "Кузьма (Умный/Гермес)", "color": "#FFD700"},
                {"code": "1.5", "name": "Кондратий (Гармоничный/Аполлон)", "color": "#FF6347"},
                {"code": "1.6", "name": "Кристиан (Ранимый/Гефест)", "color": "#708090"},
                {"code": "1.7", "name": "Клим (Воинственный/Арес)", "color": "#8B0000"},
            ]
            
            all_archetypes = female_archetypes + male_archetypes
            for arch in all_archetypes:
                db.add(ArchetypeDescription(**arch))
            
            # Женские вопросы (35 вопросов)
            female_questions_data = [
                ("Мне нравится быть в образе мамы, такой теплой и заботливой. Даже в детстве мне нравилось играть с куклами.", "2.5", 1),
                ("Я с детства любила мечтать, путешествовала в своих мирах и фантазиях.", "2.6", 2),
                ("Я всегда чувствовала себя как будто в ответе за взрослых, сочувствовала им.", "2.5", 3),
                ("Девочкой меня называли «пацанкой». Меня интересовали больше мальчишеские забавы.", "2.1", 4),
                ("Когда я была маленькой, родители бурно ссорились. Я старалась стать незаметной.", "2.3", 5),
                ("Я с детства планировала свою свадьбу, представляла идеального партнера.", "2.7", 6),
                ("Тема секса всегда немного запретная, но вызывала больше любопытства, чем страха.", "2.4", 7),
                ("Глава семьи – отец, он опора, стабильность и сила. Главное чувство к нему – уважение.", "2.2", 8),
                ("С детства споры мамы и папы для меня были однозначны: папа всегда был прав.", "2.2", 9),
                ("Чтобы меня убедить, нужно быть логичным, приводить веские аргументы.", "2.6", 10),
                ("Смотря на родителей, мне всегда хотелось быть как папа. Он вызывал гордость.", "2.2", 11),
                ("Я верю в судьбу, предопределенность. Если что-то предназначено, этого стоит ждать.", "2.3", 12),
                ("Принять решение одной – сравни эгоизму. Мне нужно одобрение близких.", "2.6", 13),
                ("И в детстве и сейчас у меня много друзей. Я люблю шумные компании.", "2.1", 14),
                ("Когда домочадцев нет дома, наступает мое волшебное время. Я навожу уют.", "2.3", 15),
                ("Красивые вещи меня гипнотизируют. Я ценю эстетику.", "2.6", 16),
                ("Преданность и верность - главные ценности в отношениях.", "2.7", 17),
                ("Выбирая партнера, я смотрю на его мужественность и достижения.", "2.2", 18),
                ("Мужчина ведом, лучше всегда будь на страже отношений.", "2.7", 19),
                ("Синоним «партнера» для меня – скорее «друг».", "2.1", 20),
                ("Когда я готовлю, я словно колдую. Вкладываю душу.", "2.5", 21),
                ("Одно из приятных ощущений – ощущение своего тела, его движений.", "2.4", 22),
                ("Огонь - это таинство. Я могу смотреть на него бесконечно.", "2.3", 23),
                ("Себя и близких я в обиду не дам. Буду защищать до конца.", "2.1", 24),
                ("Главные чувства в отношениях – тепло и забота.", "2.6", 25),
                ("Вечеринки, тусовки, шумные посиделки – это всё «моё».", "2.1", 26),
                ("Женщину должен обеспечивать её мужчина.", "2.7", 27),
                ("Забавно, но из опыта я поняла: мужчина тот же мальчик.", "2.3", 28),
                ("У мужчин есть своя особая сексуальность. Мне она нравится.", "2.4", 29),
                ("Если партнер в сексе получил удовольствие, я получаю большее.", "2.5", 30),
                ("Моё отношение к сексу простое – это физиологическая потребность.", "2.2", 31),
                ("Когда я вступаю в близкие отношения, я не мыслю их без секса.", "2.4", 32),
                ("Таинство секса – это подарок мой миру. Нечто сакральное.", "2.3", 33),
                ("С сексом все просто – это супружеский долг.", "2.7", 34),
                ("Я не разделяю любовь и секс. Одно без другого не существует.", "2.4", 35),
            ]
            
            for i, (text, code, order) in enumerate(female_questions_data):
                db.add(Question(gender_type="female", text=text, archetype_code=code, order_index=order))
            
            # Мужские вопросы (заглушки - тексты будут добавлены через админку)
            male_archetype_codes = ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7"]
            for i, code in enumerate(male_archetype_codes):
                for j in range(5):  # По 5 вопросов на каждый архетип
                    db.add(Question(
                        gender_type="male",
                        text=None,  # Тексты добавит психолог
                        archetype_code=code,
                        order_index=i * 5 + j + 1
                    ))
            
            db.commit()
    finally:
        db.close()


@app.get("/")
async def root():
    return {"message": "Psycho Archetypes API", "version": "1.0.0"}


@app.post("/api/auth/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Проверка существующего пользователя
    if user_data.email:
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
    
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password) if user_data.password else None,
        gender=user_data.gender,
        orientation=user_data.orientation,
        session_id=str(uuid.uuid4())
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {
        "user_id": user.id,
        "session_id": user.session_id,
        "message": "Пользователь создан"
    }


@app.post("/api/auth/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "gender": user.gender
        }
    }


@app.get("/api/questions/{gender}")
async def get_questions(gender: str, db: Session = Depends(get_db)):
    questions = db.query(Question).filter(
        Question.gender_type == gender,
        Question.is_active == True
    ).order_by(Question.order_index).all()
    
    return [
        {
            "id": q.id,
            "text": q.text or "Вопрос в разработке",
            "archetype_code": q.archetype_code
        }
        for q in questions
    ]


@app.post("/api/test/complete")
async def complete_test(test_data: TestComplete, db: Session = Depends(get_db)):
    # Находим или создаем пользователя по session_id
    session = db.query(User).filter(User.session_id == test_data.answers[0].value if test_data.answers else str(uuid.uuid4())).first()
    if not session:
        session = User(
            name="Аноним",
            gender="female",
            session_id=str(uuid.uuid4())
        )
        db.add(session)
        db.commit()
        db.refresh(session)
    
    # Сохраняем ответы
    for answer_data in test_data.answers:
        answer = Answer(
            user_id=session.id,
            session_id=session.session_id,
            question_id=answer_data.question_id,
            value=answer_data.value
        )
        db.add(answer)
    
    db.commit()
    
    # Подсчет результатов
    answers = db.query(Answer).filter(Answer.session_id == session.session_id).all()
    questions = db.query(Question).all()
    
    archetype_scores = {}
    for answer in answers:
        question = db.query(Question).filter(Question.id == answer.question_id).first()
        if question and answer.value:
            code = question.archetype_code
            archetype_scores[code] = archetype_scores.get(code, 0) + 1
    
    # Определение статуса архетипов
    active_archetypes = {}
    for code, score in archetype_scores.items():
        status, _ = calculate_archetype_status(score)
        active_archetypes[code] = status
    
    # Генерация кода совместимости
    compatibility_code = generate_compatibility_code()
    
    # Создание профиля
    profile = Profile(
        user_id=session.id,
        archetype_scores=archetype_scores,
        active_archetypes=active_archetypes,
        compatibility_code=compatibility_code
    )
    db.add(profile)
    
    # Создание заявки на консультацию если нужно
    if test_data.goal == "consultation" and test_data.consultation_request:
        consultation = Consultation(
            user_id=session.id,
            request_text=test_data.consultation_request
        )
        db.add(consultation)
    
    db.commit()
    
    # Проверка совместимости если указан код партнера
    compatibility_result = None
    if test_data.goal == "compatibility" and test_data.partner_code:
        partner_profile = db.query(Profile).filter(Profile.compatibility_code == test_data.partner_code).first()
        if partner_profile:
            compatibility_result = calculate_compatibility(profile, partner_profile)
    
    return {
        "profile_id": profile.id,
        "archetype_scores": archetype_scores,
        "active_archetypes": active_archetypes,
        "compatibility_code": compatibility_code,
        "compatibility": compatibility_result
    }


@app.post("/api/compatibility/check")
async def check_compatibility(data: CompatibilityCheck, db: Session = Depends(get_db)):
    profile1 = db.query(Profile).filter(Profile.compatibility_code == data.code1).first()
    profile2 = db.query(Profile).filter(Profile.compatibility_code == data.code2).first()
    
    if not profile1 or not profile2:
        raise HTTPException(status_code=404, detail="Один или оба кода не найдены")
    
    result = calculate_compatibility(profile1, profile2)
    
    return {
        "user1_code": data.code1,
        "user2_code": data.code2,
        **result
    }


@app.get("/api/profile/{code}")
async def get_profile(code: str, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.compatibility_code == code).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Профиль не найден")
    
    # Получаем описания архетипов
    archetypes = db.query(ArchetypeDescription).all()
    archetypes_dict = {a.code: a for a in archetypes}
    
    # Сортируем архетипы по баллам
    sorted_archetypes = sorted(
        profile.archetype_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )
    
    result = []
    for code, score in sorted_archetypes:
        arch = archetypes_dict.get(code)
        status, _ = calculate_archetype_status(score)
        result.append({
            "code": code,
            "name": arch.name if arch else code,
            "score": score,
            "status": status,
            "color": arch.color if arch else "#999999",
            "description": arch.description if arch else "",
            "strengths": arch.strengths if arch else "",
            "weaknesses": arch.weaknesses if arch else ""
        })
    
    return {
        "compatibility_code": code,
        "completed_at": profile.completed_at.isoformat(),
        "archetypes": result
    }


@app.post("/api/consultation", response_model=dict)
async def create_consultation(consultation_data: ConsultationCreate, db: Session = Depends(get_db)):
    consultation = Consultation(
        user_id=1,  # Временный ID, будет привязан при авторизации
        request_text=consultation_data.request_text
    )
    db.add(consultation)
    db.commit()
    
    return {"message": "Заявка отправлена", "id": consultation.id}


# === АДМИН ПАНЕЛЬ ===
@app.get("/api/admin/questions", response_model=List[dict])
async def admin_get_questions(db: Session = Depends(get_db)):
    # В реальности здесь нужна проверка админских прав
    questions = db.query(Question).all()
    return [
        {
            "id": q.id,
            "gender_type": q.gender_type,
            "text": q.text,
            "archetype_code": q.archetype_code,
            "order_index": q.order_index,
            "is_active": q.is_active
        }
        for q in questions
    ]


@app.put("/api/admin/questions/{question_id}")
async def admin_update_question(question_id: int, update_data: QuestionUpdate, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")
    
    if update_data.text is not None:
        question.text = update_data.text
    if update_data.is_active is not None:
        question.is_active = update_data.is_active
    
    db.commit()
    return {"message": "Вопрос обновлен"}


@app.get("/api/admin/archetypes", response_model=List[dict])
async def admin_get_archetypes(db: Session = Depends(get_db)):
    archetypes = db.query(ArchetypeDescription).all()
    return [
        {
            "id": a.id,
            "code": a.code,
            "name": a.name,
            "color": a.color,
            "chakra": a.chakra,
            "description": a.description,
            "strengths": a.strengths,
            "weaknesses": a.weaknesses
        }
        for a in archetypes
    ]


@app.put("/api/admin/archetypes/{archetype_id}")
async def admin_update_archetype(archetype_id: int, update_data: ArchetypeDescriptionUpdate, db: Session = Depends(get_db)):
    archetype = db.query(ArchetypeDescription).filter(ArchetypeDescription.id == archetype_id).first()
    if not archetype:
        raise HTTPException(status_code=404, detail="Архетип не найден")
    
    if update_data.description is not None:
        archetype.description = update_data.description
    if update_data.strengths is not None:
        archetype.strengths = update_data.strengths
    if update_data.weaknesses is not None:
        archetype.weaknesses = update_data.weaknesses
    
    db.commit()
    return {"message": "Описание обновлено"}


@app.get("/api/admin/consultations", response_model=List[dict])
async def admin_get_consultations(db: Session = Depends(get_db)):
    consultations = db.query(Consultation).order_by(Consultation.created_at.desc()).all()
    return [
        {
            "id": c.id,
            "user_name": c.user.name if c.user else "Аноним",
            "request_text": c.request_text,
            "status": c.status,
            "created_at": c.created_at.isoformat()
        }
        for c in consultations
    ]


@app.put("/api/admin/consultations/{consultation_id}")
async def admin_update_consultation(consultation_id: int, status: str, db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    
    consultation.status = status
    db.commit()
    return {"message": "Статус обновлен"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
