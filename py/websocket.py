# Vs Billboard Command Server
# Michael Pica (twistedsymphony) 2016-2017
# 
# This program creates a web-socket server that can accecpt commands from a 
# browser. It then outputs these commands to the appropriate pins to communicate 
# with a Sega Vs Billboard PCB. It can also manage pre-stored "macro" programs

import json
from websocket_server import WebsocketServer

class websocket(object):

  def __init__(self):
    self._actions = {}
    self._server = WebsocketServer(9001, host='0.0.0.0')
    self._server.set_fn_new_client(self._new_client)
    self._server.set_fn_client_left(self._client_left)
    self._server.set_fn_message_received(self._message_received)
  
  #start the server
  def start_server(self):
    self._server.run_forever()

  
  # Called for every client connecting (after handshake)
  def _new_client(self, client, server):
    self.send_data({'action':'client_action', 'client_name':"Client %d" % client['id'], 'client_action':"connected to server"})

  
  # Called for every client disconnecting
  def _client_left(self, client, server):
    self.send_data({'action':'client_action', 'client_name':"Client %d" % client['id'], 'client_action':"disconnected from server"})
  
  
  # Called when a client sends a message
  def _message_received(self, client, server, message_json):
    data = {}
    action = None
    
    #extract parameters from response
    try:
      data = json.loads(message_json)
    except ValueError, e:
      #self._report_error(client, e.message)
      return
      
    #perform action if necessary
    if 'action' in data:
      action = data['action']
      del data['action']
      data['client'] = client 
      data['server'] = server
      self._perform_action(action, data)
  
  
  def send_data(self, data, client=None):
    json_out = json.dumps(data)
    if(client==None):
      self._server.send_message_to_all(json_out)
    else:
      self._server.send_message(client, json_out)
    print(json_out)
    return

  
  #adds an action that can be performed when receiving a message
  def register_action(self, action_name, action_function):
    self._actions[action_name] = action_function
    print("registering action %s" % (action_name))
  
  
  #removes a message that can be performed when receiving a message
  def unregister_action(self, action_name):
    if action_name in self._actions: 
      del self._actions[action_name]
  
  
  #calls a registered action if available
  def _perform_action(self, action_name, data = None):
    if action_name in self._actions:
      print("performing action %s" % (action_name))
      self._actions[action_name](data)
    else:
      print("error %s is not a registered action" % (action_name))
      print self._actions
  