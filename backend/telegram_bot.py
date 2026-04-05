import asyncio
import aiohttp
from datetime import datetime

class TelegramNotifier:
    def __init__(self, bot_token: str, chat_id: str):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.base_url = f"https://api.telegram.org/bot{bot_token}"
    
    async def send_notification(self, consultation: dict):
        """Отправляет уведомление о новой заявке"""
        message = self._format_message(consultation)
        
        url = f"{self.base_url}/sendMessage"
        payload = {
            "chat_id": self.chat_id,
            "text": message,
            "parse_mode": "HTML"
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        print("✅ Уведомление отправлено в Telegram")
                    else:
                        print(f"❌ Ошибка отправки: {response.status}")
            except Exception as e:
                print(f"❌ Ошибка подключения к Telegram: {e}")
    
    def _format_message(self, consultation: dict) -> str:
        """Форматирует сообщение"""
        created_at = consultation.get('created_at', datetime.now().isoformat())
        try:
            dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            formatted_date = dt.strftime('%d.%m.%Y %H:%M')
        except:
            formatted_date = created_at
        
        message = f"""
📝 <b>НОВАЯ ЗАЯВКА НА КОНСУЛЬТАЦИЮ</b>

👤 <b>Имя:</b> {consultation.get('name', 'Не указано')}
📞 <b>Телефон:</b> {consultation.get('phone', 'Не указано')}
✉️ <b>Email:</b> {consultation.get('email', 'Не указано')}

💬 <b>Запрос:</b>
{consultation.get('request_text', 'Не указано')}

🕐 <b>Дата:</b> {formatted_date}
🆔 <b>ID заявки:</b> {consultation.get('id', 'N/A')}
"""
        return message.strip()

# Глобальный экземпляр
notifier = None

def init_telegram(bot_token: str, chat_id: str):
    """Инициализирует Telegram бота"""
    global notifier
    if bot_token and chat_id:
        notifier = TelegramNotifier(bot_token, chat_id)
        print("✅ Telegram бот инициализирован")
    else:
        print("⚠️ Telegram бот не настроен (отсутствует токен или chat_id)")

async def notify_consultation_created(consultation_data: dict):
    """Уведомляет о новой заявке"""
    if notifier:
        await notifier.send_notification(consultation_data)
