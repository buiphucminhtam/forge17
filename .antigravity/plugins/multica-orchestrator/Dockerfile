FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (for mmx-cli)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g mmx-cli

# Copy and install Python dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

# Create non-root user
RUN useradd -m -u 1000 forgewright
USER forgewright

# Default command
CMD ["python", "-m", "multica_orchestrator.scripts.daemon"]
