import json

try:
    with open('data.json', 'r+') as file:
        # DO
        print(file.read())
except FileNotFoundError:
    #Create the file
    with open('data.json', 'w+') as file:
        data = {
            "hello": "world"
        }
        json.dump(data, file)
