#!/usr/bin/env bash

ln -sf $(pwd)/websocket_server.socket /etc/systemd/system/websocket_server.socket
ln -sf $(pwd)/websocket_server.service /etc/systemd/system/websocket_server.service
systemctl enable websocket_server@{1}.socket websocket_server@{1}.service
# the .service will automagically trigger from the socket
systemctl start websocket_server@{1}.socket

