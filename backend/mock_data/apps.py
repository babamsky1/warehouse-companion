from django.apps import AppConfig


class MockDataConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mock_data'

    def ready(self):
        # Initialize mock data when app is ready
        # This ensures data is available for the lifetime of the server
        from . import data_generator
        data_generator.initialize_mock_data()
