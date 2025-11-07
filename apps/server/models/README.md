# Local LLM Models

This directory contains local AI models for offline workflow generation.

## Phi-3 Mini Setup

Taktak uses **Phi-3-mini-4k-instruct** for local AI capabilities. This model is optimized for:
- Low resource usage (4GB RAM minimum)
- Fast inference on CPU
- High-quality instruction following

### Download Instructions

1. **Download the model** from Hugging Face:
   ```bash
   # Option 1: Using wget (Linux/Mac)
   wget https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf

   # Option 2: Using curl (Linux/Mac)
   curl -L -o Phi-3-mini-4k-instruct-q4.gguf https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf

   # Option 3: Manual download (Windows/All)
   # Visit: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf
   # Download: Phi-3-mini-4k-instruct-q4.gguf (~2.4GB)
   ```

2. **Place the model** in this directory:
   ```
   apps/server/models/phi-3-mini-4k-instruct-q4.gguf
   ```

3. **Update .env** (if using a different path):
   ```env
   LOCAL_LLM_MODEL_PATH=./models/phi-3-mini-4k-instruct-q4.gguf
   ```

### Model Variants

| Model | Size | RAM Required | Speed | Quality |
|-------|------|--------------|-------|---------|
| q4 (recommended) | 2.4GB | 4GB | Fast | Good |
| q5 | 3.0GB | 6GB | Medium | Better |
| q8 | 4.5GB | 8GB | Slow | Best |

**For most users, q4 is the best balance of speed and quality.**

### AI Mode Configuration

Set `AI_MODE` in your `.env` file:

- **`cloud`** - Always use Google Gemini (requires API key)
- **`local`** - Always use local Phi-3 (offline-first)
- **`auto`** - Try cloud first, fallback to local if offline or API fails (recommended)

```env
AI_MODE=auto
```

### Troubleshooting

**Model not found error:**
- Ensure the model file exists at the path specified in `LOCAL_LLM_MODEL_PATH`
- Check file permissions (model file must be readable)

**Out of memory error:**
- Use a smaller quantization (q4 instead of q8)
- Reduce `LOCAL_LLM_CONTEXT_SIZE` in .env (default: 4096)
- Close other applications to free up RAM

**Slow inference:**
- Use q4 quantization for faster inference
- Reduce `LOCAL_LLM_MAX_TOKENS` (default: 2048)
- Consider upgrading to a machine with more CPU cores

### Alternative Models

You can use other GGUF models compatible with llama.cpp:
- **Llama 3.2 1B** - Smaller, faster (1GB)
- **Mistral 7B** - Larger, more capable (4GB+)
- **Gemma 2B** - Google's small model (2GB)

Update `LOCAL_LLM_MODEL_PATH` to point to your chosen model.

---

## License

Models are subject to their respective licenses:
- **Phi-3**: MIT License
- Check model card on Hugging Face for specific terms

