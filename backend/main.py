from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from passlib.context import CryptContext
import uuid

SECRET_KEY = "psycho-secret-key-2024"
DATABASE_URL = "sqlite:///./psycho.db"

app = FastAPI(title="Psycho Archetypes API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    login = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(120), unique=True, nullable=True)
    phone = Column(String(20), nullable=True)
    gender = Column(String(10), nullable=True)
    orientation = Column(String(20), nullable=True)
    role = Column(String(20), default="user", nullable=False)
    session_id = Column(String(100), unique=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    compatibility_code = Column(String(20), unique=True, nullable=True)
    archetype_scores = Column(JSON, nullable=True)
    active_archetypes = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)

    consultations = relationship("Consultation", back_populates="user")
    test_results = relationship("TestResult", back_populates="user")

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
    created_at = Column(DateTime, default=datetime.utcnow)

class Consultation(Base):
    __tablename__ = "consultations"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(120), nullable=True)
    request_text = Column(Text, nullable=False)
    status = Column(String(20), default="new", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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
    user1_code = Column(String(20), nullable=False)
    user2_code = Column(String(20), nullable=False)
    compatibility_index = Column(String(20), nullable=True)
    a_count = Column(Integer, default=0)
    p_count = Column(Integer, default=0)
    score = Column(Float, default=0)
    interpretation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Test(Base):
    __tablename__ = "tests"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    questions = relationship("TestQuestion", back_populates="test")
    results = relationship("TestResult", back_populates="test")

class TestQuestion(Base):
    __tablename__ = "test_questions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    text = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    test = relationship("Test", back_populates="questions")
    answer_options = relationship("AnswerOption", back_populates="question")

class AnswerOption(Base):
    __tablename__ = "answer_options"
    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("test_questions.id"), nullable=False)
    text = Column(String(500), nullable=False)
    score = Column(Float, default=0.0)
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    
    question = relationship("TestQuestion", back_populates="answer_options")

class TestResult(Base):
    __tablename__ = "test_results"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    total_score = Column(Float, default=0.0)
    scores_breakdown = Column(Text, nullable=True)
    result_text = Column(Text, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="test_results")
    test = relationship("Test", back_populates="results")

class UserCreate(BaseModel):
    login: str
    password: str
    gender: str

class UserLogin(BaseModel):
    login: str
    password: str

class AnswerSubmit(BaseModel):
    question_id: int
    value: bool

class TestComplete(BaseModel):
    session_id: str
    answers: List[AnswerSubmit]
    gender: str
    login: Optional[str] = None
    orientation: Optional[str] = None

class ConsultationCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    request_text: str

class CompatibilityCheck(BaseModel):
    code1: str
    code2: str

class TestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None

class TestQuestionCreate(BaseModel):
    test_id: int
    text: str
    order_index: int

class AnswerOptionCreate(BaseModel):
    question_id: int
    text: str
    score: float
    order_index: int

class TestResultCreate(BaseModel):
    user_id: int
    test_id: int
    total_score: float
    scores_breakdown: Optional[Dict[str, float]] = None
    result_text: Optional[str] = None

class ConsultationWithUser(BaseModel):
    user_id: Optional[int] = None
    name: str
    phone: str
    email: Optional[str] = None
    request_text: str

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
    return f"PSY-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

