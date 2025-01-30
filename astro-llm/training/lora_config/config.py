# training/lora_config/config.py
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class LoRAConfig:
    r: int = 16
    lora_alpha: int = 32
    target_modules: List[str] = None
    lora_dropout: float = 0.05
    bias: str = "none"
    task_type: str = "CAUSAL_LM"
    
    def __post_init__(self):
        if self.target_modules is None:
            # Default target modules for Mistral
            self.target_modules = [
                "q_proj",
                "v_proj",
                "k_proj",
                "o_proj",
                "gate_proj",
                "up_proj",
                "down_proj"
            ]
    
    def to_dict(self):
        return {
            "r": self.r,
            "lora_alpha": self.lora_alpha,
            "target_modules": self.target_modules,
            "lora_dropout": self.lora_dropout,
            "bias": self.bias,
            "task_type": self.task_type
        }

@dataclass
class TrainingConfig:
    model_name: str = "mistralai/Mistral-7B-v0.1"
    batch_size: int = 1
    gradient_accumulation_steps: int = 4
    num_train_epochs: int = 3
    learning_rate: float = 2e-4
    lr_scheduler_type: str = "cosine"
    warmup_ratio: float = 0.05
    weight_decay: float = 0.01
    optimizer: str = "paged_adamw_32bit"
    max_grad_norm: float = 0.3
    max_steps: Optional[int] = None
    save_steps: int = 100
    logging_steps: int = 10
    eval_steps: int = 100
    
    def to_dict(self):
        return {
            "model_name": self.model_name,
            "batch_size": self.batch_size,
            "gradient_accumulation_steps": self.gradient_accumulation_steps,
            "num_train_epochs": self.num_train_epochs,
            "learning_rate": self.learning_rate,
            "lr_scheduler_type": self.lr_scheduler_type,
            "warmup_ratio": self.warmup_ratio,
            "weight_decay": self.weight_decay,
            "optimizer": self.optimizer,
            "max_grad_norm": self.max_grad_norm,
            "max_steps": self.max_steps,
            "save_steps": self.save_steps,
            "logging_steps": self.logging_steps,
            "eval_steps": self.eval_steps
        }