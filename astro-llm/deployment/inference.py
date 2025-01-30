import torch
from typing import Dict, Any
from pathlib import Path
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
from loguru import logger

class AstroLLMInference:
    def __init__(
        self,
        base_model_name: str,
        adapter_path: str,
        device: str = None
    ):
        self.base_model_name = base_model_name
        self.adapter_path = Path(adapter_path)
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        
        self.model = None
        self.tokenizer = None
        self.load_model()
    
    def load_model(self):
        """Load the model and tokenizer."""
        logger.info("Loading model and tokenizer...")
        try:
            # Load base model
            base_model = AutoModelForCausalLM.from_pretrained(
                self.base_model_name,
                device_map="auto",
                trust_remote_code=True
            )
            
            # Load LoRA adapter
            self.model = PeftModel.from_pretrained(base_model, self.adapter_path)
            self.tokenizer = AutoTokenizer.from_pretrained(self.base_model_name)
            
            logger.info("Model and tokenizer loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def format_chart_data(self, chart_data: Dict[str, Any]) -> str:
        """Format chart data into a prompt string."""
        prompt = "Analyze this astrological chart:\n\n"
        
        # Format planet positions
        prompt += "Planet Positions:\n"
        for planet, data in chart_data.get('points', {}).items():
            prompt += f"{planet} in {data['sign']} (House {data['house']})\n"
        
        # Format aspects
        prompt += "\nMajor Aspects:\n"
        for aspect in chart_data.get('aspects', []):
            prompt += f"{aspect['planet1']} {aspect['aspect_type']} {aspect['planet2']}\n"
        
        return prompt
    
    def generate_interpretation(
        self,
        chart_data: Dict[str, Any],
        max_length: int = 512,
        temperature: float = 0.7
    ) -> str:
        """Generate astrological interpretation for a chart."""
        try:
            # Format input
            prompt = self.format_chart_data(chart_data)
            
            # Tokenize
            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                padding=True,
                truncation=True
            ).to(self.device)
            
            # Generate
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_length=max_length,
                    temperature=temperature,
                    do_sample=True,
                    num_return_sequences=1
                )
            
            # Decode
            interpretation = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            return {
                'interpretation': interpretation,
                'prompt': prompt
            }
            
        except Exception as e:
            logger.error(f"Error generating interpretation: {str(e)}")
            raise
    
    def batch_generate(
        self,
        chart_data_list: List[Dict[str, Any]],
        max_length: int = 512,
        temperature: float = 0.7
    ) -> List[Dict[str, str]]:
        """Generate interpretations for multiple charts."""
        return [
            self.generate_interpretation(chart_data, max_length, temperature)
            for chart_data in chart_data_list
        ]

if __name__ == "__main__":
    # Example usage
    inferencer = AstroLLMInference(
        base_model_name="mistralai/Mistral-7B-v0.1",
        adapter_path="training/outputs/final_model"
    )
    
    # Example chart data
    example_chart = {
        'points': {
            'Sun': {'sign': 'Aquarius', 'house': 1},
            'Moon': {'sign': 'Libra', 'house': 8},
            'Mercury': {'sign': 'Capricorn', 'house': 12}
        },
        'aspects': [
            {'planet1': 'Sun', 'aspect_type': 'Square', 'planet2': 'Jupiter'}
        ]
    }
    
    # Generate interpretation
    result = inferencer.generate_interpretation(example_chart)
    print(result['interpretation'])