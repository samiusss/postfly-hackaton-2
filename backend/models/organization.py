import uuid


class Organization:

    def __init__(self, id: uuid.UUID, name: str, active_socials: List[Social]):
        self.id = uuid.uuid4()
        self.name: name
        self.active_socials = []
