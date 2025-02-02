import uuid
from typing import List


class User:

    def __init__(self, id: uuid.UUID, name: str, active_socials: List[Social], organizations: List[Organization]):
        self.id = uuid.uuid4()
        self.name = name
        self.active_socials = active_socials or []  # Assign the provided list
        self.organizations = organizations or []  # Assign the provided list