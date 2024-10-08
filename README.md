# OneSecond v.Alpha

* Authors: joelathrop, domspinn
* Alpha Test Publish Date:

## Overview
A game to guess your Apple Music library one second at a time. Pick from your
entire library or just a playlist. The brainchild of Joe Lathrop brought to you with 
the creative vision of Dominic Spinnato.

## About the Game
This game was inspired by Heardle, a now discontinued game in which you try to guess
a random daily song in one second. If you can't get it in one second, you get more time,
repeating until about 6 guesses. OneSecond takes this concept and applies it to your
downloaded songs. You downloaded them, how well do you know them?

You can choose to play in normal or challenge mode. Normal mode allows up to 10 seconds of skip time,
and unlimited guesses to try to get the song. Challenge mode only allows one skip, which brings you to 
3 seconds, and you have one chance to get it right. 

At the end of the game, you will see your stats displayed, along with a list of the songs you got
incorrect. 

## Compilation and Running
Run locally:
```node server.js```

Run with podman: </br>
```podman build -t <applicationName> .``` </br>
```podman run -d -p <port>:<port> <applicationName>```
* On the ec2 instance, the port:port maps the port you want to run it on 
to the port the application is expecting. This is defined in the Dockerfile,
it should be port 3000. 

See podman processes: ```podman ps``` </br>
Stop: ```podman stop <container_id_or_name>``` </br>
Force stop: ```podman stop -t 0 <container_id_or_name>```

If you're having those ubuntu problems run podman machine init and then podman machine start

How to find ec2 instance in browser:
https://`<ec2-public-ip>`:`<port>`

## References
Apple Music API Documentation
* https://developer.apple.com/documentation/applemusicapi <br>



