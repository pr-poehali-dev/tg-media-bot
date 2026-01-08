import json
import os
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для получения статистики бота в админ-панели'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        params = event.get('queryStringParameters', {}) or {}
        period = params.get('period', 'week')
        
        if period == 'day':
            date_from = datetime.now() - timedelta(days=1)
        elif period == 'month':
            date_from = datetime.now() - timedelta(days=30)
        else:
            date_from = datetime.now() - timedelta(days=7)
        
        cur.execute(
            '''SELECT COUNT(*) as total_requests FROM requests WHERE created_at >= %s''',
            (date_from,)
        )
        total_requests = cur.fetchone()['total_requests']
        
        cur.execute(
            '''SELECT COUNT(DISTINCT user_id) as active_users FROM requests WHERE created_at >= %s''',
            (date_from,)
        )
        active_users = cur.fetchone()['active_users']
        
        cur.execute(
            '''SELECT COUNT(*) as total_downloads FROM requests 
               WHERE created_at >= %s AND request_type IN ('video', 'photo') AND status = 'success' ''',
            (date_from,)
        )
        total_downloads = cur.fetchone()['total_downloads']
        
        cur.execute(
            '''SELECT COUNT(*) as blocked_users FROM users WHERE is_blocked = TRUE'''
        )
        blocked_users = cur.fetchone()['blocked_users']
        
        cur.execute(
            '''SELECT 
                 DATE(created_at) as date,
                 COUNT(*) as requests,
                 COUNT(DISTINCT user_id) as users,
                 SUM(CASE WHEN request_type = 'video' THEN 1 ELSE 0 END) as videos,
                 SUM(CASE WHEN request_type = 'photo' THEN 1 ELSE 0 END) as photos
               FROM requests 
               WHERE created_at >= %s 
               GROUP BY DATE(created_at) 
               ORDER BY date''',
            (date_from,)
        )
        activity_data = cur.fetchall()
        
        cur.execute(
            '''SELECT 
                 request_type as name,
                 COUNT(*) as value
               FROM requests 
               WHERE created_at >= %s 
               GROUP BY request_type''',
            (date_from,)
        )
        content_type_data = cur.fetchall()
        
        cur.execute(
            '''SELECT 
                 u.id, u.telegram_id, u.username, u.total_requests as requests,
                 CASE WHEN u.is_blocked THEN 'blocked' ELSE 'active' END as status,
                 u.is_premium as premium,
                 u.last_active
               FROM users u
               ORDER BY u.last_active DESC
               LIMIT 50'''
        )
        users_data = cur.fetchall()
        
        cur.execute(
            '''SELECT 
                 r.created_at as time,
                 u.username as user,
                 r.request_type as action,
                 r.status,
                 r.details
               FROM requests r
               LEFT JOIN users u ON r.user_id = u.id
               ORDER BY r.created_at DESC
               LIMIT 50'''
        )
        logs_data = cur.fetchall()
        
        cur.execute(
            '''SELECT 
                 ma.id, ma.alert_type, ma.description, ma.is_resolved,
                 u.username
               FROM moderation_alerts ma
               LEFT JOIN users u ON ma.user_id = u.id
               WHERE ma.is_resolved = FALSE
               ORDER BY ma.created_at DESC
               LIMIT 20'''
        )
        moderation_data = cur.fetchall()
        
        conn.close()
        
        response_data = {
            'summary': {
                'total_requests': total_requests,
                'active_users': active_users,
                'total_downloads': total_downloads,
                'blocked_users': blocked_users
            },
            'activity': [dict(row) for row in activity_data],
            'content_types': [dict(row) for row in content_type_data],
            'users': [dict(row) for row in users_data],
            'logs': [dict(row) for row in logs_data],
            'moderation': [dict(row) for row in moderation_data]
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response_data, default=str)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }


def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])
