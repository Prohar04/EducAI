import app.db.prisma_connect as prisma_connect


def test_ensure_prisma_query_engine_fetches_and_copies(monkeypatch, tmp_path):
    cache_dir = tmp_path / ".prisma-cache"
    source_dir = cache_dir / "node_modules" / "prisma"
    source_dir.mkdir(parents=True)

    source_engine = source_dir / "query-engine-test"
    source_engine.write_text("engine-bytes")

    monkeypatch.setattr(prisma_connect, "PRISMA_CACHE_DIR", cache_dir)
    monkeypatch.setattr(prisma_connect, "__file__", str(tmp_path / "ai-server" / "app" / "db" / "prisma_connect.py"))

    run_calls = []

    def fake_run(cmd, check, env):
        run_calls.append((cmd, check, env.get("PRISMA_BINARY_CACHE_DIR")))

        class Result:
            returncode = 0

        return Result()

    monkeypatch.setattr(prisma_connect.subprocess, "run", fake_run)

    def fake_query_engine_name():
        return "prisma-query-engine-test"

    monkeypatch.setattr("prisma.engine.utils.query_engine_name", fake_query_engine_name)

    prisma_connect._ensure_prisma_query_engine()

    expected_engine = cache_dir / "prisma-query-engine-test"
    repo_engine = tmp_path / "ai-server" / "prisma-query-engine-test"

    assert run_calls
    assert expected_engine.exists()
    assert repo_engine.exists()
    assert expected_engine.read_text() == "engine-bytes"
    assert repo_engine.read_text() == "engine-bytes"
