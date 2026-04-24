#!/bin/bash
# Setup API configuration for Graphiti
# Run once: bash scripts/setup-graphiti.sh

set -e

echo "🔧 Graphiti API Setup"
echo "======================"
echo ""
echo "This script configures Graphiti to use API-based LLM/Embeddings."
echo ""

# Detect which API keys are available
echo "📋 Checking available API keys..."

if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "  ✅ Anthropic (Claude) detected"
elif [ -n "$OPENAI_API_KEY" ]; then
    echo "  ✅ OpenAI detected"
elif [ -n "$GEMINI_API_KEY" ]; then
    echo "  ✅ Gemini detected"
elif [ -n "$MINIMAX_API_KEY" ]; then
    echo "  ✅ MiniMax detected"
else
    echo "  ⚠️  No API keys detected"
fi

echo ""
echo "📝 Configuration options:"
echo ""
echo "1. OpenAI (recommended for balance of cost/quality)"
echo "   export GRAPHITI_LLM_PROVIDER=openai"
echo "   export GRAPHITI_API_KEY=sk-..."
echo "   export GRAPHITI_LLM_MODEL=gpt-4o-mini"
echo ""
echo "2. Anthropic (Claude - best quality)"
echo "   export GRAPHITI_LLM_PROVIDER=anthropic"
echo "   export GRAPHITI_API_KEY=sk-ant-..."
echo "   export GRAPHITI_LLM_MODEL=claude-3-5-sonnet-latest"
echo ""
echo "3. Gemini (Google - good for embeddings)"
echo "   export GRAPHITI_LLM_PROVIDER=gemini"
echo "   export GRAPHITI_API_KEY=..."
echo "   export GRAPHITI_LLM_MODEL=gemini-2.0-flash"
echo ""
echo "4. MiniMax (Chinese - fast, cheap)"
echo "   export GRAPHITI_LLM_PROVIDER=minimax"
echo "   export GRAPHITI_API_KEY=..."
echo "   export GRAPHITI_LLM_MODEL=MiniMax-M2.7"
echo ""

# Check FalkorDB
echo "🗄️  Checking FalkorDB..."
if docker ps 2>/dev/null | grep -q falkordb; then
    echo "  ✅ FalkorDB is running"
else
    echo "  ⚠️  FalkorDB not running"
    echo "     Start with: docker-compose -f docker-compose.graphiti.yml up -d"
fi

echo ""
echo "✅ Setup instructions provided!"
echo ""
echo "Next steps:"
echo "  1. Set your API key: export GRAPHITI_API_KEY=sk-..."
echo "  2. Start FalkorDB: docker-compose -f docker-compose.graphiti.yml up -d"
echo "  3. Run CLI setup: python3 scripts/graphiti-cli.py setup"
