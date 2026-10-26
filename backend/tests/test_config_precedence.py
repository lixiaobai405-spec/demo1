from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.core import config

def test_explicit_process_settings_win_over_env_file(tmp_path, monkeypatch):
    path = tmp_path / "isolated.env"
    path.write_text("DATABASE_URL=sqlite:///wrong.db\nLLM_MODE=live\n", encoding="utf-8")
    monkeypatch.setenv("DATABASE_URL", "sqlite:///isolated.db")
    monkeypatch.setenv("LLM_MODE", "mock")
    config.load_env_file(path)
    assert config.os.environ["DATABASE_URL"] == "sqlite:///isolated.db"
    assert config.os.environ["LLM_MODE"] == "mock"

def test_env_file_then_mykey_then_default(tmp_path, monkeypatch):
    path = tmp_path / "isolated.env"
    path.write_text("TEST_CONFIG_PRECEDENCE=file\n", encoding="utf-8")
    monkeypatch.delenv("TEST_CONFIG_PRECEDENCE", raising=False)
    monkeypatch.setattr(config, "_mykey", {"probe": "local"})
    config.load_env_file(path)
    assert config._resolve("probe", "TEST_CONFIG_PRECEDENCE", "default") == "file"
    monkeypatch.delenv("TEST_CONFIG_PRECEDENCE")
    assert config._resolve("probe", "TEST_CONFIG_PRECEDENCE", "default") == "local"
    monkeypatch.setattr(config, "_mykey", {})
    assert config._resolve("probe", "TEST_CONFIG_PRECEDENCE", "default") == "default"

def test_actual_imported_settings_and_engine_honor_isolated_process_environment(tmp_path):
    import os
    import subprocess
    target = tmp_path / "process-owned.db"
    environment = dict(os.environ, DATABASE_URL="sqlite:///" + target.as_posix(),
                       LLM_MODE="mock", RAG_ENABLED="false", LLM_REPORT_ENABLED="false")
    script = """
from pathlib import Path
import sys
from app.core.config import settings
from app.db.session import engine
assert Path(engine.url.database).resolve() == Path(sys.argv[1]).resolve()
assert settings.llm_mode == 'mock'
assert not settings.rag_enabled and not settings.llm_report_enabled
"""
    result = subprocess.run([sys.executable, "-c", script, str(target)], env=environment,
                            cwd=Path(__file__).resolve().parents[1], capture_output=True, text=True, timeout=15)
    assert result.returncode == 0, result.stderr