def check_admin(user_id: int, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Доступ дозволено тільки адмінам")
    return user

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

def calculate_status(score: int) -> str:
    if score >= 4:
        return "A"
    elif score == 3:
        return "M"
    elif score == 2:
        return "N"
    else:
        return "P"

def calculate_compatibility(scores1: Dict, scores2: Dict) -> Dict[str, Any]:
    active1 = {code: calculate_status(score) for code, score in scores1.items()}
    active2 = {code: calculate_status(score) for code, score in scores2.items()}

    A_count = 0
    P_count = 0

    for code1, status1 in active1.items():
        if status1 != "A":
            continue

        complementary_codes = COMPLEMENTARITY.get(code1, [])

        for comp_code in complementary_codes:
            status2 = active2.get(comp_code, "P")

            if status2 in ["A", "M"]:
                A_count += 1
            elif status2 == "P":
                P_count += 1

    for code2, status2 in active2.items():
        if status2 != "A":
            continue

        complementary_codes = COMPLEMENTARITY.get(code2, [])

        for comp_code in complementary_codes:
            status1 = active1.get(comp_code, "P")

            if status1 in ["A", "M"]:
                A_count += 1
            elif status1 == "P":
                P_count += 1

    if A_count == 7 and P_count == 0:
        interpretation = "Максимальная прочность союза"
    elif A_count == 0 and P_count == 7:
        interpretation = "Минимальная прочность (развал)"
    elif P_count > 0 and A_count > P_count:
        interpretation = "База есть, но есть очаги конфликтов"
    elif A_count < P_count:
        interpretation = "Союз временный (против больше чем за)"
    else:
        interpretation = "Средняя совместимость"

    if A_count >= 3:
        interpretation += ". Отношения имеют тенденцию к сохранению"

    index_str = f"{A_count}/{P_count}"
    total = A_count + P_count
    score = (A_count / total * 100) if total > 0 else 50.0

    return {
        "index": index_str,
        "A_count": A_count,
        "P_count": P_count,
        "score": round(score, 1),
        "interpretation": interpretation
    }

@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.login == "admin").first()
        if not admin:
            admin = User(
                login="admin",
                password_hash=hash_password("admin123"),
                email="admin@psy.com",
                role="admin"
            )
            db.add(admin)
            db.commit()
            print("✅ Створено адміна: login='admin', password='admin123'")
        
        if db.query(ArchetypeDescription).count() == 0:
            female_archetypes = [
                {"code": "2.1", "name": "Ксения (Сестра/Артемида)", "color": "#4169E1", "chakra": 6, 
                 "description": "Архетип сестры/охотницы. Независимая, целеустремленная, ценит свободу и дружбу.",
                 "strengths": "Независимость, целеустремленность, умение дружить",
                 "weaknesses": "Может быть слишком отстраненной"},
                {"code": "2.2", "name": "Кира (Стратег/Афина)", "color": "#8B00FF", "chakra": 7,
                 "description": "Архетип стратега. Рациональная, умная, умеет планировать и достигать целей.",
                 "strengths": "Мудрость, стратегическое мышление, логика",
                 "weaknesses": "Может быть слишком холодной"},
                {"code": "2.3", "name": "Катерина (Хранительница/Гестия)", "color": "#87CEEB", "chakra": 5,
                 "description": "Архетип хранительницы. Создаёт уют, ценит спокойствие и гармонию в доме.",
                 "strengths": "Спокойствие, умение создавать уют, мудрость",
                 "weaknesses": "Может быть слишком замкнутой"},
                {"code": "2.4", "name": "Карина (Возлюбленная/Афродита)", "color": "#FFA500", "chakra": 2,
                 "description": "Архетип любви и красоты. Чувственная, привлекательная, умеет наслаждаться жизнью.",
                 "strengths": "Чувственность, творчество, умение любить",
                 "weaknesses": "Может быть слишком эмоциональной"},
                {"code": "2.5", "name": "Клара (Мать/Деметра)", "color": "#FF0000", "chakra": 1,
                 "description": "Архетип матери. Заботливая, тёплая, видит счастье в материнстве.",
                 "strengths": "Заботливость, доброта, нежность, терпеливость",
                 "weaknesses": "Может растворяться в детях"},
                {"code": "2.6", "name": "Кристина (Дочь/Персефона)", "color": "#008000", "chakra": 4,
                 "description": "Архетип дочери. Мягкая, адаптивная, открытая к новому.",
                 "strengths": "Гибкость, адаптивность, открытость",
                 "weaknesses": "Может быть слишком зависимой"},
                {"code": "2.7", "name": "Каллерия (Жена/Гера)", "color": "#FFD700", "chakra": 3,
                 "description": "Архетип жены. Верная, ориентирована на семью и долгосрочные отношения.",
                 "strengths": "Верность, преданность, умение создавать семью",
                 "weaknesses": "Может быть слишком зависимой от партнёра"},
            ]
            for arch in female_archetypes:
                db.add(ArchetypeDescription(**arch))

            male_archetypes = [
                {"code": "1.1", "name": "Константин (Правитель/Зевс)", "color": "#4B0082",
                 "description": "Архетип правителя. Уверенный, лидер, стремится управлять и создавать своё царство.",
                 "strengths": "Лидерство, ответственность, авторитет",
                 "weaknesses": "Не заботится о чувствах окружающих"},
                {"code": "1.2", "name": "Кирилл (Эмоциональный/Посейдон)", "color": "#0000FF",
                 "description": "Архетип эмоционального. Яркие чувства и эмоции, радость, печаль, гнев, страх.",
                 "strengths": "Эмоциональность, глубина переживаний",
                 "weaknesses": "Чрезмерная эмоциональность, нестабильность"},
                {"code": "1.3", "name": "Клемент (Потусторонний/Гадес)", "color": "#2F4F4F",
                 "description": "Архетип потустороннего. Погружён в себя, интуитивный, самодостаточный.",
                 "strengths": "Интуиция, глубина, самодостаточность",
                 "weaknesses": "Сложно адаптироваться в обществе"},
                {"code": "1.4", "name": "Кузьма (Умный/Гермес)", "color": "#FFD700",
                 "description": "Архетип путника. Постоянно в движении, умный, разнообразный, без корней.",
                 "strengths": "Гибкость, ум, талант общения",
                 "weaknesses": "Непостоянство, отсутствие глубины"},
                {"code": "1.5", "name": "Кондратий (Гармоничный/Аполлон)", "color": "#FF6347",
                 "description": "Архетип гармоничного. Любит точность и порядок, дипломатичный.",
                 "strengths": "Дипломатичность, логика, гармония",
                 "weaknesses": "Не хватает чувственного опыта"},
                {"code": "1.6", "name": "Кристиан (Ранимый/Гефест)", "color": "#708090",
                 "description": "Архетип творца. Чувствительный, творческий, глубокий, ранимый.",
                 "strengths": "Творчество, глубина чувств, чувствительность",
                 "weaknesses": "Замкнутость, трудности в общении"},
                {"code": "1.7", "name": "Клим (Воинственный/Арес)", "color": "#8B0000",
                 "description": "Архетип воина. Эмоциональный, живой, импульсивный, физически активный.",
                 "strengths": "Энергия, страсть, прямота",
                 "weaknesses": "Неуправляемость эмоций, импульсивность"},
            ]
            for arch in male_archetypes:
                db.add(ArchetypeDescription(**arch))

            female_q = [
                ("Мне нравится быть в образе мамы, такой теплой и заботливой. Даже в детстве мне нравилось играть с куклами, купать их, одевать, кормить, лечить.", "2.5", 1),
                ("Я с детства любила мечтать, я путешествовала в своих мирах и фантазиях. Они были яркими и заменяли мне скуку.", "2.6", 2),
                ("Я всегда чувствовала себя как будто в ответе за взрослых, сочувствовала и переживала за них.", "2.5", 3),
                ("Девочкой меня называли «пацанкой» или вроде того. Меня интересовали больше мальчишеские забавы и занятия.", "2.1", 4),
                ("Когда я была маленькой, порой родители бурно ссорились. В эти моменты я старалась стать незаметной, сжаться.", "2.3", 5),
                ("Я с детства планировала свою свадьбу, представляла идеального партнера.", "2.7", 6),
                ("Тема секса всегда немного запретная, но в детстве она вызывала у меня больше любопытства, чем страха.", "2.4", 7),
                ("Глава семьи – отец, он опора, стабильность и сила. Так было у меня в детстве. Главное чувство к нему – уважение.", "2.2", 8),
                ("С детства споры мамы и папы для меня были однозначны: папа всегда был для меня прав, его мышление, логика казались мне единственно верными.", "2.2", 9),
                ("Чтобы меня убедить, нужно быть логичным, приводить веские аргументы.", "2.6", 10),
                ("Смотря на родителей. Мне всегда хотелось быть почему-то как папа. Он вызывал чувство глубокой гордости и уважения.", "2.2", 11),
                ("Я верю в судьбу, предопределенность. Ведь если кто-то или что-то предназначено тебе судьбой, то этого стоит ждать.", "2.3", 12),
                ("Принять решение одной – сравни эгоизму. Мне нужно одобрение близких.", "2.6", 13),
                ("И в детстве и сейчас у меня много друзей. Я люблю шумные компании.", "2.1", 14),
                ("Когда домочадцев нет дома, наступает мое волшебное время. Я навожу порядок, делаю дом уютным.", "2.3", 15),
                ("Красивые вещи меня гипнотизируют. Я ценю эстетику.", "2.6", 16),
                ("Преданность и верность - главные ценности в отношениях.", "2.7", 17),
                ("Выбирая партнера (спутника) я смотрю на его мужественность и достижения в этом мире.", "2.2", 18),
                ("Мужчина ведом, лучше всегда будь на страже отношений.", "2.7", 19),
                ("Синоним «партнера» – скорее «друг».", "2.1", 20),
                ("Когда я готовлю, я словно колдую. Вкладываю душу.", "2.5", 21),
                ("Одно из приятных и важных для меня ощущений – ощущение своего тела, его движений.", "2.4", 22),
                ("Огонь - это таинство. Я могу смотреть на него бесконечно.", "2.3", 23),
                ("Себя и близких я в обиду не дам. Если надо, буду защищать как смогу, ругаться, но молчать не стану.", "2.1", 24),
                ("Главные чувства в отношениях – тепло и забота.", "2.6", 25),
                ("Вечеринки, тусовочки, шумные посиделки – это все «мое».", "2.1", 26),
                ("Женщину должен обеспечивать ее мужчина.", "2.7", 27),
                ("Забавно, но из моего опыта я поняла, что мужчина тот же мальчик.", "2.3", 28),
                ("У мужчин есть своя особая сексуальность. Мне она нравится.", "2.4", 29),
                ("Если мой партнер в сексе получил удовольствие, то я получаю большее удовольствие, нежели если он не получил.", "2.5", 30),
                ("Мое отношение к сексу очень простое – это не более чем физиологическая потребность.", "2.2", 31),
                ("Когда я вступаю в близкие отношения, я не мыслю их без секса.", "2.4", 32),
                ("Таинство секса – это подарок мой миру. Это скорее нечто сакральное и сокровенное, нежели простое удовольствие.", "2.3", 33),
                ("С сексом все просто – это супружеский долг.", "2.7", 34),
                ("Я не разделяю любовь и секс. Одно без другого не существует.", "2.4", 35),
            ]
            for text, code, order in female_q:
                db.add(Question(gender_type="female", text=text, archetype_code=code, order_index=order))

            male_q = [
                ("Семья для меня – это система, мое царство. Я стремлюсь быть главой, как мой отец, и хочу, чтобы жена вела дом, пока я строю карьеру.", "1.1", 1),
                ("Мои эмоции очень ярки: радость, гнев, страх – я проживаю их в полном объеме, даже если окружающим это кажется чрезмерным.", "1.2", 2),
                ("Мне сложно усидеть на одном месте. Я постоянно меняю интересы, идеи и ситуации, мне важно общение, но я не привязываюсь к корням.", "1.4", 3),
                ("Мне погружен в себя, мне комфортно в одиночестве. Мнение окружающих меня мало волнует, я живу в своем закрытом внутреннем пространстве.", "1.3", 4),
                ("Я очень чувствителен и раним, но не умею выражать это словами. Мне проще показать чувства через творчество или ремесло.", "1.6", 5),
                ("У меня много знакомых, я легко вступаю в контакт. Я щедр и весел в общении, но мало кто знает о моих истинных чувствах.", "1.4", 6),
                ("Я живу инстинктами «здесь и сейчас». Мои эмоции сразу реагируют во внешнем мире, я импульсивен и активен физически.", "1.7", 7),
                ("Я предпочитаю жить разумом, а не сердцем. Для меня важны логика, точность, порядок и внешний комфорт.", "1.5", 8),
                ("Я часто замечаю то, что скрыто от других. Я накапливаю обиды и радости внутри, так как мне сложно говорить о них вслух.", "1.6", 9),
                ("Я прирожденный дипломат. Я дорожу общением и всегда стараюсь найти компромисс, избегая открытых конфликтов.", "1.5", 10),
                ("В детстве отец был для меня авторитетом и опорой. Я уважаю силу и стремлюсь занять такое же положение лидера в своей семье.", "1.1", 11),
                ("Я ставлю перед собой реальные цели и знаю, как их добиться. Мне важно, чтобы вокруг было спокойно и эстетично.", "1.5", 12),
                ("Карьера и общественное положение – основа моей привлекательности. Я стремлюсь к власти и руководящим должностям.", "1.1", 13),
                ("Я объективно оцениваю ситуацию и редко пользуюсь субъективными впечатлениями. Мне важно сохранять равновесие и спокойствие.", "1.5", 14),
                ("Я выбираю женщину, которая будет восхищаться мной и покоряться моему плану. Для меня важен престиж союза.", "1.1", 15),
                ("Мои настроения переменчивы, как море. Мне мешает хладнокровие, я часто руководствуюсь сиюминутными порывами.", "1.2", 16),
                ("Меня привлекают спокойные и мягкие женщины, способные принять мою эмоциональность и бурные переживания.", "1.2", 17),
                ("Для меня важно, чтобы партнерша признавала мой авторитет. Неподчинение или несогласие я воспринимаю болезненно.", "1.1", 18),
                ("Я предпочитаю физически выражать свою симпатию. Секс, танец, совместная трапеза для меня – фейерверк эмоций и страсти.", "1.7", 19),
                ("Во взаимодействии с женщиной у меня могут проявляться патриархальные инстинкты: я стремлюсь доминировать просто потому, что я мужчина.", "1.2", 20),
                ("Мне трудно переносить одиночество, мне нужна мужская компания, спорт и признание меня как мужчины среди друзей.", "1.7", 21),
                ("Мне не хватает амбиций для рывка, я просто хочу жить комфортно для себя. Конкуренция мне менее интересна, чем гармония.", "1.5", 22),
                ("Я редко достигаю планов из-за высокой переключаемости внимания. Мне интересно все новое, дающее раскрыться моим эмоциям.", "1.2", 23),
                ("Я не создаю имидж и не ищу партнерш активно. Мои отношения строятся на основе ощущений и «диалога душ».", "1.3", 24),
                ("Мне нужна сильная и независимая женщина, которая сможет понять глубину моих переживаний и связать меня с реальностью.", "1.6", 25),
                ("Малейшие события оставляют в моей душе глубокий след на долгое время. Внутри меня – вихрь эмоций и анализ чувств.", "1.3", 26),
                ("Я никогда не становлюсь частью компании полностью. Я скорее наблюдаю за происходящим, чем активно участвую в тусовках.", "1.6", 27),
                ("Мой жизненный путь имеет множество сценариев. Если я нахожу интересное занятие, я могу стать мастером, но быстро остываю.", "1.4", 28),
                ("У меня есть несколько друзей, которые принимают мою замкнутость. Я не нуждаюсь в большой команде, мне достаточно избранных.", "1.3", 29),
                ("Я обладаю острым умом и талантом общения. В разговоре я излучаю обаяние и способен создать незабываемое впечатление.", "1.4", 30),
                ("Моя интуиция развита сильнее, чем логика. Я тонко чувствую людей и события, хотя внешне могу казаться отрешенным.", "1.3", 31),
                ("Я страстный мужчина, который полностью отдается физической близости. Меня привлекают такие же эмоциональные женщины, как я.", "1.7", 32),
                ("Я человек «без корней». Я с легкостью круто меняю свою жизнь, если вижу новую интересную цель или идею.", "1.4", 33),
                ("Общение для меня сложно и вызывает напряжение. Я не воспринимаю давления со стороны авторитетов и групп.", "1.6", 34),
                ("Мне несвойственно смотреть на себя со стороны. Я живу инстинктами и не всегда способен воспринимать свои и чужие чувства рационально.", "1.7", 35),
            ]
            for text, code, order in male_q:
                db.add(Question(gender_type="male", text=text, archetype_code=code, order_index=order))
            
            db.commit()
            print("База данных инициализирована!")
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Psycho Archetypes API", "status": "running"}

