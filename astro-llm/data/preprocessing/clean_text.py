from pathlib import Path
from typing import List, Dict
import re
from loguru import logger
import pandas as pd

class TextCleaner:
    def __init__(self, raw_data_dir: str):
        self.raw_data_dir = Path(raw_data_dir)
        
    def clean_text(self, text: str) -> str:
        """Clean individual text entries."""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep astrological symbols
        text = re.sub(r'[^A-Za-z0-9\s\u2648-\u2653☉☽☿♀♂♃♄]', '', text)
        return text.strip()
    
    def process_file(self, file_path: Path) -> List[Dict]:
        """Process individual files."""
        logger.info(f"Processing file: {file_path}")
        
        cleaned_entries = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Split into chunks (modify based on your data structure)
            chunks = content.split('\n\n')
            
            for chunk in chunks:
                if not chunk.strip():
                    continue
                    
                cleaned_text = self.clean_text(chunk)
                if cleaned_text:
                    cleaned_entries.append({
                        'source': file_path.name,
                        'content': cleaned_text
                    })
                    
        except Exception as e:
            logger.error(f"Error processing {file_path}: {str(e)}")
            
        return cleaned_entries
    
    def process_all_files(self) -> pd.DataFrame:
        """Process all files in the raw data directory."""
        all_entries = []
        
        # Process all txt and markdown files
        for file_path in self.raw_data_dir.glob('*.[tm][dx][tt]'):
            entries = self.process_file(file_path)
            all_entries.extend(entries)
            
        return pd.DataFrame(all_entries)

if __name__ == "__main__":
    cleaner = TextCleaner("data/raw")
    df = cleaner.process_all_files()
    df.to_parquet("data/processed/cleaned_texts.parquet")
    logger.info(f"Processed {len(df)} entries")