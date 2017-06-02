
/* editor globals */
var editor_macro_name = '';
var macro_dirty = false;
var macro_steps = [];
  
/* grid column config */
var macro_cols = [
  {
    headerName: "step",
    valueGetter: "node.childIndex",
    width: 40
  },{
    field: "c", 
    headerName: "command",
    valueGetter: "data.c+': '+commands[data.c].desc"
  },{
    field: "t", 
    headerName: "ms",
    width: 50, 
    editable: true
  }
];

/* the grid control object */
var gridOptions = {
    columnDefs: macro_cols,
    rowData: macro_steps,
    rowSelection: 'single',
    onSelectionChanged: show_step_menu
};


/* editor ui initialization */
function initialize_editor(){
  change_macro_name('');
  macro_dirty = false;
  
  $('#edit_step_form').popup();
  $('#name_macro').popup();
  build_command_options('edit_step_command', 'command to send');
  
  $('#editor_file_menu_new').click(function(){
    file_menu_new();
  });
  
  $('#editor_file_menu_open').click(function(){
    file_menu_open();
  });
  
  $('#open_macro_select').on("change", function(e) {
    var editor_macro_name = $('#open_macro_select').val();
    if(editor_macro_name != ""){
      websocket_send({
        action: "get_macro_steps",
        macro_name: editor_macro_name
      });
      $('#open_macro_select').val($('#target option:first').val()).change(); //clear the selection
      $.mobile.closePopup();
    }
  });
  
   $('#editor_file_menu_save').click(function(){
    file_menu_save();
  });
  
  $('#editor_file_menu_save_as').click(function(){
    file_menu_save_as();
  });
  
  $('#editor_file_menu_export').click(function(){
    file_menu_export();
  });
  
  $('#editor_file_menu_import').click(function(){
    file_menu_import();
  });
  
  $('#editor_file_menu_exit').click(function(){
    $.mobile.closePopup();
    $('#macro_editor').hide();
    $('#commander').show();
  });
  
  $('#editor_macro_menu_test').click(function(){
    macro_steps = get_steps();
    websocket_send({
      action: 'test_macro', 
      macro_steps: macro_steps
    });
    $.mobile.closePopup();
  });
  
  $('#editor_macro_menu_multiply').click(function(){
    $.mobile.openPopup($('#step_multiply_form'));
  });
  
  $('#step_multiply_form_cancel').click(function(){
    $.mobile.closePopup();
  });
  
  $('#step_multiply_form_save').click(function(){
    var operator = $('#step_multiply_operation_type').val();
    var factor = $('#step_multiply_factor').val();
    multiply_macro_steps(operator, factor);
    $.mobile.closePopup();
  });
  
  $('#editor_macro_menu_swap').click(function(){
    swap_macro_players();
    $.mobile.closePopup();
  });
  
  $('#editor_macro_menu_mirror').click(function(){
    mirror_macro_players();
    $.mobile.closePopup();
  });
  
  $('#editor_macro_menu_quick_text').click(function(){
    $.mobile.openPopup($('#quick_text_form'));
  });
  
  $('#quick_text_form_cancel').click(function(){
    $.mobile.closePopup();
  });
  
  $('#quick_text_form_save').click(function(){
    var text = $('#quick_text_text').val();
    var step_time = $('#quick_text_step_time').val();
    build_quick_text_macro(text, step_time);
    $.mobile.closePopup();
  });
  
  $('#editor_macro_menu_delete').click(function(){
    delete_macro();
  });
  
  $('#add_step_button').click(function(){
    macro_steps = get_steps();
    var seq = macro_steps.length;
    $('#edit_step_title').html('Insert Step at: '+seq);
    $('#edit_step_command').val('').selectmenu('refresh');
    $('#edit_step_time').val(0.1);
    $('#edit_step_action').val('insert');
    $('#edit_step_seq').val(seq);
    $.mobile.openPopup($('#edit_step_form'));
  });
   
  $('#step_menu_insert_above').click(function(){
    var node = gridOptions.api.getSelectedNodes();
    var seq = node[0].rowIndex;
    $('#edit_step_title').html('Insert Step at: '+seq);
    $('#edit_step_command').val('').selectmenu('refresh');
    $('#edit_step_time').val(0.1);
    $('#edit_step_action').val('insert');
    $('#edit_step_seq').val(seq);
    $.mobile.openPopup($('#edit_step_form'));
  });
  
  $('#step_menu_insert_below').click(function(){
    var node = gridOptions.api.getSelectedNodes();
    var seq = node[0].rowIndex+1;
    $('#edit_step_title').html('Insert Step at: '+seq);
    $('#edit_step_command').val('').selectmenu('refresh');
    $('#edit_step_time').val(0.1);
    $('#edit_step_action').val('insert');
    $('#edit_step_seq').val(seq);
    $.mobile.openPopup($('#edit_step_form'));
  });
  
  $('#step_menu_edit').click(function(){
    var node = gridOptions.api.getSelectedNodes();
    $('#edit_step_title').html('Edit Step #: '+node[0].id);
    $('#edit_step_command').val(node[0].data.c).selectmenu('refresh',true);
    $('#edit_step_time').val(node[0].data.t);
    $('#edit_step_action').val('edit');
    $('#edit_step_seq').val(node[0].rowIndex);
    $.mobile.openPopup($('#edit_step_form'));
  });
  
  $('#step_menu_delete').click(function(){
    step_menu_delete();
  });
  
  $('#edit_step_form_save').click(function(){
    edit_step_form_save();
  });
  
  $('#edit_step_form_cancel').click(function(){
    $.mobile.closePopup();
  });
  
  $('#filename_form_save').click(function(){
    var next_action = $('#filename_next_action').val();
    var filename = $('#filename_prompt').val();
    filename = clean_filename(filename);
    
    if(check_if_macro_exists(filename+'.json')){
      $('#confirm_message').html('That Filename is already in use.</br>Are you sure you want to overwrite?');
      $('#confirm_next_action').val('filename_form_save');
      $('#confirm_data').val(filename);
      $.mobile.openPopup($('#macro_confirm_popup'));
      return;
    }
    
    filename_form_save(filename);
    return;
  });
  
  $('#filename_form_cancel').click(function(){
    $.mobile.closePopup();
    $('#filename_next_action').val('');
  });
  
  $('#confirm_popup_cancel').click(function(){
    $('#confirm_message').html('');
    $('#confirm_next_action').val('');
    $('#confirm_data').val('');
    $.mobile.closePopup();
  });
  
  $('#confirm_popup_save').click(function(){
    var next_action = $('#confirm_next_action').val();
    var action_data = $('#confirm_data').val();
    $('#confirm_message').html('');
    $('#confirm_next_action').val('');
    $('#confirm_data').val('');
    
    switch(next_action){
      case 'file_menu_new':
        file_menu_new(true);
      break;
      case 'file_menu_open':
        file_menu_open(true);
      break;
      case 'file_menu_import':
        file_menu_import(true);
      break;
      case 'filename_form_save':
        filename_form_save(action_data);
      break;
      case 'delete_macro':
        delete_macro(true);
      break;
      default:
        $.mobile.closePopup();
      break;
    }
    
  });
  
  grid_height = $(window).height()-160;
  if (grid_height > 120){
    $('#editor_steps').height(grid_height);
  }
  // create the grid passing in the div to use together with the columns & data we want to use
  new agGrid.Grid(document.querySelector('#editor_steps'), gridOptions);
}


