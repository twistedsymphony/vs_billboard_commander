
function initialize_commander(){
  
  build_command_options('command_select', 'send a command');
  
  // message box handler
  $(document).on("keypress", "#message_box", function(e) {
    if(e.which == 13) {
      websocket_send({
        action: 'message',
        message: $('#message_box').val()
      });
      $('#message_box').val(''); //clear the text box
      $('#message_box').focus(); //refocus on the text box
      return false; // prevent the button click from happening
    }
  });
  
  //command box handler
  $('#command_select').on("change", function(e) {
    var command = $('#command_select').val();
    if(command != ""){
      websocket_send({
        action: "command",
        command: command
      });
      $('#command_select').val($('#target option:first').val()).change(); //clear the selection
    }
  });
  
  //loop ui functionality
  $('#macro_loop_forever').on("change", function(e) {
    var loop_forever = $('#macro_loop_forever').val();
    if(loop_forever == 1){
      $('#macro_loops').prop('disabled', true);
      $('#macro_loops').val("");
    } else {
      $('#macro_loops').prop('disabled', false);
      $('#macro_loops').val(1);
    }
  });
  
  $('#macro_loops').on("change keyup mouseup", function(e) {
    var loops = $('#macro_loops').val();
    if(loops<1 && loops != ""){
      $('#macro_loops').val(1);
    }
  });
  
  $('#macro_loops').on("blur keyup mouseup", function(e) {
    if($('#macro_loops').val() == ""){
      $('#macro_loops').val(1);
    }
  });
  
  $('#play_macro_button').click(function(){
    var loops = $('#macro_loops').val();
    if(loops == ''){
      loops = 0;
    }
    websocket_send({
      action: 'play_macro',
      macro_name: $('#macro_select').val(),
      loops: parseInt(loops),
      loop_forever: parseInt($('#macro_loop_forever').val())
    });
  });
  
  $('#pause_macro_button').click(function(){
    var action = 'pause_macro';
    if(macro_state == 'paused'){
      action = 'resume_macro';
    }
    websocket_send({action: action});
  });
  
  $('#clear_macro_button').click(function(){
    websocket_send({
      action: 'play_macro',
      macro_name: 'clear',
      loops: 1,
      loop_forever: 0
    });
  });
  
  $('#macro_editor_button').click(function(){
    $('#commander').hide();
    $('#macro_editor').show();
  });
}