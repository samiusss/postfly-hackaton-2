from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    pass

class Organization(models.Model):
    name = models.CharField(max_length=255)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_organizations')
    members = models.ManyToManyField(User, related_name='organizations')
    created_at = models.DateTimeField(auto_now_add=True)

class SocialMediaType(models.TextChoices):
    FACEBOOK = 'FB', 'Facebook'
    INSTAGRAM = 'IG', 'Instagram'
    TWITTER = 'TW', 'X.com'
    THREADS = 'TH', 'Threads'
    LINKEDIN = 'LI', 'LinkedIn'
    TIKTOK = 'TT', 'TikTok'

class SocialMedia(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='social_media_accounts')
    type = models.CharField(max_length=2, choices=SocialMediaType.choices)
    account_name = models.CharField(max_length=255)
    access_token = models.CharField(max_length=512)
    created_at = models.DateTimeField(auto_now_add=True)

class Post(models.Model):
    social_media = models.ForeignKey(SocialMedia, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    scheduled_for = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
