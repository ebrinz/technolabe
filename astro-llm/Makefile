.PHONY: setup venv clean requirements dev-requirements install update freeze lint

# Variables
VENV_NAME := .venv
PYTHON := $(VENV_NAME)/bin/python
UV := $(VENV_NAME)/bin/uv
REQUIREMENTS := requirements.txt
DEV_REQUIREMENTS := requirements-dev.txt

# Default target
all: setup

# Create virtual environment and install uv
venv:
	python -m venv $(VENV_NAME)
	./$(VENV_NAME)/bin/pip install uv
	@echo "Virtual environment created with uv installed"

# Install production dependencies
install: venv
	@echo "Installing dependencies..."
	$(UV) pip install -r $(REQUIREMENTS)

# Install development dependencies
install-dev: install
	@echo "Installing development dependencies..."
	$(UV) pip install -r $(DEV_REQUIREMENTS)

# Update all dependencies to their latest versions
update:
	@echo "Updating dependencies..."
	$(UV) pip install --upgrade -r $(REQUIREMENTS)
	$(UV) pip install --upgrade -r $(DEV_REQUIREMENTS)

# Freeze current dependencies
freeze:
	@echo "Freezing dependencies..."
	$(UV) pip freeze > $(REQUIREMENTS)
	@echo "Dependencies frozen to $(REQUIREMENTS)"

# Generate development requirements
dev-requirements:
	@echo "Creating development requirements..."
	$(UV) pip freeze > $(DEV_REQUIREMENTS)
	@echo "Development dependencies frozen to $(DEV_REQUIREMENTS)"

# Clean up virtual environment
clean:
	@echo "Cleaning up..."
	rm -rf $(VENV_NAME)
	@echo "Cleaned virtual environment"

# Lint the code
lint:
	$(UV) pip install ruff
	$(VENV_NAME)/bin/ruff check .

# Help command
help:
	@echo "Available commands:"
	@echo "  make venv             - Create virtual environment and install uv"
	@echo "  make install         - Install production dependencies"
	@echo "  make install-dev     - Install development dependencies"
	@echo "  make update          - Update all dependencies"
	@echo "  make freeze          - Freeze current dependencies"
	@echo "  make dev-requirements - Generate development requirements"
	@echo "  make clean           - Remove virtual environment"
	@echo "  make lint            - Run linting"