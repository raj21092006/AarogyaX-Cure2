import unittest
import json
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app

class AarogyaXCureTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_home(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get("status"), "success")

    def test_health(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get("status"), "success")

    def test_login(self):
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps({
                'email': 'patient@aarogyax.com',
                'password': 'demo12345'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue('token' in data or data.get("status") == "success")

    def test_hospitals(self):
        response = self.client.get('/api/hospitals/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get("status"), "success")
        self.assertGreater(data.get("count", 0), 0)

    def test_blood_donors(self):
        response = self.client.get('/api/blood/donors')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get("status"), "success")
        self.assertGreater(data.get("count", 0), 0)

    def test_labs(self):
        response = self.client.get('/api/labs/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get("status"), "success")
        self.assertGreater(data.get("count", 0), 0)

if __name__ == '__main__':
    unittest.main()
