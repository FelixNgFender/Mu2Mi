import api
import torch
from cog import BasePredictor, Input, Path


class Predictor(BasePredictor):
    def setup(self):
        """Load the model into memory to make running multiple predictions efficient"""
        self.net = torch.load("weights.pth")
        self.separator = api.Separator()
        # TODO: See https://github.com/facebookresearch/demucs/blob/main/docs/api.md
    def predict(
        self,
        image: Path = Input(description="Image to enlarge"),
        scale: float = Input(description="Factor to scale image by", default=1.5),
    ) -> Path:
        """Run a single prediction on the model"""
        # ... pre-processing ...
        output = self.net(input)
        # ... post-processing ...
        return output