@app.get("/api/questions/{gender}")
async def get_questions(gender: str, db: Session = Depends(get_db)):
    questions = db.query(Question).filter(
        Question.gender_type == gender,
        Question.is_active == True
    ).order_by(Question.order_index).all()
    return [
        {"id": q.id, "text": q.text or "Вопрос в разработке", "archetype_code": q.archetype_code}
        for q in questions
    ]

@app.post("/api/test/complete")
async def complete_test(data: TestComplete, db: Session = Depends(get_db)):
    try:
        for ans in data.answers:
            db.add(Answer(session_id=data.session_id, question_id=ans.question_id, value=ans.value))

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

        user = db.query(User).filter(User.session_id == data.session_id).first()
        if not user:
            code = generate_code()
            user = User(
                login=data.login or "user",
                gender=data.gender,
                orientation=data.orientation,
                session_id=data.session_id,
                compatibility_code=code,
                archetype_scores=scores,
                active_archetypes=active_archetypes
            )
            db.add(user)
        else:
            user.archetype_scores = scores
            user.active_archetypes = active_archetypes

        db.commit()
        db.refresh(user)

        return {
            "session_id": data.session_id,
            "compatibility_code": user.compatibility_code,
            "scores": scores,
            "active_archetypes": active_archetypes
        }
    except Exception as e:
        db.rollback()
        print(f"Error in complete_test: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/consultation")
