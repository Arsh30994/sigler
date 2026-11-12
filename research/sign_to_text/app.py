"""Manual research capture; no ISL recognition claim."""
import cv2
from .camera import open_camera
from .hand_tracker import MediaPipeHandTracker
def main():
    camera=open_camera(); tracker=MediaPipeHandTracker()
    try:
        while True:
            ok, frame=camera.read()
            if not ok: break
            result=tracker.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            cv2.putText(frame, f"hands: {len(result.multi_hand_landmarks or [])}", (12,30), cv2.FONT_HERSHEY_SIMPLEX,.8,(0,255,0),2)
            cv2.imshow("Sigler Sign-to-Text Research (ESC to exit)",frame)
            if cv2.waitKey(1)&0xFF==27: break
    finally: tracker.close(); camera.release(); cv2.destroyAllWindows()
if __name__ == "__main__": main()
