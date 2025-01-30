# Initial setup
make setup

# Install production dependencies
make install

# Or install everything including dev tools
make install-dev

# Update dependencies
make update

# Freeze current environment
make freeze


# Instructions

### Place your raw astrological texts in data/raw/
### Run preprocessing:

```python -m data.preprocessing.clean_text```
```python -m data.preprocessing.format_dataset```

### Train the model:

```python -m training.train```

### Evaluate:

```python -m evaluation.metrics```

### Deploy:

```python -m deployment.inference```