async def create_consultation(data: ConsultationWithUser, db: Session = Depends(get_db)):
    consultation = Consultation(
        user_id=data.user_id,
        name=data.name,
        phone=data.phone,
        email=data.email,
        request_text=data.request_text
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    return {"message": "Заявка отправлена", "id": consultation.id, "user_id": data.user_id}

@app.get("/api/profile/{code}")
async def get_profile(code: str, db: Session = Depends(get_db)):
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
            "code": code_a,
            "name": arch.name if arch else code_a,
            "score": score,
            "status": status,
            "color": arch.color if arch else "#999",
            "chakra": arch.chakra if arch else None,
            "description": arch.description if arch else "",
            "strengths": arch.strengths if arch else "",
            "weaknesses": arch.weaknesses if arch else ""
        })
    
    return {
        "compatibility_code": code,
        "archetypes": result,
        "gender": user.gender
    }

@app.post("/api/compatibility/check")
async def check_compatibility(data: CompatibilityCheck, db: Session = Depends(get_db)):
    user1 = db.query(User).filter(User.compatibility_code == data.code1).first()
    user2 = db.query(User).filter(User.compatibility_code == data.code2).first()
    
    if not user1 or not user2:
        raise HTTPException(404, "Один или оба кода не найдены")
    
    scores1 = user1.archetype_scores or {}
    scores2 = user2.archetype_scores or {}
    
    result = calculate_compatibility(scores1, scores2)

    couple = Couple(
        user1_code=data.code1,
        user2_code=data.code2,
        compatibility_index=result["index"],
        a_count=result["A_count"],
        p_count=result["P_count"],
        score=result["score"],
        interpretation=result["interpretation"]
    )
    db.add(couple)
    db.commit()
    
    return {
        "user1": {"login": user1.login, "code": data.code1},
        "user2": {"login": user2.login, "code": data.code2},
        **result
    }

