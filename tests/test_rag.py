import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from chatbot.app import (
    GROUNDING_VERIFIER_PROMPT,
    LANGCHAIN_SYSTEM_PROMPT,
    ChatMessage,
    app,
    generate_answer,
    hybrid_retrieve,
    lexical_rank,
    reciprocal_rank_fusion,
    retrieve,
    rewrite_retrieval_query,
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
            "How do you stop it from making up answers?": "accuracy",
            "What exactly does Gemstone Labs do?": "services-chatbots",
            "Is my personal data secure?": "privacy-security",
            "Can it diagnose a medical condition?": "safety-limits",
            "Can you build it in 3 days for $100?": "pricing",
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
            "Je veux un chatbot qui pose un diagnostic médical.": "safety-limits",
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

    def test_french_questions_get_french_answers(self) -> None:
        client = TestClient(app)
        response = client.post(
            "/chat",
            json={"question": "Quels services propose Gemstone Labs ?", "history": []},
        )
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertIn("crée", data["answer"].lower())
        self.assertNotIn("builds", data["answer"].lower())

    def test_high_risk_request_has_professional_boundary(self) -> None:
        client = TestClient(app)
        response = client.post(
            "/chat",
            json={
                "question": "Je veux un chatbot médical qui pose un diagnostic.",
                "history": [],
            },
        )
        data = response.json()
        self.assertEqual(data["sources"][0]["title"], "Professional and high-risk boundaries")
        self.assertIn("pas conçus", data["answer"].lower())

    def test_french_out_of_scope_refusal_is_localized(self) -> None:
        client = TestClient(app)
        response = client.post(
            "/chat",
            json={"question": "Quelle météo fera-t-il demain ?", "history": []},
        )
        data = response.json()
        self.assertEqual(data["confidence"], "low")
        self.assertTrue(data["answer"].startswith("Je n’ai pas"))

    def test_langchain_receives_only_retrieved_knowledge(self) -> None:
        matches = retrieve("How much does a chatbot cost?")
        captured: dict[str, str] = {}

        class FakeChain:
            def invoke(self, values: dict[str, str]) -> str:
                captured.update(values)
                return "Pricing is tailored after a free consultation."

        with (
            patch("chatbot.app.get_langchain_rag", return_value=FakeChain()),
            patch("chatbot.app.get_grounding_verifier", return_value=None),
        ):
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
        self.assertIn("Return exactly PASS", GROUNDING_VERIFIER_PROMPT)

    def test_invented_numbers_are_rejected(self) -> None:
        matches = retrieve("How much does a chatbot cost?")

        class HallucinatingChain:
            def invoke(self, values: dict[str, str]) -> str:
                return "Every chatbot costs $999 and launches in 3 days."

        with (
            patch(
                "chatbot.app.get_langchain_rag",
                return_value=HallucinatingChain(),
            ),
            patch("chatbot.app.get_grounding_verifier", return_value=None),
        ):
            answer = generate_answer(
                "How much does a chatbot cost?", [], matches
            )

        self.assertIsNone(answer)

    def test_independent_verifier_rejects_unsupported_answer(self) -> None:
        matches = retrieve("How much does a chatbot cost?")
        captured: dict[str, str] = {}

        class Generator:
            def invoke(self, values: dict[str, str]) -> str:
                return "All projects include a lifetime guarantee."

        class Verifier:
            def invoke(self, values: dict[str, str]) -> str:
                captured.update(values)
                return "FAIL"
        with (
            patch("chatbot.app.get_langchain_rag", return_value=Generator()),
            patch(
                "chatbot.app.get_grounding_verifier",
                return_value=Verifier(),
            ),
        ):
            answer = generate_answer(
                "How much does a chatbot cost?", [], matches
            )
        self.assertIsNone(answer)
        self.assertIn("lifetime guarantee", captured["answer"])

    def test_hybrid_retrieval_fuses_semantic_and_lexical_rankings(self) -> None:
        lexical = lexical_rank("How much does a chatbot cost?")
        semantic = [lexical[0], *reversed(lexical[1:])]
        with patch("chatbot.app.semantic_rank", return_value=semantic):
            matches, mode = hybrid_retrieve("How much does a chatbot cost?")
        self.assertEqual(mode, "hybrid")
        self.assertEqual(matches[0][0].id, "pricing")

        fused = reciprocal_rank_fusion([lexical, semantic], [0.65, 0.35])
        self.assertGreater(fused["pricing"], fused[lexical[-1][0].id])

    def test_follow_up_query_uses_previous_user_question(self) -> None:
        history = [
            ChatMessage(role="user", text="How much does a chatbot cost?"),
            ChatMessage(role="assistant", text="Pricing is tailored."),
        ]
        rewritten = rewrite_retrieval_query("And the timeline?", history)
        self.assertIn("How much does a chatbot cost?", rewritten)
        self.assertIn("And the timeline?", rewritten)


if __name__ == "__main__":
    unittest.main()
