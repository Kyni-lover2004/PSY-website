from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import random
import string

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///psycho.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'


# === МОДЕЛИ БАЗЫ ДАННЫХ ===
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(256))
    compatibility_code = db.Column(db.String(20), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    test_results = db.relationship('TestResult', backref='user', lazy=True)
    appointments = db.relationship('Appointment', backref='user', lazy=True)


class TestResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    test_type = db.Column(db.String(50), nullable=False)
    result_data = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120))
    request_text = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='new')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# === МАРШРУТЫ ===
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/tests')
def tests():
    return render_template('tests.html')


@app.route('/test/archetypes')
def archetype_test():
    return render_template('archetype_test.html')


@app.route('/appointment', methods=['GET', 'POST'])
def appointment():
    if request.method == 'POST':
        name = request.form.get('name')
        phone = request.form.get('phone')
        email = request.form.get('email')
        request_text = request.form.get('request_text')
        
        if not name or not phone or not request_text:
            flash('Пожалуйста, заполните все обязательные поля', 'error')
            return redirect(url_for('appointment'))
        
        appointment = Appointment(
            name=name,
            phone=phone,
            email=email,
            request_text=request_text
        )
        db.session.add(appointment)
        db.session.commit()
        
        flash('Ваша заявка успешно отправлена! Психолог свяжется с вами в ближайшее время.', 'success')
        return redirect(url_for('appointment'))
    
    return render_template('appointment.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        phone = request.form.get('phone')
        password = request.form.get('password')
        password_confirm = request.form.get('password_confirm')
        
        if not all([first_name, last_name, phone, password]):
            flash('Пожалуйста, заполните все поля', 'error')
            return redirect(url_for('register'))
        
        if password != password_confirm:
            flash('Пароли не совпадают', 'error')
            return redirect(url_for('register'))
        
        if User.query.filter_by(phone=phone).first():
            flash('Пользователь с таким номером телефона уже существует', 'error')
            return redirect(url_for('register'))
        
        compatibility_code = generate_compatibility_code()
        
        user = User(
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            password_hash=generate_password_hash(password),
            compatibility_code=compatibility_code
        )
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        flash('Регистрация успешна! Ваш код совместимости сохранён в личном кабинете.', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        phone = request.form.get('phone')
        password = request.form.get('password')
        
        user = User.query.filter_by(phone=phone).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('dashboard'))
        
        flash('Неверный номер телефона или пароль', 'error')
    
    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=current_user)


@app.route('/api/check_compatibility', methods=['POST'])
def check_compatibility():
    data = request.get_json()
    code1 = data.get('code1')
    code2 = data.get('code2')
    
    user1 = User.query.filter_by(compatibility_code=code1).first()
    user2 = User.query.filter_by(compatibility_code=code2).first()
    
    if not user1 or not user2:
        return jsonify({'error': 'Один или оба кода не найдены'}), 404
    
    # Здесь будет логика проверки совместимости
    compatibility_score = random.randint(50, 100)
    
    return jsonify({
        'user1': f'{user1.first_name} {user1.last_name}',
        'user2': f'{user2.first_name} {user2.last_name}',
        'compatibility_score': compatibility_score
    })


def generate_compatibility_code():
    timestamp = datetime.now().strftime('%Y%m%d')
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f'PSY-{timestamp}-{random_part}'


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
