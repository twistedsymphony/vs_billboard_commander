# Vs Billboard Functions
# Michael Pica (twistedsymphony) 2016-2017
# 
# These functions handle output to the Vs Billboard

import pigpio # http://abyz.co.uk/rpi/pigpio/python.html

class billboard(object):
  name = 'vs_billboard'
  _billboard_pins = []
  _pi = None
  _bit_mask = 0
  
  def __init__(self, billboard_pins, name=None):
    #set billboard control pins: 0,1,2,3,4,5,6,7
    self._billboard_pins = billboard_pins
    
    #set name
    if(name !=None):
      self.name = name
    
    #init pigpio
    self._pi = pigpio.pi()
    
    #setup output pins and build bit mask
    self._bit_mask = 0
    for pin in self._billboard_pins:
      self._pi.set_mode(pin, pigpio.OUTPUT) # Set all used control pins as outputs
      self._bit_mask |= (1<<pin) #build a bit mask for the output pins

  
  #outputs a billboard command
  '''
    AFAIK most GPIO libraries force you to set 1 pin at at time, which is
    too slow for the billboard, as it will interpret the current value at 
    each individual pin change as a new command. the PIGPIO library allows us to set 
    all 8-bits in only 2 commands (setting of the 1s and setting of the 0s)
    thankfully command 255 (0xFF) is ignored by the billboard, so we can set
    all 8-bits to 1, which the billboard sees as a command then ignores. Then 
    we clear the bits necessary for the actual command which the billboard will
    run normally. This way there are no false-reads while building the output
  '''
  def output_command(self, command_number):
    command_number = int(command_number)
    command_bits = [(command_number >> bit) & 1 for bit in range(7, -1, -1)] #create array of bits
    clear_mask = 0
    set_mask = 0
    pin=7
    for bit in command_bits:
      if(bit):
        set_mask |= (1<<self._billboard_pins[pin])
      else:
        clear_mask |= (1<<self._billboard_pins[pin])
      pin -=1
    self._pi.set_bank_1(self._bit_mask) #set all output bits to 1
    self._pi.clear_bank_1(clear_mask) #clear just those bits that should be 0


  #validates that a command is a positive 8-bit integer
  def validate_command(self, command_number):
    if(command_number.isdigit() != True):
      return False
    if(int(command_number) > 255):
      return False
    return True