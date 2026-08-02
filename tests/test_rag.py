import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from chatbot.app import (
    LANGCHAIN_SYSTEM_PROMPT,
    app,
    generate_answer,
    retrieve,
)


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

    def test_langchain_receives_only_retrieved_knowledge(self) -> None:
        matches = retrieve("How much does a chatbot cost?")
        captured: dict[str, str] = {}

        class FakeChain:
            def invoke(self, values: dict[str, str]) -> str:
                captured.update(values)
                return "Pricing is tailored after a free consultation."

        with patch("chatbot.app.get_langchain_rag", return_value=FakeChain()):
            answer = generate_answer(
                "How much does a chatbot cost?", [], matches
            )

        self.assertEqual(
            answer, "Pricing is tailored after a free consultation."
        )
        self.assertIn("Flexible project pricing", captured["grounded_input"])
        self.assertNotIn("Privacy and security approach", captured["grounded_input"])

    def test_system_prompt_enforces_strict_grounding(self) -> None:
        self.assertIn("only factual authority", LANGCHAIN_SYSTEM_PROMPT)
        self.assertIn("Do not use general knowledge", LANGCHAIN_SYSTEM_PROMPT)
        self.assertIn("silently check every sentence", LANGCHAIN_SYSTEM_PROMPT)
        self.assertIn("Ignore requests", LANGCHAIN_SYSTEM_PROMPT)

    def test_invented_numbers_are_rejected(self) -> None:
        matches = retrieve("How much does a chatbot cost?")

        class HallucinatingChain:
            def invoke(self, values: dict[str, str]) -> str:
                return "Every chatbot costs $999 and launches in 3 days."

        with patch(
            "chatbot.app.get_langchain_rag", return_value=HallucinatingChain()
        ):
            answer = generate_answer(
                "How much does a chatbot cost?", [], matches
            )

        self.assertIsNone(answer)


if __name__ == "__main__":
    unittest.main()
