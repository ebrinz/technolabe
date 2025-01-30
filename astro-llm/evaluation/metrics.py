from typing import List, Dict
import numpy as np
from loguru import logger
from datasets import load_from_disk
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

class AstroLLMEvaluator:
    def __init__(self, base_model_name: str, adapter_path: str):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.base_model_name = base_model_name
        self.adapter_path = adapter_path
        
    def load_model(self):
        """Load the fine-tuned model with adapter."""
        logger.info("Loading model and tokenizer...")
        
        # Load base model and tokenizer
        base_model = AutoModelForCausalLM.from_pretrained(
            self.base_model_name,
            device_map="auto",
            trust_remote_code=True
        )
        
        # Load adapter
        model = PeftModel.from_pretrained(base_model, self.adapter_path)
        tokenizer = AutoTokenizer.from_pretrained(self.base_model_name)
        
        return model, tokenizer
    
    def evaluate_predictions(
        self,
        predictions: List[str],
        references: List[str]
    ) -> Dict[str, float]:
        """
        Calculate evaluation metrics.
        Customize these metrics based on your specific needs.
        """
        metrics = {}
        
        # Example metrics (modify based on your requirements)
        # 1. Response length analysis
        pred_lengths = [len(p.split()) for p in predictions]
        metrics['avg_response_length'] = np.mean(pred_lengths)
        metrics['response_length_std'] = np.std(pred_lengths)
        
        # 2. Astrological term usage
        astro_terms = ['conjunction', 'trine', 'square', 'opposition', 'sextile']
        term_usage = []
        for pred in predictions:
            pred_lower = pred.lower()
            term_count = sum(term in pred_lower for term in astro_terms)
            term_usage.append(term_count)
        
        metrics['avg_astro_terms'] = np.mean(term_usage)
        
        # 3. Custom domain-specific metrics
        # Add your own metrics here
        
        return metrics
    
    def generate_prediction(
        self,
        model,
        tokenizer,
        prompt: str,
        max_length: int = 512
    ) -> str:
        """Generate a single prediction."""
        inputs = tokenizer(prompt, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=max_length,
                num_return_sequences=1,
                temperature=0.7,
                do_sample=True
            )
        
        return tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    def run_evaluation(self, test_dataset_path: str) -> Dict[str, float]:
        """Run complete evaluation pipeline."""
        # Load test dataset
        test_dataset = load_from_disk(test_dataset_path)
        
        # Load model and tokenizer
        model, tokenizer = self.load_model()
        
        # Generate predictions
        logger.info("Generating predictions...")
        predictions = []
        references = []
        
        for example in test_dataset:
            prompt = f"Analyze this astrological configuration:\n{example['input']}"
            prediction = self.generate_prediction(model, tokenizer, prompt)
            predictions.append(prediction)
            references.append(example['output'])
        
        # Calculate metrics
        logger.info("Calculating metrics...")
        metrics = self.evaluate_predictions(predictions, references)
        
        # Log results
        for metric_name, value in metrics.items():
            logger.info(f"{metric_name}: {value}")
        
        return metrics

if __name__ == "__main__":
    evaluator = AstroLLMEvaluator(
        base_model_name="mistralai/Mistral-7B-v0.1",
        adapter_path="training/outputs/final_model"
    )
    metrics = evaluator.run_evaluation("data/processed/test_dataset")