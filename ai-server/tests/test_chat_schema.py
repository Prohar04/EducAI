from app.api.v1.chat import ChatSource, normalize_chat_response


def test_normalize_chat_response_fills_required_fields():
    source_catalog = {
        "program:1": ChatSource(type="internal", title="Program: MSc CS - Example University", id="program:1"),
        "web:1": ChatSource(type="web", title="Example official page", url="https://example.edu"),
    }

    response = normalize_chat_response(
        {"bullets": ["Use your saved program shortlist first."], "sourceIds": ["program:1", "web:1"]},
        source_catalog,
        ["program:1"],
    )

    assert response.answer == "Use your saved program shortlist first."
    assert response.bullets == ["Use your saved program shortlist first."]
    assert response.nextSteps == []
    assert response.confidence in {"medium", "low"}
    assert [source.type for source in response.sources] == ["internal", "web"]
