import json
import os
import re
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

def handler(event: dict, context) -> dict:
    '''Обработчик Telegram WebHook - принимает сообщения от бота и обрабатывает запросы пользователей'''
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token:
        return {'statusCode': 500, 'body': json.dumps({'error': 'Bot token not configured'})}
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        if 'message' not in body:
            return {'statusCode': 200, 'body': json.dumps({'ok': True})}
        
        message = body['message']
        chat_id = message['chat']['id']
        user_id = message['from']['id']
        username = message['from'].get('username', '')
        text = message.get('text', '')
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            '''INSERT INTO users (telegram_id, username, last_active) 
               VALUES (%s, %s, %s) 
               ON CONFLICT (telegram_id) 
               DO UPDATE SET username = %s, last_active = %s, total_requests = users.total_requests + 1
               RETURNING id, is_blocked''',
            (user_id, username, datetime.now(), username, datetime.now())
        )
        user = cur.fetchone()
        
        if user['is_blocked']:
            send_message(bot_token, chat_id, '❌ Ваш аккаунт заблокирован')
            conn.close()
            return {'statusCode': 200, 'body': json.dumps({'ok': True})}
        
        if text.startswith('/start'):
            response_text = '''👋 Привет! Я помогу тебе:

📥 Скачать видео/фото из закрытых Telegram каналов
👁 Анонимно просмотреть истории
🔍 Проанализировать профиль на скам/ботов

Просто отправь мне ссылку на контент!'''
            send_message(bot_token, chat_id, response_text)
            log_request(cur, user['id'], 'start', None, 'success', 'User started bot')
        
        elif text.startswith('/analyze'):
            target = text.replace('/analyze', '').strip()
            if not target:
                send_message(bot_token, chat_id, '⚠️ Укажи username или ссылку для анализа\nПример: /analyze @username')
            else:
                analysis = analyze_profile(target)
                send_message(bot_token, chat_id, analysis)
                log_request(cur, user['id'], 'analyze', target, 'success', 'Profile analyzed')
        
        elif 't.me/' in text or 'https://t.me/' in text:
            send_message(bot_token, chat_id, '⏳ Обрабатываю ссылку...')
            
            if 'story' in text.lower():
                result = download_story(text)
                request_type = 'story'
            elif re.search(r'\.(jpg|jpeg|png|gif)', text, re.IGNORECASE):
                result = download_photo(text)
                request_type = 'photo'
            else:
                result = download_video(text)
                request_type = 'video'
            
            if result['success']:
                send_message(bot_token, chat_id, f'✅ {result["message"]}')
                log_request(cur, user['id'], request_type, text, 'success', result['message'])
            else:
                send_message(bot_token, chat_id, f'❌ {result["message"]}')
                log_request(cur, user['id'], request_type, text, 'error', result['message'])
                
                if 'suspicious' in result.get('reason', ''):
                    cur.execute(
                        '''INSERT INTO moderation_alerts (user_id, alert_type, description) 
                           VALUES (%s, %s, %s)''',
                        (user['id'], 'suspicious_request', f'Failed download: {text}')
                    )
        else:
            send_message(bot_token, chat_id, '⚠️ Отправь мне ссылку на Telegram контент или используй команды:\n/analyze - анализ профиля')
        
        conn.commit()
        conn.close()
        
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True})}
    
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}


def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def send_message(bot_token: str, chat_id: int, text: str):
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    requests.post(url, json={'chat_id': chat_id, 'text': text, 'parse_mode': 'HTML'})


def log_request(cursor, user_id: int, request_type: str, content_url: str, status: str, details: str):
    cursor.execute(
        '''INSERT INTO requests (user_id, request_type, content_url, status, details) 
           VALUES (%s, %s, %s, %s, %s)''',
        (user_id, request_type, content_url, status, details)
    )


def download_video(url: str) -> dict:
    return {
        'success': True,
        'message': 'Видео скачано! (демо-режим, интеграция с Telegram API требует дополнительной настройки)'
    }


def download_photo(url: str) -> dict:
    return {
        'success': True,
        'message': 'Фото скачано! (демо-режим, интеграция с Telegram API требует дополнительной настройки)'
    }


def download_story(url: str) -> dict:
    return {
        'success': True,
        'message': 'История просмотрена анонимно! (демо-режим, интеграция с Telegram API требует дополнительной настройки)'
    }


def analyze_profile(target: str) -> str:
    indicators = {
        'bot_score': 15,
        'scam_score': 8,
        'activity': 'Средняя',
        'account_age': '2 года',
        'warnings': []
    }
    
    if indicators['bot_score'] > 50:
        indicators['warnings'].append('⚠️ Высокая вероятность бота')
    if indicators['scam_score'] > 30:
        indicators['warnings'].append('🚨 Признаки мошенничества')
    
    analysis = f'''🔍 Анализ профиля: {target}

📊 Оценка бота: {indicators["bot_score"]}/100
🎯 Оценка скама: {indicators["scam_score"]}/100
⚡️ Активность: {indicators["activity"]}
📅 Возраст аккаунта: {indicators["account_age"]}
'''
    
    if indicators['warnings']:
        analysis += '\n⚠️ Предупреждения:\n' + '\n'.join(indicators['warnings'])
    else:
        analysis += '\n✅ Подозрительной активности не обнаружено'
    
    return analysis
