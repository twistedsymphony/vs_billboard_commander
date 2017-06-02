var ws; //websocket
var console_odd=0; //odd even tracker for console
var macro_status = 'ended';
var macro_list = [];

$(document).ready(function() {
  initialize_websocket("ws://vs_billboard:9001/");
  
  initialize_commander();
  initialize_editor();
});


/* switches from one currently open JQM popup to another */
$.mobile.switchPopup = function(sourceElement, destinationElement, onswitched) {
  var afterClose = function() {
    destinationElement.popup('open');
    sourceElement.off("popupafterclose", afterClose);

    if (onswitched && typeof onswitched === "function"){
      onswitched();
    }
  };

  sourceElement.on("popupafterclose", afterClose);
  sourceElement.popup('close');
};


/*closes any open JQM popups and opens a new popup */
$.mobile.openPopup = function(destinationElement){
  var active_popup = null;
  $('.ui-popup-active').each(function() {
    active_popup = $('#'+this.id).children()[0].id;
  });
  if(active_popup == null){
    destinationElement.popup('open');
  } else{
    $.mobile.switchPopup($('#'+active_popup),destinationElement);
  }
};


/* closes any open JQM popups */
$.mobile.closePopup = function(){
  var active_popup = null;
  $('.ui-popup-active').each(function() {
    active_popup = $('#'+this.id).children()[0].id;
  });
  if(active_popup != null){
    $('#'+active_popup).popup('close');
  }
}


/* build select box options for available commands */
function build_command_options(id, empty_text){
  //clear all options
  $('#'+id).html('');
  
  //add blank option
  $('#'+id).append($('<option/>', { 
    value: '',
    text : empty_text+'...' 
  }));
  
  //add billboard commands
  $.each(commands, function (index, value) {
    $('#'+id).append($('<option/>', { 
      value: index,
      text : index+': '+value.desc 
    }));
  });
  
  //set default option
  $('#'+id).val($('#target option:first').val()).change();
  return;
}


/* build select box options for available macros */
function build_macro_options(id){
  //clear all options
  $('#'+id).html('');
  
  //add blank option
  $('#'+id).append($('<option/>', { 
    value: '',
    text : 'select a macro...' 
  }));
  
  //add macros
  $.each(macro_list, function (index, value) {
    macro_name = value.substring(0, value.length - 5);
    $('#'+id).append($('<option/>', { 
      value: macro_name,
      text : index+': '+macro_name 
    }));
  });
  
  //set default option
  $('#'+id).val($('#target option:first').val()).change(); 
  return;
}


/* returns true if macro name already exists */
function check_if_macro_exists(macro_name){
  if($.inArray(macro_name, macro_list) == -1){
    return false;
  }
  return true;
}


/* initialize websocket and build handlers */
function initialize_websocket(url) {

  // Connect to Web Socket
  ws = new WebSocket(url);

  // Set connection handlers.
  ws.onopen = function() {
    console_write('<span class="console_alert">&lt;connection to billboard server initialized&gt;</span>');
    websocket_send({action: 'get_macro_list'});
    websocket_send({action: 'get_macro_state'});
  };
  ws.onclose = function() {
    console_write('<span class="console_alert">&lt;connection to billboard server closed&gt;</span>');
  };
  ws.onerror = function(e) {
    console_write('<span class="console_alert">&lt;billboard server connection error&gt;</span>');
    console.log(e)
  };
  
  // handle incomming data
  ws.onmessage = function(e) {
    console.log(e);
    var data = JSON.parse(e.data);
    switch(data.action){
      case 'command':
        message = "*ran command "+data.command+": "+commands[data.command].desc;
        break;
      case 'client_action':
        message = "*"+data.client_action+"*";
        break;
      case 'message':
        message = data.message;
        break;
      case 'macro_list':
        macro_list = data.macro_list;
        build_macro_options('macro_select');
        build_macro_options('open_macro_select');
        return; //no output
        break;
      case 'macro_saved':
        var macro_name = data.macro_name+'.json';
        if(!check_if_macro_exists(macro_name)){
          macro_list.push(macro_name); //add new macro to list
          //rebuild selections
          build_macro_options('macro_select');
          build_macro_options('open_macro_select');
        }
        macro_dirty = false;
        message = "*saved macro '"+data.macro_name+"'*";
        break;
      case 'macro_deleted':
        macro_list = macro_list.filter(function(e) { return e !== data.macro_name+'.json' });
        build_macro_options('macro_select');
        build_macro_options('open_macro_select');
        macro_dirty = false;
        file_menu_new(true);
        message = "*deleted macro '"+data.macro_name+"'*";
        break;
      case 'macro_state':
        set_macro_state(data.macro_state);
        return; //no output
        break;
      case 'play_macro':
        set_macro_state('running');
        message = "*ran macro '"+data.macro_name+"'*";
        break;
      case 'pause_macro':
        set_macro_state('paused');
        message = "*paused macro*";
        break;
      case 'resumed_macro':
        set_macro_state('running');
        message = "*resumed macro*";
        break;
      case 'macro_ended':
        set_macro_state('ended');
        message = "*macro ended*";
        break;
      case 'macro_steps':
        message = "*loaded '"+data.macro_name+"' macro into editor*";
        open_macro(data.macro_name, data.macro_steps);
        break;
      default:
        message = "*unknown action: '"+data.action+"'*";
        break;
    }
    console_write('<span class="console_message_from">['+data.client_name+']:</span> <span class="console_message_text">'+message+'</span>');
  };
}


/* re-configure the ui based on the given macro state */
function set_macro_state(state){
  switch(state){
    default:
    case 'ended':
      macro_state = 'ended';
      $('#pause_macro_button').val('pause').button('refresh');
      $('#pause_macro_button').button('disable');
      break;
    case 'paused':
      macro_state = 'paused';
      $('#pause_macro_button').val('resume').button('refresh');
      $('#pause_macro_button').button('enable');
      break;
    case 'running':
      macro_state = 'running';
      $('#pause_macro_button').val('pause').button('refresh');
      $('#pause_macro_button').button('enable');
      break;
  }
}


/* sends a message to the websocket */
function websocket_send(data_obj){
  var json = JSON.stringify(data_obj);
  ws.send(json);
}


/* adds an entry to the console */
function console_write(message){
  var odd_class = 'console_even';
  if(console_odd ==0){
    var odd_class = 'console_odd';
    console_odd =1;
  }
  var dt = new Date();
  var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
  var console_text = $('#console').html();
  console_text = '<div class="'+odd_class+'"><span class="console_time">'+time+'</span> <span class="console_message">'+message+'</span><br>'+console_text+'</div>';
  if((console_text.match(/<div>/g) || []).length > 99){
    console_text = console_text.substr(0, console_text.lastIndexOf('<div>'));
  }
  
  $('#console').html(console_text);
}


/* create a plain text file for download */
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}