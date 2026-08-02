import unittest

from fastapi.testclient import TestClient

from chatbot.app import app, retrieve


class RetrievalTests(unittest.TestCase):
    def assert_top(self, question: str, expected_id: str) -> None:
        matches = retrieve(question)
        self.assertTrue(matches, question)
        self.assertEqual(matches[0][0].id, expected_id, question)

    def test_english_intents(self) -> None:
        cases = {
            "How much does a chatbot cost?": "pricing",
            "How long does a project take?": "timeline",
            "Can it connect to my CRM?": "integrations",
            "Do you make websites?": "websites",
            "What do you do?": "services-chatbots",
            "Can it answer in French?": "languages",
            "What happens when it gives a wrong answer?": "accuracy",
            "Is my personal data secure?": "privacy-security",
        }
        for question, expected in cases.items():
            with self.subTest(question=question):
                self.assert_top(question, expected)

    def test_french_intents(self) -> None:
        cases = {
            "Combien coûte un chatbot ?": "pricing",
            "Quel est le délai du projet ?": "timeline",
            "Est-ce sécurisé ?": "privacy-security",
            "Pouvez-vous créer un site internet ?": "websites",
            "Le chatbot peut-il parler français ?": "languages",
            "Comment évitez-vous les réponses fausses ?": "accuracy",
        }
        for question, expected in cases.items():
            with self.subTest(question=question):
                self.assert_top(question, expected)

    def test_out_of_scope_questions_are_rejected(self) -> None:
        for question in (
            "Who is the president of Cameroon?",
            "What is the weather tomorrow?",
            "Write me a chocolate cake recipe.",
        ):
            with self.subTest(question=question):
                self.assertEqual(retrieve(question), [])

    def test_api_returns_french_grounded_answer(self) -> None:
        client = TestClient(app)
        response = client.post(
            "/chat",
            json={"question": "Combien coûte un chatbot ?", "history": []},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["sources"][0]["title"], "Flexible project pricing")
        self.assertIn("prix", data["answer"].lower())

    def test_api_refuses_out_of_scope_question(self) -> None:
        client = TestClient(app)
        response = client.post(
            "/chat",
            json={"question": "Who is the president of Cameroon?", "history": []},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["confidence"], "low")
        self.assertEqual(data["sources"], [])


if __name__ == "__main__":
    unittest.main()
