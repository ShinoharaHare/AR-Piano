# angleTest.py
import cv2
import mediapipe as mp
import numpy as np
mp_drawing = mp.solutions.drawing_utils
mp_hands   = mp.solutions.hands

def NormalizedLandmark2Array(nl):
    return np.array([nl.x, nl.y, nl.z], dtype=np.float32)

def getLM(results):
    return [NormalizedLandmark2Array(lm) for lm in results.multi_hand_landmarks[0].landmark]

def getFirstFingerPts(lms):
    return [lms[0], lms[5], lms[6], lms[7], lms[8]]

def computeOneFingerAngle(pts):
    # len(pts) == 5
    rads = list()
    va = np.array(pts[1]) - np.array(pts[0])
    unitVa = np.array(va) / np.linalg.norm(va)
    for i in range(1, 4):
        vb = np.array(pts[i+1]) - np.array(pts[i])
        unitVb = np.array(vb) / np.linalg.norm(vb)
        product = np.dot(unitVa, unitVb)
        rad = np.arccos(product)
        rads.append(rad)

        unitVa = unitVb
    return np.degrees(rads)

def writeTextOnTop(img, content):
    global w, h
    cv2.putText(img, str(content), (w//4, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 1, cv2.LINE_AA)
    return img

cap = cv2.VideoCapture(0)
w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

lms = list()
print("=====Start!!=====")
with mp_hands.Hands(
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5) as hands:
    while cap.isOpened():
        success, img = cap.read()
        if not success:
            print("ignoring empty camera frame...")
            continue  # ignoring empty camera frame
        
        # flip for selfie-view display
        img = cv2.cvtColor(cv2.flip(img, 1), cv2.COLOR_BGR2RGB)
        # img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img.flags.writeable = False  # improve performance
        results = hands.process(img)  # main process!!!!!
        img.flags.writeable = True  # for drawing
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(
                    img, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            lms = getLM(results)
            img = writeTextOnTop(img, computeOneFingerAngle(getFirstFingerPts(lms)))
        cv2.imshow("MediaPipe Hands", img)

        
        key = cv2.waitKey(5) & 0xFF
        if key == 27:  # ESC
            break
        if key == ord('c'):  
            print("C")
            if results.multi_hand_landmarks:
                lms = getLM(results)
                print(computeOneFingerAngle(getFirstFingerPts(lms)))
            else:
                print("no result!!")

# print('[')
# for lm in (lms[0], lms[5], lms[9], lms[13], lms[17]):
#     print("\t[{}, {}, {}],".format(lm.x, lm.y, lm.z))
# print(']')
# print("Done")
# cap.release()


# import matplotlib.pyplot as plt
# fig = plt.figure()
# ax = fig.add_subplot(111, projection='3d')
# xs = [lm.x for lm in lms]
# ys = [lm.y for lm in lms]
# zs = [lm.z for lm in lms]
# ax.scatter(xs,ys,zs)
# plt.show()