@app.post("/api/auth/register")
async def register(data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.login == data.login).first()
    if existing_user:
        raise HTTPException(400, "Пользователь с таким логином уже зарегистрирован")

    code = generate_code()
    user = User(
        login=data.login,
        password_hash=hash_password(data.password),
        gender=data.gender,
        compatibility_code=code,
        role="user"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"user_id": user.id, "login": user.login, "gender": user.gender, "role": user.role, "compatibility_code": code}

@app.post("/api/auth/login")
async def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.login == data.login).first()
    if not user:
        raise HTTPException(404, "Пользователь не найден. Зарегистрируйтесь сначала.")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Неверный пароль")

    return {
        "user": {
            "id": user.id,
            "login": user.login,
            "gender": user.gender,
            "role": user.role
        },
        "compatibility_code": user.compatibility_code
    }

@app.get("/api/admin/consultations")
async def get_consultations(user_id: int, db: Session = Depends(get_db)):
    check_admin(user_id, db)
    consultations = db.query(Consultation).order_by(Consultation.created_at.desc()).all()
    return [
        {"id": c.id, "user_id": c.user_id, "name": c.name, "phone": c.phone, "email": c.email, "request": c.request_text, "status": c.status, "created": c.created_at.isoformat()}
        for c in consultations
    ]

