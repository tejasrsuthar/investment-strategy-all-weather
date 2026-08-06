from app.domain.entities import PlatformSettings
from app.infrastructure.repositories import PlatformSettingsRepository

def test_platform_settings():
    repo = PlatformSettingsRepository()
    settings = repo.get()
    assert settings.default_page_size >= 1
    assert settings.min_password_length >= 7

    settings.default_page_size = 25
    updated = repo.update(settings)
    assert updated.default_page_size == 25
