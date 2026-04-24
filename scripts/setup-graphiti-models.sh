#!/bin/bash
# Setup Ollama models for Graphiti
# Run once: bash scripts/setup-graphiti-models.sh

set -e

echo "🔧 Graphiti Model Setup"
echo "========================"

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Install from: https://ollama.ai"
    exit 1
fi

# Pull required models
echo ""
echo "📥 Pulling LLM model (deepseek-r1:7b)..."
echo "   This may take a few minutes on first run..."
ollama pull deepseek-r1:7b

echo ""
echo "📥 Pulling embedding model (nomic-embed-text)..."
echo "   This may take a minute on first run..."
ollama pull nomic-embed-text

# Verify models
echo ""
echo "✅ Verification:"
ollama list | grep -E "(deepseek-r1|nomic-embed)"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start Ollama: ollama serve"
echo "  2. Start FalkorDB: docker-compose -f docker-compose.graphiti.yml up -d"
echo "  3. Run CLI setup: python3 scripts/graphiti-cli.py setup"
