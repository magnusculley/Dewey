"""
User selects provider->
User inputs API key->
BYOK verifies key and returns models->
User selects model from dropdown->
BYOK saves configuration for prompter.py to use
Since the front end is not implemented yet, this is all just psuedo code
"""

from typing import Any


class LLM:
    provider: str | None = None
    api_key: str | None = None
    client: Any | None = None
    models: list[str] | None = None
    model: str | None = None

    def __init__(self):
        self.provider = None
        self.api_key = None
        self.client = None
        self.models = None
        self.model = None

    def set_provider(self, provider: str):
        self.provider = provider

    def set_and_verify_api_key(self, api_key: str, provider: str):
        from any_llm import AnyLLM

        self.client = AnyLLM.create(provider=provider, api_key=api_key)
        self.provider = provider
        self.api_key = api_key
        # verify key by trying to list models
        try:
            self.models = self.client.list_models()
            return True
        except Exception as e:
            print(f"Error verifying API key: {e}")
            return False

    def list_models(self):
        if self.client is None:
            raise RuntimeError("API key has not been configured.")
        models = self.client.list_models()
        return models

    def set_model(self, model_name: str):
        if self.client is None:
            raise RuntimeError("API key has not been configured.")
        self.client.set_model(model_name)
        self.model = model_name
