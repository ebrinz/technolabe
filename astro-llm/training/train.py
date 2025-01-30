import os
from pathlib import Path
from loguru import logger
import torch
from datasets import load_from_disk
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    Trainer,
    TrainingArguments,
)
from peft import get_peft_model, prepare_model_for_kbit_training
from training.lora_config.config import LoRAConfig, TrainingConfig

class AstroLLMTrainer:
    def __init__(
        self,
        training_config: TrainingConfig,
        lora_config: LoRAConfig,
        dataset_path: str,
        output_dir: str
    ):
        self.training_config = training_config
        self.lora_config = lora_config
        self.dataset_path = Path(dataset_path)
        self.output_dir = Path(output_dir)
        
    def setup_model(self):
        """Initialize and prepare the model for training."""
        logger.info("Setting up model...")
        
        # Quantization config
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
        )
        
        # Load base model
        model = AutoModelForCausalLM.from_pretrained(
            self.training_config.model_name,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True
        )
        
        # Prepare for kbit training
        model = prepare_model_for_kbit_training(model)
        
        # Get PEFT model
        model = get_peft_model(model, self.lora_config.to_dict())
        
        return model
    
    def setup_tokenizer(self):
        """Initialize the tokenizer."""
        logger.info("Setting up tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(
            self.training_config.model_name,
            trust_remote_code=True
        )
        tokenizer.pad_token = tokenizer.eos_token
        return tokenizer
    
    def load_dataset(self):
        """Load the processed dataset."""
        logger.info("Loading dataset...")
        return load_from_disk(self.dataset_path)
    
    def train(self):
        """Run the training process."""
        model = self.setup_model()
        tokenizer = self.setup_tokenizer()
        dataset = self.load_dataset()
        
        # Set up training arguments
        training_args = TrainingArguments(
            output_dir=self.output_dir,
            per_device_train_batch_size=self.training_config.batch_size,
            gradient_accumulation_steps=self.training_config.gradient_accumulation_steps,
            num_train_epochs=self.training_config.num_train_epochs,
            learning_rate=self.training_config.learning_rate,
            lr_scheduler_type=self.training_config.lr_scheduler_type,
            warmup_ratio=self.training_config.warmup_ratio,
            weight_decay=self.training_config.weight_decay,
            optimizer=self.training_config.optimizer,
            max_grad_norm=self.training_config.max_grad_norm,
            max_steps=self.training_config.max_steps,
            save_steps=self.training_config.save_steps,
            logging_steps=self.training_config.logging_steps,
            eval_steps=self.training_config.eval_steps,
        )
        
        # Initialize trainer
        trainer = Trainer(
            model=model,
            train_dataset=dataset,
            args=training_args,
            data_collator=lambda data: {'input_ids': torch.stack([f['input_ids'] for f in data]),
                                      'attention_mask': torch.stack([f['attention_mask'] for f in data])}
        )
        
        # Start training
        logger.info("Starting training...")
        trainer.train()
        
        # Save the final model
        logger.info("Saving model...")
        trainer.save_model(self.output_dir / "final_model")

if __name__ == "__main__":
    # Load configurations
    training_config = TrainingConfig()
    lora_config = LoRAConfig()
    
    # Initialize trainer
    trainer = AstroLLMTrainer(
        training_config=training_config,
        lora_config=lora_config,
        dataset_path="data/processed/formatted_dataset",
        output_dir="training/outputs"
    )
    
    # Run training
    trainer.train()