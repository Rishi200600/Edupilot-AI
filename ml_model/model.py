"""Small neural regression model that estimates plan difficulty on a 0–1 scale."""
import torch
from torch import nn

class DifficultyModel(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.network = nn.Sequential(nn.Linear(4, 16), nn.ReLU(), nn.Linear(16, 8), nn.ReLU(), nn.Linear(8, 1), nn.Sigmoid())
    def forward(self, features: torch.Tensor) -> torch.Tensor:
        return self.network(features)
