from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    TAROT_READER = "tarot_reader"
    SPIRITUAL_CONSULTANT = "spiritual_consultant"
    ADMINISTRATOR = "administrator"