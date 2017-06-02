from billboard import billboard
from macros import macros
from websocket import websocket
import logging

logging.basicConfig()

#create a billboard instance on a given set of ouput pins
billboard = billboard([5,6,13,19,26,12,16,20])

#create a macro instance (billboard instance, macro path, min command wait time)
macros = macros(billboard, "/../../macros/", 0.00386)
 
#create a websocket instance
websocket = websocket()


#handler for a message action
def message(data):
  message = data.get("message", "")
  websocket.send_data({'action':'message', 'client_name':"Client %d" % data['client']['id'], 'message':message})

websocket.register_action('message', message)


#handler for a billboard command action
def command (data):
  if(check_fields(['command'], data)):
    command = data['command']
    if (billboard.validate_command(command)):
      billboard.output_command(command)
      websocket.send_data({'action':'command', 'client_name':"Client %d" % data['client']['id'], 'command':command})
    else:
      report_error(data['client'], '"%s" is an invalid billboard command' % command)

websocket.register_action('command', command)


#handler for a macro list action
def get_macro_list(data):
  macro_list = macros.get_macro_list()
  websocket.send_data({'action':'macro_list', 'client_name':"Client %d" % data['client']['id'], 'macro_list':macro_list}, data['client'])

websocket.register_action('get_macro_list', get_macro_list)


#handler for play macro action
def play_macro(data):
  if(check_fields(['macro_name','loops','loop_forever'], data)):
    macros.load_macro(data['macro_name'], int(data['loops']), int(data['loop_forever']))
    websocket.send_data({'action':'play_macro','client_name':"Client %d" % data['client']['id'], 'macro_name':data['macro_name']})

websocket.register_action('play_macro', play_macro)


#handler for pause macro action
def pause_macro(data):
  macros.pause_macro()
  websocket.send_data({'action':'pause_macro', 'client_name':"Client %d" % data['client']['id']})
  
websocket.register_action('pause_macro', pause_macro)


#handler for resume macro action
def resume_macro(data):
  macros.resume_macro()
  websocket.send_data({'action':'resumed_macro', 'client_name':"Client %d" % data['client']['id']})

websocket.register_action('resume_macro', resume_macro)


#handler for get macro steps action
def get_macro_steps (data):
  if(check_fields(['macro_name'], data)):
    macro_steps = macros.get_steps(data['macro_name'])
    websocket.send_data({'action':'macro_steps', 'client_name':"Client %d" % data['client']['id'], 'macro_name':data['macro_name'], 'macro_steps':macro_steps}, data['client'])

websocket.register_action('get_macro_steps', get_macro_steps)


#handler for get macro state action
def get_macro_state (data):
  macro_state = macros.get_macro_state()
  websocket.send_data({'action':'macro_state', 'client_name':"Client %d" % data['client']['id'], 'macro_state':macro_state}, data['client'])
  
websocket.register_action('get_macro_state', get_macro_state)


#handler for save macro action
def save_macro (data):
  if(check_fields(['macro_name','macro_steps'], data)):
    macros.save_macro(data['macro_name'], data['macro_steps'])
    websocket.send_data({'action':'macro_saved', 'client_name':"Client %d" % data['client']['id'],  'macro_name':data['macro_name']})

websocket.register_action('save_macro', save_macro)


#handler for delete macro action
def delete_macro (data):
  if(check_fields(['macro_name'], data)):
    macros.delete_macro(data['macro_name'])
    websocket.send_data({'action':'macro_deleted', 'client_name':"Client %d" % data['client']['id'],  'macro_name':data['macro_name']})

websocket.register_action('delete_macro', delete_macro)

#handler for test macro action
def test_macro (data):
  if(check_fields(['macro_steps'], data)):
    macros.test_macro(data['macro_steps'])
    websocket.send_data({'action':'play_macro','client_name':"Client %d" % data['client']['id'], 'macro_name':'[WIP Macro]'})

websocket.register_action('test_macro', test_macro)


#handler for the end of a macro
def macro_end():
  data = {'action':'macro_ended', 'client_name':'server'}
  websocket.send_data(data)

macros.register_macro_end_callback(macro_end)


#validates that the required data is included in the data dictionary
def check_fields(reqd_fields, data):
  for field in reqd_fields:
    valid = data.get(field, 'invalid')
    if(valid == 'invalid'):
      client = data.get('client', None)
      report_error(client, "%s is required for this action" % field)
      return False
  return True


#handles a validation error
def report_error(client, message):
  data = {'action':'message', 'client_name':'server', 'message':message}
  websocket.send_data(data, client)
  print('error: '+message)
  
macros.register_error_callback(report_error)


# start the websocket service
#this must run last as no code will be processed after this
websocket.start_server()