@app.post("/api/admin/consultations/update-status")
async def update_consultation_status(
    consultation_id: int,
    status: str,
    user_id: int,
    db: Session = Depends(get_db)
):
    check_admin(user_id, db)
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Консультацію не знайдено")
    
    consultation.status = status
    db.commit()
    
    return {"message": "Статус оновлено", "consultation_id": consultation_id, "new_status": status}

@app.get("/api/admin/questions")
async def admin_get_questions(user_id: int, db: Session = Depends(get_db)):
    check_admin(user_id, db)
    questions = db.query(Question).all()
    return [
        {"id": q.id, "gender_type": q.gender_type, "text": q.text, "archetype_code": q.archetype_code, "order_index": q.order_index, "is_active": q.is_active}
        for q in questions
    ]

@app.get("/api/admin/archetypes")
async def admin_get_archetypes(user_id: int, db: Session = Depends(get_db)):
    check_admin(user_id, db)
    archetypes = db.query(ArchetypeDescription).all()
    return [
        {"id": a.id, "code": a.code, "name": a.name, "color": a.color, "chakra": a.chakra, "description": a.description, "strengths": a.strengths, "weaknesses": a.weaknesses}
        for a in archetypes
    ]

@app.get("/api/users/{user_id}/role")
async def get_user_role(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    return {"user_id": user.id, "login": user.login, "role": user.role}

@app.get("/api/admin/dashboard")
async def get_admin_dashboard(user_id: int, db: Session = Depends(get_db)):
    check_admin(user_id, db)

    total_users = db.query(User).count()
    total_consultations = db.query(Consultation).count()
    new_consultations = db.query(Consultation).filter(Consultation.status == "new").count()
    total_tests = db.query(Test).filter(Test.is_active == True).count()
    total_results = db.query(TestResult).count()

    recent_consultations = db.query(Consultation).order_by(Consultation.created_at.desc()).limit(10).all()

    recent_users = db.query(User).order_by(User.created_at.desc()).limit(10).all()
    
    return {
        "stats": {
            "total_users": total_users,
            "total_consultations": total_consultations,
            "new_consultations": new_consultations,
            "total_tests": total_tests,
            "total_results": total_results
        },
        "recent_consultations": [
            {
                "id": c.id,
                "user_id": c.user_id,
                "name": c.name,
                "status": c.status,
                "created_at": str(c.created_at)
            }
            for c in recent_consultations
        ],
        "recent_users": [
            {
                "id": u.id,
                "login": u.login,
                "role": u.role,
                "created_at": str(u.created_at)
            }
            for u in recent_users
        ]
    }

@app.get("/api/admin/users")
async def get_all_users(user_id: int, db: Session = Depends(get_db)):
    check_admin(user_id, db)
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "login": u.login,
            "email": u.email,
            "phone": u.phone,
            "gender": u.gender,
            "role": u.role,
            "created_at": str(u.created_at),
            "is_active": u.is_active
        }
        for u in users
    ]

