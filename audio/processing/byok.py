'''
User selects provider->
User inputs API key->
BYOK verifies key and returns models->
User selects model from dropdown->
BYOK saves configuration for prompter.py to use
Since the front end is not implemented yet, this is all just psuedo code
'''
from any_llm import AnyLLM
from litellm import check_valid_key

class LLM:
    provider: str
    api_key: str
    client: AnyLLM
    model: str | None = None
    
    def __init__(self, provider: str, api_key: str):
        self.provider = provider
        self.api_key = api_key
        self.client = AnyLLM.create(provider=provider, api_key=api_key)
        self.models= None
        
    def set_provider(self, provider: str):
        self.provider = provider
        
    def set_and_verify_api_key(self, api_key: str):
        self.client = AnyLLM.create(provider=self.provider, api_key=api_key)
        # verify key by trying to list models
        try:
            self.models = self.client.list_models()
            return True
        except Exception as e:
            print(f"Error verifying API key: {e}")
            return False
    
    def list_models(self):
        models = self.client.list_models()
        return models
    
    def set_model(self, model_name: str):
        self.client.set_model(model_name)
        self.model = model_name