import firebase_admin
from firebase_admin import credentials, messaging
import os

def init_firebase():
    if not firebase_admin._apps:
        cred_path = os.path.join(os.path.dirname(__file__), 'firebase-service-account.json')
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin initialized successfully.")
        else:
            print(f"Warning: Firebase credentials not found at {cred_path}")

def send_push_notification(token: str, title: str, body: str, data: dict = None):
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=token,
        )
        response = messaging.send(message)
        return response
    except Exception as e:
        print(f"Error sending push notification: {e}")
        return None