@app.post("/api/admin/users/update-role")
async def update_user_role(
    user_id_target: int,
    role: str,
    user_id: int,
    db: Session = Depends(get_db)
):
    check_admin(user_id, db)

    if role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Роль має бути 'admin' або 'user'")
    
    user = db.query(User).filter(User.id == user_id_target).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    user.role = role
    db.commit()
    
    return {"message": f"Роль оновлено на '{role}'", "user_id": user_id_target}

@app.delete("/api/admin/users/{user_id_target}")
async def delete_user(user_id_target: int, user_id: int, db: Session = Depends(get_db)):
    check_admin(user_id, db)
    
    user = db.query(User).filter(User.id == user_id_target).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    db.delete(user)
    db.commit()
    
    return {"message": "Користувача видалено", "user_id": user_id_target}

@app.post("/api/tests")
async def create_test(test: TestCreate, user_id: int, db: Session = Depends(get_db)):
    check_admin(user_id, db)
    new_test = Test(
        title=test.title,
        description=test.description,
        category=test.category
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    
    return {"message": "Тест створено", "test_id": new_test.id, "title": new_test.title}

@app.put("/api/tests/{test_id}")
async def update_test(
    test_id: int,
    test: TestCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    check_admin(user_id, db)
    test_db = db.query(Test).filter(Test.id == test_id).first()
    if not test_db:
        raise HTTPException(status_code=404, detail="Тест не знайдено")
    
    test_db.title = test.title
    test_db.description = test.description
    test_db.category = test.category
    db.commit()
    
    return {"message": "Тест оновлено", "test_id": test_id}

@app.delete("/api/tests/{test_id}")
async def delete_test(test_id: int, user_id: int, db: Session = Depends(get_db)):
    check_admin(user_id, db)
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Тест не знайдено")
    
    db.delete(test)
    db.commit()
    
    return {"message": "Тест видалено", "test_id": test_id}

@app.get("/api/tests")
async def get_all_tests(db: Session = Depends(get_db)):
    tests = db.query(Test).filter(Test.is_active == True).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "category": t.category,
            "created_at": str(t.created_at)
        }
        for t in tests
    ]

