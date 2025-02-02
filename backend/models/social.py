import enum
from enum import EnumType


class SocialMediaType(EnumType):
    FACEBOOK=1
    INSTAGRAM=2
    THREADS=3
    XDOTCOM=4

class Social:

    def __init__(self, name: str, synchronized: bool, selected: bool, socials_type: SocialMediaType):
        self.name = name
        self.synchronized = synchronized
        self.selected = selected
        self.socials_type = socials_type

    def set_selected(self):
        self.selected = True

    def __repr__(self):
        return (f"Social(name='{self.name}', synchronized={self.synchronized}, "
                f"selected={self.selected}, socials_type={self.socials_type})")

