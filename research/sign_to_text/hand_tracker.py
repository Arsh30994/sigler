class MediaPipeHandTracker:
    def __init__(self):
        try:
            import mediapipe as mp
        except ImportError as error: raise RuntimeError("Install research/sign_to_text/requirements.txt to use camera tracking") from error
        self.mp=mp; self.hands=mp.solutions.hands.Hands(max_num_hands=2, model_complexity=1)
    def process(self, rgb_frame): return self.hands.process(rgb_frame)
    def close(self): self.hands.close()