/* opens the step menu pop up for the selected grid node */
function show_step_menu(){
  var node = gridOptions.api.getSelectedNodes();
  if(node[0] != undefined){
    $('#step_menu_title').html("Step #: "+node[0].id);
    $('#step_menu').popup('open');
  }
}


/* empties the editor for a new macro */
function file_menu_new(sure){
  if(macro_dirty && sure != true){
    $('#confirm_message').html('You have unsaved changes.</br>Are you sure you want to continue?');
    $('#confirm_next_action').val('file_menu_new');
    $('#confirm_data').val('');
    $.mobile.openPopup($('#macro_confirm_popup'));
  } else {
    change_macro_name('');
    load_editor([]);
    macro_dirty = false; //we'll treat an empty editor as "clean"
    $.mobile.closePopup();
  }
}


/* called by the incoming websocket commands to load in new macro data */
function open_macro(editor_macro_name, macro_steps){
  change_macro_name(editor_macro_name);
  load_editor(macro_steps);
  macro_dirty = false;
}


/* handler for the "open" option on the file menu */
function file_menu_open(sure){
  if(macro_dirty && sure != true){
    $('#confirm_message').html('You have unsaved changes.</br>Are you sure you want to continue?');
    $('#confirm_next_action').val('file_menu_open');
    $('#confirm_data').val('');
    $.mobile.openPopup($('#macro_confirm_popup'));
  } else {
    $.mobile.openPopup($('#open_macro'));
  }
}


