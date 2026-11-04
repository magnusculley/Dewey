from any_llm import AnyLLM

llm = AnyLLM.create("mistral", api_key="your-mistral-api-key")

response = llm.completion(
    model="mistral-small-latest",
    messages=[{"role": "user", "content": "Hello!"}]
)
