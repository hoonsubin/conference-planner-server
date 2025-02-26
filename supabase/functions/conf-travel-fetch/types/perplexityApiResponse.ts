type Role = "system" | "user" | "assistant";

interface Message {
  role: Role; // Role of the message sender (e.g., "system", "user", or "assistant")
  content: string; // Content of the message
}

export interface PerplexityApiRes {
  id: string; // Unique identifier for the response
  object: string; // Type of object (e.g., "chat.completion")
  created: number; // Timestamp of when the response was created
  model: string; // Model used for generating the response (e.g., "sonar" or "mistral-7b-instruct")
  choices: Array<{
    message: Message;
    finish_reason?: string; // Reason why the generation finished (e.g., "stop", "length")
    index?: number; // Index of the choice in case of multiple outputs
  }>;
  usage?: {
    prompt_tokens: number; // Number of tokens in the input prompt
    completion_tokens: number; // Number of tokens in the generated completion
    total_tokens: number; // Total tokens used (prompt + completion)
  };
}

export interface PerplexityApiReq {
  model: string; // The name of the model to use (e.g., "sonar", "mistral-7b-instruct").
  messages: Message[];
  max_tokens?: number; // Optional. The maximum number of tokens to generate in the response.
  temperature?: number; // Optional. Sampling temperature for randomness (e.g., 0.0 for deterministic).
  top_p?: number; // Optional. Nucleus sampling parameter.
  presence_penalty?: number; // Optional. Penalizes new tokens based on their presence in the text so far.
  frequency_penalty?: number; // Optional. Penalizes new tokens based on their frequency in the text so far.
  search_domain_filter?: string[]; // Optional. Filters results to specific domains (e.g., ["perplexity.ai"]).
  search_recency_filter?: "hour" | "day" | "week" | "month"; // Optional. Filters results by recency.
  return_images?: boolean; // Optional. Whether to include images in the response.
  return_related_questions?: boolean; // Optional. Whether to include related questions in the response.
  top_k?: number; // Optional. Number of top results to consider.
  stream?: boolean; // Optional. Whether to enable streaming responses.
  response_format?: {
    type: "json_schema" | "regex"; // Specifies the structured output format type.
    json_schema?: object; // JSON Schema object for structured outputs (if type is "json_schema").
    regex?: { regex: string }; // Regular expression for structured outputs (if type is "regex").
  };
}
