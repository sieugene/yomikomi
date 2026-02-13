from optimum.onnxruntime import ORTModelForSeq2SeqLM
from optimum.onnxruntime.configuration import AutoQuantizationConfig
from optimum.onnxruntime.quantization import ORTQuantizer
from pathlib import Path
import shutil

model_id = "Helsinki-NLP/opus-mt-ja-ru"
output_dir = Path("./opus-mt-ja-ru-onnx")

model = ORTModelForSeq2SeqLM.from_pretrained(
    model_id,
    export=True,
)
model.save_pretrained(output_dir)

qconfig = AutoQuantizationConfig.arm64(is_static=False, per_channel=False) 

quantizer = ORTQuantizer.from_pretrained(output_dir)
quantizer.quantize(
    save_dir=output_dir / "quantized",
    quantization_config=qconfig,
)

for file in ["config.json", "generation_config.json", "tokenizer.json", "vocab.json", "source.spm", "target.spm"]:
    if (output_dir / file).exists():
        shutil.copy(output_dir / file, output_dir / "quantized" / file)

print("Files:", output_dir / "quantized")