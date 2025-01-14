global cv2
import cv2
global numbers
import numbers
import os
global math
import math

success = True
location = 'json/ids.json'
message = ''

def resize(image):
    height = image.shape[0]
    width = image.shape[1]
    if(height == 1080 and width == 1920):
        return image
    scale = 1080 / height if height > width else 1920 / width
    new_image = cv2.resize(image, None, fx= scale, fy=scale, interpolation = cv2.INTER_CUBIC)
    new_height = new_image.shape[0]
    new_width = new_image.shape[1]
    if(new_height > new_width):
        #need to add black bars to left and right
        left = math.ceil((1920 - new_width) / 2);
        right = math.floor((1920 - new_width) / 2);
        return cv2.copyMakeBorder(new_image, 0, 0, left, right, cv2.BORDER_CONSTANT, value = [0, 0, 0])
    else:
        #need to add black bars to top and bottom
        top = math.ceil((1080 - new_height) / 2);
        bottom = math.floor((1080 - new_height) / 2);
        return cv2.copyMakeBorder(new_image, top, bottom, 0, 0, cv2.BORDER_CONSTANT, value = [0, 0, 0])

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
            old_url = current_ids[i]['thumbnail-url']
            if(len(old_url) > 0):
                #there is a url, but something happened to the thumbnail
                #split by - then get rid of file extenstion
                cam.set(cv2.CAP_PROP_POS_FRAMES, int(old_url.split('-')[1][:-4]))
            else:
                cam.set(cv2.CAP_PROP_POS_MSEC, int(time))
            success, frame = cam.read()
            url = 'thumbnails/' + i.split('.')[0] + '-' + str(int(cam.get(cv2.CAP_PROP_POS_FRAMES))) + '.jpg'
            image = resize(frame)
            cv2.imwrite(url, image)
            cam.release()
            #delete the old thumbnail
            if(os.path.exists(old_url) and old_url != url):
                os.remove(old_url)
            current_ids[i]['thumbnail-url'] = url
        except Exception as e:
            print(e)
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

