import datetime
import uuid
from tkinter.font import names

from click import DateTime


class Post:
    def __init__(self, id: uuid, social_media: Social):
        self.id = uuid()
        self.name = name
        self.social_media = social_media
        self.created_at = datetime.datetime.now()
        self.created_by = user.id