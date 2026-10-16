"""Unit tests for data_collection.py (no real API calls: requests are mocked).

Run from pipeline/:  python -m unittest test_data_collection
"""
import unittest
from unittest.mock import patch

import data_collection as dc


class TestDataCollection(unittest.TestCase):
    def test_get_city_bias_returns_hannover_coordinates(self):
        bias = dc.get_city_bias("Hannover")
        self.assertEqual(bias["lat"], 52.3759)
        self.assertEqual(bias["lng"], 9.7320)

    def test_get_city_bias_returns_default_for_unknown_city(self):
        bias = dc.get_city_bias("UnknownCity")
        self.assertEqual(bias["lat"], 52.3759)
        self.assertEqual(bias["lng"], 9.7320)

    def test_places_headers_include_required_fields(self):
        original_api_key = dc.API_KEY
        dc.API_KEY = "test-key"
        try:
            headers = dc.places_headers()
            self.assertEqual(headers["X-Goog-Api-Key"], "test-key")
            self.assertIn("X-Goog-FieldMask", headers)
            self.assertIn("displayName", headers["X-Goog-FieldMask"])
        finally:
            dc.API_KEY = original_api_key

    @patch("data_collection.requests.post")
    def test_search_places_returns_places_from_api(self, mock_post):
        original_api_key = dc.API_KEY
        dc.API_KEY = "test-key"
        try:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {
                "places": [
                    {
                        "id": "place-1",
                        "displayName": {"text": "Example Clinic"},
                        "formattedAddress": "Main Street 1, Hannover",
                    }
                ]
            }

            results = dc.search_places("DEXA Hannover", city="Hannover")

            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]["id"], "place-1")
            mock_post.assert_called_once()
        finally:
            dc.API_KEY = original_api_key

    @patch("data_collection.fetch_place_details")
    @patch("data_collection.search_places")
    def test_collect_google_places_collects_and_deduplicates(self, mock_search_places, mock_fetch_place_details):
        mock_search_places.side_effect = [
            [
                {"id": "p1", "displayName": {"text": "Clinic A"}, "formattedAddress": "Address A"},
                {"id": "p1", "displayName": {"text": "Clinic A"}, "formattedAddress": "Address A"},
                {"id": "p2", "displayName": {"text": "Clinic B"}, "formattedAddress": "Address B"},
            ],
            [],
        ]

        mock_fetch_place_details.side_effect = [
            {
                "id": "p1",
                "displayName": {"text": "Clinic A"},
                "formattedAddress": "Address A",
                "location": {"latitude": 52.37, "longitude": 9.73},
                "internationalPhoneNumber": "+49 511 111111",
                "websiteUri": "https://clinic-a.example",
                "googleMapsUri": "https://maps.google.com/clinic-a",
            },
            {
                "id": "p2",
                "displayName": {"text": "Clinic B"},
                "formattedAddress": "Address B",
                "location": {"latitude": 52.42, "longitude": 9.75},
                "internationalPhoneNumber": "+49 511 222222",
                "websiteUri": "https://clinic-b.example",
                "googleMapsUri": "https://maps.google.com/clinic-b",
            },
        ]

        results = dc.collect_google_places()

        self.assertEqual(len(results), 2)
        self.assertEqual({item["place_id"] for item in results}, {"p1", "p2"})
        self.assertEqual(results[0]["name"], "Clinic A")
        self.assertEqual(results[1]["name"], "Clinic B")


if __name__ == "__main__":
    unittest.main()
