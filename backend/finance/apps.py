from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.contrib.auth import get_user_model
import os


def create_default_user(sender, **kwargs):
    User = get_user_model()
    email = os.getenv('DEFAULT_USER_EMAIL')
    password = os.getenv('DEFAULT_USER_PASSWORD')
    if email and password:
        if not User.objects.filter(username=email).exists():
            User.objects.create_user(username=email, email=email, password=password)


class FinanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'finance'

    def ready(self):
        post_migrate.connect(create_default_user, sender=self)
