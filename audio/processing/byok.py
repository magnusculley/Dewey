'''
Basically the idea is that the user inputs the api key somewhere in the app and then we can verify it.
Since the front end is not implemented yet, this is all just psuedo code
'''

from any_llm import AnyLLM

class LLM:
    def __init__(self, provider: str, api_key: str):
        self.provider = provider
        self.api_key = api_key
        self.client = AnyLLM.create(provider=provider, api_key=api_key)

# Directly queries the provider for available models
client = AnyLLM.create(provider="openai", api_key=user_key)
models = client.list_models()
model_ids = [m.id for m in models]