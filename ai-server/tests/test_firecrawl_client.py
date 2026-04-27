import asyncio


from app.core.config import settings
from app.domains.scrapping.firecrawl_client import FirecrawlClient


def test_firecrawl_client_disables_scraping_without_api_key(monkeypatch):
    monkeypatch.setattr(settings, "FIRECRAWL_API_KEY", None)

    client = FirecrawlClient()

    assert asyncio.run(client.scrape_url("https://example.com")) is None
    assert asyncio.run(client.scrape_urls(["https://example.com"])) == []