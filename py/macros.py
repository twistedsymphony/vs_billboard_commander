# Vs Billboard Macro Functions
# Michael Pica (twistedsymphony) 2016-2017
# 
# Handles loading, unloading and running of billboard command macros
import json
import os
from threading import Timer

class macros(object):
  _macro_path = '/'
  
  _billboard = None
  
  #setup min wait time between commands
  #this is dependant on the vs billboard PCB
  _min_wait_time = 0.00386

  #create macro globals
  _macro_state = 'ended'
  _macro_loop_forever = 0
  _macro_loop_count = 0
  _macro_loops = 0
  _macro_step = 0
  _macro = []
  _macro_end_callback = None
  _error_callback = None
  
  def __init__(self, billboard, macro_path=None, min_wait_time=None):
    #setup the billboard connection
    self._billboard = billboard
    
    #set the path to the macros
    self._macro_path = os.path.abspath(__file__ + macro_path)+'/'
    
    #adjust the min_wait_time if provided
    if(min_wait_time !=None):
      if(min_wait_time > 0):
        self._min_wait_time = min_wait_time
        
    #register macro timer
    self._macro_timer = Timer(self._min_wait_time, self._step_macro)
    self._macro_timer.cancel()

  
  #registers the macro error handler
  def register_error_callback (self, error_callback):
    self._error_callback = error_callback
  
  
  #registers the end macro handler
  def register_macro_end_callback(self, macro_end_callback):
    self._macro_end_callback = macro_end_callback

  
  #returns a list of all macros in the macro folder
  def get_macro_list(self):
    macros = []
    for file in sorted(os.listdir(self._macro_path)):
      if file.endswith(".json"):
        macros.append(file)
    return macros
  
  
  #returns the current macro state
  def get_macro_state(self):
    return self._macro_state
  
  
  #returns the content of a given macro
  def get_steps(self, macro_name):
    file_name = self._macro_path+macro_name+'.json'
    if(os.path.isfile(file_name)):
      try:
        with open(file_name) as macro_file:
          return json.load(macro_file)
      except ValueError, e:
        self._macro_error('unable to open macro:'+file_name)
        return False
    else:
      self._macro_error('cannot find file:'+file_name)
      return False

  
  #loads a json macro
  def load_macro(self, macro_name, loops, loop_forever):
    self.clear_macro()
    macro_steps = self.get_steps(macro_name)
    if(macro_steps == False):
      self._macro_error('unable to load macro:'+file_name)
      return
    self._macro = macro_steps
    self._macro_step = 0
    self._macro_loops = loops
    self._macro_loop_forever = loop_forever
    self._macro_state = 'running'
    self._step_macro()
  
  
  #test a json macro
  def test_macro(self, macro_steps):
    self.clear_macro()
    if(not self.validate_macro(macro_steps)):
      self._macro_error('"[WIP Macro]" is not a valid macro.')
      return
    self._macro = macro_steps
    self._macro_step = 0
    self._macro_loops = 1
    self._macro_loop_forever = 0
    self._macro_state = 'running'
    self._step_macro()


  #runs the next step in a macro
  def _step_macro(self):
    if(self._macro_state != 'running'):
      return
    if(self._macro_step >= len(self._macro)):
      self._macro_loop_count = self._macro_loop_count+1
      self._macro_step = 0
      if(self._macro_loop_forever != 1):
        if(self._macro_loop_count >= self._macro_loops):
          self._end_macro()
          return
    self._billboard.output_command(self._macro[self._macro_step]['c'])
    macro_time = self._min_wait_time
    if(float(self._macro[self._macro_step]['t']) > macro_time):
      macro_time = float(self._macro[self._macro_step]['t'])
    self._macro_step += 1
    self._macro_timer = Timer(macro_time, self._step_macro)
    self._macro_timer.start()


  #runs once a macro reaches it's loop count
  def _end_macro(self):
    self.clear_macro()
    if self._macro_end_callback is not None:
      self._macro_end_callback()
  
  
  #pauses a macro
  def pause_macro(self):
    self._macro_timer.cancel()
    self._macro_state = 'paused'


  #resumes a paused macro by running the next step immediately
  def resume_macro(self):
    self._macro_state = 'running'
    self._step_macro()


  #resets all macro variables
  def clear_macro(self):
    self._macro_state = 'ended'
    self._macro_timer.cancel()
    self._macro_loop_forever = 0
    self._macro_loop_count = 0
    self._macro_loops = 0
    self._macro_step = 0
    self._macro = []

  
  #checks if a macro is valid
  def validate_macro(self, macro):
    #TODO: for now just return True
    #this is already being handled in js on the client side anyway
    return True
  
  
  #makes a given string filename safe
  def clean_filename(self, filename):
    #TODO: for now just return the given filename
    #this is already being handled in js on the client side anyway
    return filename
  
  
  #saves a macro as a file
  def save_macro(self, macro_name, macro_steps):
    macro_name = self.clean_filename(macro_name)
    
    if(macro_name in ('clear')):
      self._macro_error('"'+macro_name+'" is is a reserved macro and cannot be changed.')
      return
    if(not self.validate_macro(macro_steps)):
      self._macro_error('"'+macro_name+'" is not a valid macro.')
      return
    
    file_content = json.dumps(macro_steps)
    file_name = self._macro_path+macro_name+'.json'
    file = open(file_name,"w")
    file.write(file_content)
    file.close()
  
  
  #deletes a specified macro file
  def delete_macro(self, macro_name):
    clean_macro_name = self.clean_filename(macro_name)
    
    if(clean_macro_name != macro_name):
      self._macro_error('"'+macro_name+'" is not a valid macro name.')
      return
    if(macro_name in ('clear')):
      self._macro_error('"'+macro_name+'" is a reserved macro and cannot be deleted.')
      return
    
    file_name = self._macro_path+macro_name+'.json'
    os.remove(file_name)
  
  
  #calls the error callback
  def _macro_error(self, message):
    if self._error_callback is not None:
      self._error_callback(None, message)