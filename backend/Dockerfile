FROM python:3.14-slim

# Install uv
RUN pip install uv

WORKDIR /app

# Copy pyproject.toml and uv.lock for reproducible installs
COPY pyproject.toml uv.lock ./

# Sync dependencies using locked versions from uv.lock
RUN uv sync --frozen --no-dev

# Add venv to PATH so uvicorn is available
ENV PATH="/app/.venv/bin:$PATH"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
