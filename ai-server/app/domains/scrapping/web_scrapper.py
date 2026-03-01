from ...core.config import settings
from apify_client import ApifyClient


class WebScrapper:
    def __init__(self):
        self.api_key = settings.APIFY_APIKEY or ""
        self.base_url = (
            "https://api.apify.com/v2/acts/"
            "tryora~web-scraper/runs?token="
            + self.api_key
        )
        self.client = ApifyClient(self.api_key)

    async def scrape(self, url: str):
        run_input = {"profileUrls": [url]}
        run = self.client.actor(
            "2SyF0bVxmgGr8IVCZ"
        ).call(run_input=run_input)
        results = []
        dataset_id = run["defaultDatasetId"]  # type: ignore
        for item in self.client.dataset(
            dataset_id
        ).iterate_items():
            results.append(item)
        return results