/* handler for saving the macro */
function file_menu_save(new_name){
  if(editor_macro_name == ''){
    new_name = true;
  }
  
  if(macro_dirty || new_name){
    if(new_name){
      $('#filename_next_action').val('file_menu_save');
      $.mobile.openPopup($('#name_macro'));
    } else {
      websocket_send({
        action: 'save_macro', 
        macro_name: editor_macro_name, 
        macro_steps: macro_steps
      });
      $.mobile.closePopup();
    }
  }
}


/* handler for the file menu "save as" option */
function file_menu_save_as(){
  file_menu_save(true);
}


/* handler for the file menu "export" option */
function file_menu_export(){
  $.mobile.closePopup();
  macro_steps = get_steps();
  var filename = editor_macro_name;
  if(filename == ''){
    filename = 'vs_billboard_macro';
  }
  filename = filename + '.json';
  var text = JSON.stringify(macro_steps);
  download(filename, text);
}


/* handler for the file menu "import" option */
function file_menu_import(sure){
  $('<input type="file" accept=".json" name="files[]">').on('change', function () {
    var fileToLoad = this.files[0];

    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
      var imported_steps = JSON.parse(fileLoadedEvent.target.result);
      if(macro_dirty && sure != true){
        $('#confirm_message').html('You have unsaved changes.</br>Are you sure you want to continue?');
        $('#confirm_next_action').val('file_menu_import');
        $('#confirm_data').val('');
        $.mobile.openPopup($('#macro_confirm_popup'));
      } else {
        change_macro_name('');
        macro_dirty = true;
        load_editor(imported_steps);
        $.mobile.closePopup();
      }
    };

    fileReader.readAsText(fileToLoad, "UTF-8");
    
  }).click();
}


/* changes the name of the currently loaded macro */
function change_macro_name(new_macro_name){
  editor_macro_name = new_macro_name;
  macro_dirty = true;
  if(editor_macro_name == ''){
    $('#macro_name').html('[new macro]');
  } else {
    $('#macro_name').html('"'+editor_macro_name+'"');
  }
  return;
}


/* strips all but alphanumberics - and _ to make macro name filename safe */
function clean_filename(filename){
  var reserved_names = ['clear'];
  if($.inArray(filename, reserved_names) == -1){
    return filename.replace(/[^a-zA-Z_0-9-]/g, '');
  }
  return '';
}


/* reloads the editor grid with the given records */
function load_editor(records){
  macro_steps = records;
  gridOptions.api.setRowData(macro_steps);
  gridOptions.api.sizeColumnsToFit();
}


/* returns all of the records from the editor grid */
function get_steps(){
  var output = []
  gridOptions.api.forEachNode( function(node) {
    var row = {c:node.data.c, t:node.data.t}
    output.push(row);
  });
  return output;
}


/* inserts a new step into the editor grid at the specified index */
function insert_step(index, command, time){
  var row = [{c:command, t:time}];
  gridOptions.api.insertItemsAtIndex(index, row);
  setTimeout(function(){
    gridOptions.api.ensureIndexVisible(index);
  }, 100);
}


/* updates the data of a given step with the given data */
function update_step(index, command, time){
  records = get_steps(); //we get ALL of the records from the grid
  records[index] = {c:command, t:time}; //we change the one we care about
  load_editor(records); //we reload all of the records back into the grid
  //^this is fucking stupid but as far as I can tell it's the only way.
}


/* removes the currently selected step from the grid */
function step_menu_delete(){
  var node = gridOptions.api.getSelectedNodes();
  $.mobile.closePopup();
  gridOptions.api.deselectAll();
  gridOptions.api.removeItems(node);
  macro_dirty = true;
}


/* handles the output of the step editor popup */
function edit_step_form_save(){
  var index = $('#edit_step_seq').val();
  var command = $('#edit_step_command').val();
  var time = $('#edit_step_time').val();
  switch($('#edit_step_action').val()){
    case 'insert':
      insert_step(index, command, time);
      macro_dirty = true;
      break;
    case 'edit':  
      update_step(index, command, time);
      macro_dirty = true;
      break;
  }
  $.mobile.closePopup();
}


/* handler for the filename popup */
function filename_form_save(filename){
  change_macro_name(filename);
  file_menu_save();
}


