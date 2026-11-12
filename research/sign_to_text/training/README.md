# Future TCN interface

Only consume validated samples with `features.npy` shape `(frames, 126)`, `presence.npy` shape `(frames, 2)`, and signer-separated train/evaluation partitions from `splits.py`. `python -m research.sign_to_text.train` runs the readiness gate and intentionally refuses to train until real, signer-reviewed data exists. Do not report accuracy until signer-separated evaluation is performed.
