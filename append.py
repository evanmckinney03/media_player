import json

try:
    with open('data.json', 'r+') as file:
        # add to the json file
        data = json.loads(file.read())
        new_data = json.loads(body)
        data.update(new_data)
        file.seek(0)
        json.dump(data, file)
        file.close()
except FileNotFoundError:
    #Create the file
    with open('data.json', 'w+') as file:
        file.write(body)
        file.close()

wrote_to = 'data.json'
