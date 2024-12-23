global cv2
import cv2
global numbers
import numbers
import os

success = False
location = 'json/ids.json'
message = ''
try:
    times = None
    try:
        times = body['timestamps']
        if isinstance(times, numbers.Number):
            times = [times]
    except KeyError:
        pass
    ids = None
    try:
        ids = body['ids']
        if isinstance(ids, str):
            ids = [ids]
    except:
        #if there are no ids given, instead generate thumbnails for all ids that don't have one yet
        with open('json/ids.json', 'r+') as file:
            current_ids = json.loads(file.read())
            thumbnails = os.listdir('thumbnails')
            #remove the file extensions
            thumbnails = [t.split('.')[0] for t in thumbnails]
            temp_ids = [i.split('.')[0] for i in current_ids]
            ids = [i + '.mp4' for i in temp_ids if i not in thumbnails]
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
    
except (KeyError, FileNotFoundError):
    #if no ids
    success = False
    message = 'Malformed body. Must be in form ids:<ids> timestamp:<timestamps>'

