from pathlib import Path
import pandas as pd
from datasets import Dataset
from loguru import logger
from typing import List, Dict

class DatasetFormatter:
    def __init__(self, input_file: str):
        self.input_file = Path(input_file)
        
    def create_instruction_pairs(self, df: pd.DataFrame) -> List[Dict]:
        """Convert cleaned texts into instruction-response pairs."""
        instruction_pairs = []
        
        for _, row in df.iterrows():
            # Example format - modify based on your data structure
            instruction_pair = {
                "instruction": "Analyze the following astrological configuration and provide an interpretation:",
                "input": row['content'],
                "output": ""  # Will be filled with actual interpretations from your data
            }
            instruction_pairs.append(instruction_pair)
            
        return instruction_pairs
    
    def format_dataset(self) -> Dataset:
        """Create a HuggingFace dataset from processed data."""
        logger.info("Loading cleaned data...")
        df = pd.read_parquet(self.input_file)
        
        logger.info("Creating instruction pairs...")
        instruction_pairs = self.create_instruction_pairs(df)
        
        logger.info("Converting to HuggingFace dataset...")
        dataset = Dataset.from_pandas(pd.DataFrame(instruction_pairs))
        
        return dataset
    
    def save_dataset(self, dataset: Dataset, output_dir: str):
        """Save the formatted dataset."""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        dataset.save_to_disk(output_path)
        logger.info(f"Dataset saved to {output_path}")

if __name__ == "__main__":
    formatter = DatasetFormatter("data/processed/cleaned_texts.parquet")
    dataset = formatter.format_dataset()
    formatter.save_dataset(dataset, "data/processed/formatted_dataset")