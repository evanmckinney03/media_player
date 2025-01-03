global cv2
import cv2
global numbers
import numbers
import os

success = True
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
    id_file = open('json/ids.json', 'r+')
    current_ids = json.loads(id_file.read())
    try:
        ids = body['ids']
        if isinstance(ids, str):
            ids = [ids]
    except:
        #if there are no ids given, instead generate thumbnails for all ids that don't have one yet
        thumbnails = os.listdir('thumbnails')
        #remove the file extensions
        thumbnails = [t.split('.')[0].split('-')[0] for t in thumbnails]
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
            url = 'thumbnails/' + i.split('.')[0] + '-' + str(int(cam.get(cv2.CAP_PROP_POS_FRAMES))) + '.jpg'
            cv2.imwrite(url, frame)
            cam.release()
            #delete the old thumbnail
            old_url = current_ids[i]['thumbnail-url']
            if(len(old_url) > 0):
                os.remove(old_url)
            current_ids[i]['thumbnail-url'] = url
        except:
            message += 'Unable to generate thumbnail for id ' + i + '\n'
            success = False
    cv2.destroyAllWindows()
    #write current_ids to ids.json
    id_file.seek(0)
    json.dump(current_ids, id_file)
    id_file.truncate()
    id_file.close()

except (KeyError, FileNotFoundError):
    #if no ids
    success = False
    message = 'Malformed body. Must be in form ids:<ids> timestamp:<timestamps>'

