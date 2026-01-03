"""
Mock Data API Tests

Performance and functionality tests for mock data endpoints.
Run with: python manage.py test mock_data

Future: Expand with integration tests when database is configured
"""

import json
from django.test import TestCase, Client
from django.urls import reverse
from . import data_generator

class MockDataAPITestCase(TestCase):
    """Test cases for mock data API endpoints."""

    def setUp(self):
        """Set up test client and ensure mock data is initialized."""
        self.client = Client()
        # Ensure mock data is initialized
        data_generator.initialize_mock_data()

    def test_users_endpoint(self):
        """Test users API endpoint returns valid data."""
        response = self.client.get(reverse('mock_users'))
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('data', data)
        self.assertIsInstance(data['data']['data'], list)
        self.assertGreater(len(data['data']['data']), 0)

    def test_products_endpoint(self):
        """Test products API endpoint returns valid data."""
        response = self.client.get(reverse('mock_products'))
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('data', data)
        self.assertIsInstance(data['data']['data'], list)

    def test_dashboard_endpoint(self):
        """Test dashboard API endpoint returns valid data."""
        response = self.client.get(reverse('mock_dashboard'))
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('data', data)
        self.assertIn('summary', data['data'])

    def test_settings_endpoint(self):
        """Test settings API endpoint returns valid data."""
        response = self.client.get(reverse('mock_settings'))
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('data', data)

    def test_pagination(self):
        """Test pagination parameters work correctly."""
        response = self.client.get(reverse('mock_users'), {'limit': 10, 'offset': 5})
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data['data']['data']), 10)
        self.assertEqual(data['data']['limit'], 10)
        self.assertEqual(data['data']['offset'], 5)

    def test_search_functionality(self):
        """Test search functionality works."""
        # Get first user for search test
        first_user = data_generator.MOCK_USERS[0]
        search_term = first_user['name'].split()[1]  # Get user number

        response = self.client.get(reverse('mock_users'), {'search': search_term})
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertTrue(len(data['data']['data']) > 0)

    def test_health_check(self):
        """Test health check endpoint."""
        response = self.client.get(reverse('mock_health'))
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['status'], 'healthy')

    def test_performance_limits(self):
        """Test that performance limits are enforced."""
        # Test max limit
        response = self.client.get(reverse('mock_users'), {'limit': 2000})
        data = response.json()
        self.assertEqual(data['data']['limit'], 1000)  # Should be capped at 1000

    def test_cache_invalidation(self):
        """Test cache invalidation endpoint."""
        response = self.client.post(reverse('mock_cache_invalidate'))
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertTrue(data['success'])