@app.get("/api/tests/{test_id}")
async def get_test(test_id: int, db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Тест не знайдено")
    
    return {
        "id": test.id,
        "title": test.title,
        "description": test.description,
        "category": test.category,
        "is_active": test.is_active
    }

@app.post("/api/tests/questions")
async def create_question(question: TestQuestionCreate, user_id: int, db: Session = Depends(get_db)):
    check_admin(user_id, db)
    new_question = TestQuestion(
        test_id=question.test_id,
        text=question.text,
        order_index=question.order_index
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    
    return {"message": "Питання додано", "question_id": new_question.id}

@app.delete("/api/tests/questions/{question_id}")
async def delete_question(question_id: int, user_id: int, db: Session = Depends(get_db)):
    check_admin(user_id, db)
    question = db.query(TestQuestion).filter(TestQuestion.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Питання не знайдено")
    
    db.delete(question)
    db.commit()
    
    return {"message": "Питання видалено", "question_id": question_id}

@app.post("/api/tests/answers")
async def create_answer_option(answer: AnswerOptionCreate, user_id: int, db: Session = Depends(get_db)):
    check_admin(user_id, db)
    new_answer = AnswerOption(
        question_id=answer.question_id,
        text=answer.text,
        score=answer.score,
        order_index=answer.order_index
    )
    db.add(new_answer)
    db.commit()
    db.refresh(new_answer)
    
    return {"message": "Варіант відповіді додано", "answer_id": new_answer.id}

@app.put("/api/tests/answers/{answer_id}")
async def update_answer_option(
    answer_id: int,
    answer: AnswerOptionCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    check_admin(user_id, db)
    answer_db = db.query(AnswerOption).filter(AnswerOption.id == answer_id).first()
    if not answer_db:
        raise HTTPException(status_code=404, detail="Варіант відповіді не знайдено")
    
    answer_db.text = answer.text
    answer_db.score = answer.score
    answer_db.order_index = answer.order_index
    db.commit()
    
    return {"message": "Варіант відповіді оновлено", "answer_id": answer_id}

@app.delete("/api/tests/answers/{answer_id}")
async def delete_answer_option(answer_id: int, user_id: int, db: Session = Depends(get_db)):
    check_admin(user_id, db)
    answer = db.query(AnswerOption).filter(AnswerOption.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Варіант відповіді не знайдено")
    
    db.delete(answer)
    db.commit()
    
    return {"message": "Варіант відповіді видалено", "answer_id": answer_id}

@app.get("/api/tests/{test_id}/questions")
async def get_test_questions(test_id: int, db: Session = Depends(get_db)):
    questions = db.query(TestQuestion).filter(
        TestQuestion.test_id == test_id,
        TestQuestion.is_active == True
    ).order_by(TestQuestion.order_index).all()
    
    return [
        {
            "id": q.id,
            "text": q.text,
            "order_index": q.order_index
        }
        for q in questions
    ]

@app.post("/api/tests/answers")
async def create_answer_option(answer: AnswerOptionCreate, db: Session = Depends(get_db)):
    new_answer = AnswerOption(
        question_id=answer.question_id,
        text=answer.text,
        score=answer.score,
        order_index=answer.order_index
    )
    db.add(new_answer)
    db.commit()
    db.refresh(new_answer)
    
    return {"message": "Варіант відповіді додано", "answer_id": new_answer.id}

@app.get("/api/questions/{question_id}/answers")
async def get_answer_options(question_id: int, db: Session = Depends(get_db)):
    answers = db.query(AnswerOption).filter(
        AnswerOption.question_id == question_id,
        AnswerOption.is_active == True
    ).order_by(AnswerOption.order_index).all()
    
    return [
        {
            "id": a.id,
            "text": a.text,
            "score": a.score,
            "order_index": a.order_index
        }
        for a in answers
    ]

@app.post("/api/test-results")
async def save_test_result(result: TestResultCreate, db: Session = Depends(get_db)):
    import json
    new_result = TestResult(
        user_id=result.user_id,
        test_id=result.test_id,
        total_score=result.total_score,
        scores_breakdown=json.dumps(result.scores_breakdown) if result.scores_breakdown else None,
        result_text=result.result_text
    )
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    
    return {"message": "Результат збережено", "result_id": new_result.id}

@app.get("/api/users/{user_id}/results")
async def get_user_results(user_id: int, db: Session = Depends(get_db)):
    results = db.query(TestResult).filter(TestResult.user_id == user_id).all()
    return [
        {
            "id": r.id,
            "test_id": r.test_id,
            "total_score": r.total_score,
            "result_text": r.result_text,
            "completed_at": str(r.completed_at)
        }
        for r in results
    ]

@app.get("/api/tests/{test_id}/results")
async def get_test_results(test_id: int, db: Session = Depends(get_db)):
    results = db.query(TestResult).filter(TestResult.test_id == test_id).all()
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "total_score": r.total_score,
            "result_text": r.result_text,
            "completed_at": str(r.completed_at)
        }
        for r in results
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
