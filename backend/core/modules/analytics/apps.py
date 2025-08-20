from django.apps import AppConfig

class AnalyticsConfig(AppConfig):
    name = 'core.modules.analytics'
    verbose_name = 'Learning Analytics'
    
    def ready(self):
        # Import signal handlers
        import core.modules.analytics.signals
