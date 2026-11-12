import argparse
from .realtime import load_checkpoint
def main():
 parser=argparse.ArgumentParser(); parser.add_argument('checkpoint'); args=parser.parse_args(); load_checkpoint(args.checkpoint); raise SystemExit('Checkpoint validated; webcam inference requires a real signer-evaluated model.')
if __name__=='__main__': main()