/* swaps all P1 and P2 commands */
function swap_macro_players(){
  macro_steps = get_steps();
  swapped = [];
  macro_steps.forEach(function (item){
    swapped.push({c:commands[item.c].pswap,t:item.t});
  });
  load_editor(swapped);
  macro_dirty = true;
}


/* duplicates all P1 command for P2 and all P2 command for P1*/
function mirror_macro_players(){
  macro_steps = get_steps();
  mirrored = [];
  macro_steps.forEach(function (item){
    var mirrored_command = commands[item.c].pswap
    if(commands[item.c].player == null){
      mirrored_command = commands[item.c].mirror
    }
    if(mirrored_command == item.c){
      mirrored.push(item);
    } else{
      mirrored.push({c:item.c,t:0});
      mirrored.push({c:mirrored_command,t:item.t});
    }
  });
  load_editor(mirrored);
  macro_dirty = true;
}


/* adjusts the speed of all macro steps */
function multiply_macro_steps(operator, factor){
  macro_steps = get_steps();
  adjusted_steps = [];
  var time = 0;
  macro_steps.forEach(function (item){
    time = item.t;
    switch(operator){
      case 'm':
        time = item.t*factor;
      break;
      case 'd':
        time = item.t/factor;
      break;
    }
    adjusted_steps.push({c:item.c,t:time});
  });
  
  load_editor(adjusted_steps);
  macro_dirty = true;
}


/* builds a text scroll from a string */
function build_quick_text_macro(text, step_time){
  if(text.length <1){//if the text var is empty
    return; //do nothing
  }
  if(text[0] != ' '){ //if there is no space prefix
    text = ' '+text; //add a space prefix
  }
  if(text[text.length-1] != ' '){//if there is no space suffix
    text = text+' '; //add a space suffix
  }
  text = text.toLowerCase(); //lowercase the string to match the bb_text indexes.
  
  //append to the existing macro
  macro_steps = get_steps();
  text_steps = macro_steps;
  
  //remove any unsupported characters from text string
  var clean_text = '';
  var text_dots = [];
  for (var i = 0, len = text.length; i < len; i++) {
    if(text[i] in bb_text){
      clean_text += text[i];
      text_dots.push(1);
    }else if(text[i] == '.'){
      text_dots.push(0);
    }
  }
  text = clean_text;
  text_dots.push(1);
  text_dots.push(1);
  text_dots.shift();
  
  var steps = [];
  var last_dots = null;
  for (var i = 0, len = text.length; i < len; i++) {
    steps = [];
    l_dot = 1;
    r_dot = 1;
    
    left = bb_text[text[i]]; //collect commands for the current step
    
    //convert current step commands to left digit
    for(var j=0; j < left.length; j++){ 
      steps.push(commands[left[j]].sswap); 
    }
    
    //collect commands for next digit
    if(i+1 >= text.length){//if there is no next digit
      steps.push.apply(steps, bb_text[text[0]]); //collect first digit commands for right digit
    } else {
      steps.push.apply(steps, bb_text[text[i+1]]); //collect right digit commands
    }
    
    //determine dot command
    l_dot = text_dots[i];
    r_dot = text_dots[i+1];
    var dot_command = 140+(l_dot*2)+r_dot;
    if (dot_command != last_dots){
      steps.push(dot_command);
      last_dots = dot_command;
      console.log(l_dot);
      console.log(r_dot);
      console.log(dot_command);
    }
    
    //append commands to the output steps
    for(var j=0; j < steps.length; j++){ //loop through the commands
      if(j == steps.length-1){//if this is the last command in the step
        text_steps.push({c:steps[j],t:step_time}); //add the command with the wait time
      } else {
        text_steps.push({c:steps[j],t:0}); //add the command with a 0 wait time
      }
    }
  }
  
  macro_dirty = true;
  load_editor(text_steps); //load the commands into the editor
}


/* deletes a macro from the macros folder */
function delete_macro(sure){
  if(editor_macro_name == ''){//if the macro isn't saved
    return; //just return because we can't delete it stupid
  }
  if(sure != true){
    $('#confirm_message').html('This macro will be perminently deleted.</br>Are you sure you want to continue?');
    $('#confirm_next_action').val('delete_macro');
    $('#confirm_data').val('');
    $.mobile.openPopup($('#macro_confirm_popup'));
  } else {
    websocket_send({
      action: 'delete_macro', 
      macro_name: editor_macro_name
    });
    $.mobile.closePopup();
  }
  
}