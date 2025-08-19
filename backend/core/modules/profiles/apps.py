from django.apps import AppConfig

class ProfilesConfig(AppConfig):
    name = 'core.modules.profiles'
    verbose_name = 'User Profiles'
    
    def ready(self):
        import core.modules.profiles.signals
