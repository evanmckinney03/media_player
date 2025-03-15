import json
import os

def execute(body, query):
    success = True
    location = 'json/ids.json'
    message = '';
    #determine if body has passed in tag/s or id/s or both to remove 
    try:
        ids_to_remove = body['ids']
        if isinstance(ids_to_remove, str):
            ids_to_remove = [ids_to_remove]
        id_file = open('json/ids.json', 'r+')
        current_ids = json.load(id_file)
        #try to open tags.json
        current_tags = None
        tag_file = None
        try:
            tag_file = open('json/tags.json', 'r+')
            current_tags = json.load(tag_file)
        except:
            #there is a chance there are no tags but still trying to remove ids
            pass
        try:
            for i in ids_to_remove:
                #see if there are any tags to remove
                tags = current_ids[i]['tags']
                #also need to remove the ids from tags.json
                if len(tags) > 0 and current_tags is None:
                    success = False
                    message = 'Unable to open tags.json'
                    break
                for tag in tags:
                    current_tags[tag]['ids'].remove(i)
                #when removing an id, also need to move the associated video to deleted_vids folder
                os.makedirs('deleted_vids', exist_ok=True);
                if(os.path.exists('videos/' + i)):
                    os.rename('videos/' + i, 'deleted_vids/' + current_ids[i]['title'] + os.path.splitext(i)[1]);
                #also delete the thumbnail
                if(os.path.exists(current_ids[i]['thumbnail-url'])):
                    os.remove(current_ids[i]['thumbnail-url']);
                del current_ids[i]
            #write back to files
            id_file.seek(0)
            json.dump(current_ids, id_file)
            id_file.truncate()
            if tag_file is not None:
                tag_file.seek(0)
                json.dump(current_tags, tag_file)
                tag_file.truncate()
            #successfully removed ids
            success = True
        except KeyError:
            #cannot find the id to remove
            success = False
            message = 'Unable to find the id to remove'

    except KeyError:
        #there are no ids, try the tags next
        location = 'json/tags.json'
        pass

    except (FileNotFoundError, json.JSONDecodeError):
        #cannot open the 'json/ids.json'
        success = False
        message = 'There are no tags to remove'

    try:
        tags_to_remove = body['tags']
        if isinstance(tags_to_remove, str):
            tags_to_remove = [tags_to_remove]
        #open both ids and tags.json
        id_file = open('json/ids.json', 'r+')
        tag_file = open('json/tags.json', 'r+')
        current_ids = json.load(id_file)
        current_tags = json.load(tag_file)
        try:
            for t in tags_to_remove:
                #see the ids that correspond to the tag
                ids = current_tags[t]['ids']
                for i in ids:
                    current_ids[i]['tags'].remove(t)
                del current_tags[t]
        except KeyError:
            success = False
            message = 'Cannot find tag to remove'
        #write back to files
        id_file.seek(0)
        json.dump(current_ids, id_file)
        id_file.truncate()
        tag_file.seek(0)
        json.dump(current_tags, tag_file)
        tag_file.truncate()
    except (FileNotFoundError, json.JSONDecodeError):
        success = False
        message = 'Unable to open file'
    except KeyError:
        #there are no tags, so just move on
        pass
    return success, location, message


