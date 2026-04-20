from ...core.config import settings
from openai import AsyncOpenAI


class OpenAPI(AsyncOpenAI):
    def __init__(self):
        try:
            # Use direct OpenAI if key is available; fall back to OpenRouter
            openai_key = settings.OPENAI_API_KEY
            openrouter_key = settings.OPEN_ROUTER_APIKEY
            if openai_key:
                super().__init__(api_key=openai_key)
            else:
                super().__init__(base_url="https://openrouter.ai/api/v1", api_key=openrouter_key)
            self._using_openai = bool(openai_key)
        except Exception as e:
            print(f"Error initializing OpenAPI: {e}")
            self._using_openai = False

    async def get_embeddings(self, input: str, model: str = "text-embedding-3-small") -> list[float]:
        text = input.replace("\n", " ")
        # OpenRouter uses prefixed model names; direct OpenAI does not
        resolved_model = model if self._using_openai else f"openai/{model}"
        response = await self.embeddings.create(
            input=text,
            model=resolved_model,
            encoding_format="float",
        )
        return response.data[0].embedding


open_api = OpenAPI()
