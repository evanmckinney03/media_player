# Media Player
A client and server size media player for personal use</br>

## Features
An extension of the Python HTTP server to host video files and a custom client to communicate with the server. </br>
### Client
Each video has a title that can be changed and doesn't have to be unique </br>
Videos can also be given custom tags to help with finding a specific video </br>
Users can search through videos by either title or tag </br>
Each video also has its own thumbnail image that can be changed to be any part of the video </br>
Users can delete videos </br>

### Server 
Any video placed into the videos folder will be given a unique ID so that the titles do not have to be unique </br>
Thumbnails will be created and placed into the thumbnails folder. The default thumbnail is the first frame of the video </br>
Currently only supports .mp4 videos </br>
Metadata about the videos such as title and tags will be created and placed into the json folder. Data is stored in the json format to make transfer of data between server and client as simple as possible </br>
When a user deletes a video, the video will be moved into a deleted videos directory. If a video is accidentally deleted, it can simply be placed back into the videos folder </br> 

### Tutorial
Download either the Windows or Linux zip depending on the operating system of the server you plan to host the videos on.In the zip there is an executable file (.exe on Windows, no file ext on linux) along with the HTML, CSS, and JavaScript files for the client. </br>

When running the server, it will open on port 8000 by default. A command line argument can be provided to override the default port. Do do this on windows, the command prompt must be used. </br>

To connect to the media player, open your browser. If the server is running on the same computer that you wish to use the client on, then localhost:\<port-number\> will connect to the server. Otherwise, the IP address of the computer running the must be used instead of localhost. Make sure that the firewall of the server computer allows for traffic through the port number if you want other computers on the same network to be able to connect to it. As explained in the security section, do not open this server to the wider internet by port forwarding. </br>

After connecting to the media player for the first time, necessary folders like videos/ and json/ will be created. To add a video to the server, put the .mp4 file into the videos/ folder and the server will process it automatically. 

### Demo
In the demo folder, there are a few example videos and some json files. The json files include metadata like titles and tags for the demo videos. This is to provide an example state of the media server if you would like to simply toy around with the features. To use it, simply copy the files into the json and videos folder on the server.</br>

# Security
There are no security considerations, so do not use for anything other than a personal network. The media player assumes that everyone on your network can be trusted and will not act maliciously. If you aren't 100% sure that this is true for your case, then do not use this.</br>


