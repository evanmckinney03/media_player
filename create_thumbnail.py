global cv2
import cv2
global numbers
import numbers
import os

success = False
location = 'json/ids.json'
message = ''
try:
    ids = body['ids']
    if isinstance(ids, str):
        ids = [ids]
    times = None
    try:
        times = body['timestamps']
        if isinstance(times, numbers.Number):
            times = [times]
    except KeyError:
        pass
    print(times)
    for idx, i in enumerate(ids):
        time = 0
        try:
            time = times[idx]
        except:
            pass
        try:
            cam = cv2.VideoCapture('videos/' + i)
            cam.set(cv2.CAP_PROP_POS_MSEC, time)
            success, frame = cam.read()
            cv2.imwrite('thumbnails/' + i.split('.')[0] + '.jpg', frame)
            cam.release()
            success = True
        except:
            message += 'Unable to generate thumbnail for id ' + i + '\n'
    cv2.destroyAllWindows()
    
except KeyError:
    #if no ids
    success = False
    message = 'Malformed body. Must be in form ids:<ids> timestamp:<timestamps>'

