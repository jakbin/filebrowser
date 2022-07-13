window.onbeforeunload = function(){
    sessionStorage.clear();
}
sessionStorage.setItem("folder-names","");
sessionStorage.setItem("select","");
sessionStorage.setItem("selected-item","");
sessionStorage.setItem("multiple-selection","");
sessionStorage.setItem("folder-list-select","");
sessionStorage.setItem("folder-list-name","");

$(document).ready(function(){

    function unselecte(){
        sessionStorage.setItem("selected-item", "");
        sessionStorage.setItem("select", "")
        $("#dropdown").find(".action:lt(4)").remove();
        $(".counter").remove();
    }

    function loaddata(folder, name){
        $("#loading").show();
      $.ajax({
        url : "/load-data",
        type : "POST",
        data : JSON.stringify({name : name, folder : folder}),
        dataType : "json",
        contentType : "application/json; charset=utf-8",
        complete : function(data){
            $("#loading").hide();
            if (data.status == 200){
                $("#load-data").html(data.responseText);
            }else if (data.status == 500){
                console.log(data.responseText)
            }
        }
      });
    }

    var folder = sessionStorage.getItem("folder-names");
    loaddata(folder, '');

    $(document).on("click","#home, #myfiles", function(e){
        e.preventDefault();
        if (sessionStorage.getItem("select") == "true"){
            unselecte()
        }

        if (sessionStorage.getItem("folder-names") != ""){
            loaddata("", "");
            sessionStorage.setItem("folder-names","");
            $("#links").children().remove();
        }
    });

    $(document).on("click","#link", function(e){
        e.preventDefault();

        if ($(this).attr("href") != sessionStorage.getItem("folder-names")){
            if (sessionStorage.getItem("select") == "true"){
                unselecte()
            }
            loaddata($(this).attr("href"), "");
            $(this).nextAll().remove();
            sessionStorage.setItem("folder-names",$(this).attr("href"));

            if (sessionStorage.getItem("select") == "true"){
                $("#dropdown").find(".action:lt(4)").remove();
                $(".counter").remove();
            }
        }
    });

    $(document).on("click","#view_list", function(e){
        var a = $("#listing").hasClass("mosaic");
        if (a) {
            $("#listing").removeClass("mosaic").addClass("list");
            $("#list-icon").text("view_list");
        } else {
            $("#listing").removeClass("list").addClass("mosaic");
            $("#list-icon").text("view_module");
        }
    });

    $(document).on("click", "#info", function(e){
        $('#info-modal').show();
        $('.overlay').show();
        if ($('#info-data').html() == '') {
            $.ajax({
                url : "/info",
                type : "GET",
                success : function(data){
                    $('#info-data').append('<p class="break-word"><strong>Display Name:</strong> '+data.foldername+'</p>'+
                        '<p><strong>Last Modified:</strong> '+data.lastmd+'</p><p><strong>Number of files:</strong> '+data.file+'</p>'+
                        '<p><strong>Number of directories:</strong> '+data.folder+'</p>')
                }

            });
        }
    });

    $(document).on("click", ".overlay", function(e){
        $("#close-btn").trigger('click');
    });

    $(document).on("click", "#close-btn", function(e){
      $('#modal1').hide();
      $("#delete-modal").hide();
      $("#download-modal").hide();
      $("#upload-modal").hide();
      $("#copy-modal").hide();
      $('#info-modal').hide();
      $('.overlay').hide();
    });

    $(document).on("click", "#new-folder, #new-file, #rename-button", function(e){
        if (sessionStorage.getItem("select") == "true"){
            if ($(this).is('#new-file', '#new-folder')){
                unselecte()
            }
        }
        $('#item-name').val('');
        $('#modal1').show();
        $('.overlay').show();
        if ($(this).is('#new-folder')){
            $('#item-name').focus();
            $('#modal1 div h2').html('New directory');
            $('#modal1 .card-content p').first().html('Write the name of the new directory.');
            $('#modal1 div').children('button').eq('1').html('Create');
            $('#modal1 div').children('button').eq('1').attr('id', 'folder-button');
        }else if ($(this).is('#new-file')){
            $('#item-name').focus();
            $('#modal1 div h2').html('New file');
            $('#modal1 .card-content p').first().html('Write the name of the new file.');
            $('#modal1 div').children('button').eq('1').html('Create');
            $('#modal1 div').children('button').eq('1').attr('id', 'file-button');
        }else{
            $('#modal1 div h2').html('Rename');
            $('#modal1 .card-content p').first().html('Insert a new name for '+'<code>'+sessionStorage.getItem("selected-item")+'</code>');
            $('#item-name').val(sessionStorage.getItem("selected-item"));
            $('#modal1 div').children('button').eq('1').html('Rename');
            $('#modal1 div').children('button').eq('1').attr('id', 'rename');
        }
    });

    $('#item-name').focusin(function(){
        console.log('get here');
        if ($('#item-name').val() !== null){
            $(this).select();
        }
    });
    
    $(document).on("click","#folder-button", function(e){
        e.preventDefault();

        var name = $('#item-name').val();
        var folder = sessionStorage.getItem("folder-names");

        if (name == "") {
            // $('#error-message').show();
            // $('#error-message').html("All fields are required !");
            console.log("empty field")

        }else {

          $.ajax({
            url : "/new-folder",
            type : "POST",
            data : JSON.stringify({name : name, folder : folder}),
            dataType : "json",
            contentType : "application/json; charset=utf-8",
            complete : function(data){
                if (data.responseText == 1){
                    loaddata(folder, "");
                    // $('#message').show();
                    $('#item-name').val('');
                    $('#modal1').hide();
                    $('.overlay').hide();
                    // $('#error-message').html("Data has been Saved  !")
                    console.log("folder created")
                }else if (data.responseText != 1 && data.status == 200){
                    console.log(data.responseText);
                    $("#delete-modal").hide();
                }else{
                    console.log("unknown error occured");
                }
            }
          });
        }
    });

    $(document).on("click","#file-button", function(e){

        var name = $('#item-name').val();
        var folder = sessionStorage.getItem("folder-names");

        if (name == "") {
            // $('#error-message').show();
            // $('#error-message').html("All fields are required !");
            console.log("empty field")
        }else {

          $.ajax({
            url : "/new-file",
            type : "POST",
            data : JSON.stringify({name : name, folder : folder}),
            dataType : "json",
            contentType : "application/json; charset=utf-8",
            complete : function(data){
                if (data.responseText == 1){
                    loaddata(folder, "");
                    // $('#message').show();
                    $('#file-name').val('');
                    $('#modal1').hide();
                    $('.overlay').hide();
                    // $('#error-message').html("Data has been Saved  !")
                    console.log("file created")
                }else if (data.responseText != 1 && data.status == 200){
                    console.log(data.responseText);
                    $("#delete-modal").hide();
                }else{
                    console.log("unknown error occured");
                }
            }
          });
        }
    });

    $(document).on("click", "#delete-button", function(e){
        $("#delete-modal").show();
        $('.overlay').show();
    });

    $(document).on("click","#delete", function(e){
    
        if (sessionStorage.getItem("select") == "true"){

            var name = sessionStorage.getItem("selected-item");
            var folder = sessionStorage.getItem("folder-names");
        
          $.ajax({
            url : "/delete",
            type : "POST",
            data : JSON.stringify({name : name, folder : folder}),
            dataType : "json",
            contentType : "application/json; charset=utf-8",
            complete : function(data){
                if (data.responseText == 1){
                    loaddata(folder, "");
                    // $('#message').show();
                    $("#delete-modal").hide();
                    $('.overlay').hide();
                    unselecte()
                    // $('#error-message').html("Data has been Saved  !")
                    console.log("file deleted")
                }else if (data.responseText != 1 && data.status == 200){
                    console.log(data.responseText);
                    $("#delete-modal").hide();
                }else{
                    console.log("unknown error occured");
                }
            }
          });
        }
    });
    
    $(document).on("click","#rename", function(e){
    
        if (sessionStorage.getItem("select") == "true"){

            var name = sessionStorage.getItem("selected-item");
            var folder = sessionStorage.getItem("folder-names");
            var dst = $("#item-name").val();
        
          $.ajax({
            url : "/rename",
            type : "POST",
            data : JSON.stringify({name : name, folder : folder, dst: dst}),
            dataType : "json",
            contentType : "application/json; charset=utf-8",
            complete : function(data){
                if (data.responseText == 1){
                    loaddata(folder, "");
                    $('#dst-name').val('');
                    $("#modal1").hide();
                    $('.overlay').hide();
                    unselecte()
                    // $('#error-message').html("Data has been Saved  !")
                    console.log("file renamed")
                }else if (data.responseText != 1 && data.status == 200){
                    console.log(data.responseText);
                    $("#delete-modal").hide();
                }else{
                    console.log("unknown error occured");
                }
            }
          });
        }
    });

    $(document).on("click", "#download-button", function(e){
        if (sessionStorage.getItem("select") == "true"){
            var name = sessionStorage.getItem("selected-item");
            var folder = sessionStorage.getItem("folder-names");
            location.href = "/download/"+folder+ name
        }else{
            console.log('no item selected')
        }

    });

    $(document).on("click", "#upload-button", function(e){
        $("#upload-modal").show();
        $('.overlay').show();
    });

    $(document).on("click", "#select-upload-file", function(e){
        $("#file-upload").trigger('click');
    });

    function uoload(form_data){
        $.ajax({
            url: "/upload",
            type: "POST",
            data: form_data,
            dataType: "json",
            contentType: false,
            processData: false,
            success: function(data){
                if (data == 1){
                    loaddata(folder, "");
                    $('.overlay').hide();
                    $('#upload-modal').hide();
                    // $('#file-upload').reset();
                    $('#file-upload').val('');
                    console.log("file uploaded");
                }else{
                    console.log(data);
                }
            }
        });
    }

    $("#file-upload").change(function(e){
        var folder = sessionStorage.getItem("folder-names");
        var form_data = new FormData();
        form_data.append("file1", $("#file-upload")[0].files[0]);
        form_data.append('folder', folder);

        uoload(form_data);
    });

    // upload file with drag and drop
    var dropZone = document.getElementById('select-upload-file');

    // Optional.   Show the copy icon when dragging over.  Seems to only work for chrome.
    dropZone.addEventListener('dragover', function(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    // Get file data on drop
    dropZone.addEventListener('drop', function(e) {
        e.stopPropagation();
        e.preventDefault();

        var folder = sessionStorage.getItem("folder-names");
        var form_data = new FormData();
        form_data.append("file1", e.dataTransfer.files[0]);
        form_data.append('folder', folder);

        uoload(form_data);
    });

    function folderlist(folder, folderName){
        $("#folder-list").html('');
        $.ajax({
            url : "/folderlist",
            type : "POST",
            data : JSON.stringify({folder : folder, foldername : folderName}),
            dataType : "json",
            contentType : "application/json; charset=utf-8",
            success : function(data){
                $("#folder-list").append('<li role="button" tabindex="0" aria-label=".." data-url="/files"> .. </li>');
                if (data.status != false){
                  $.each(data.item, function(key, value){
                      $("#folder-list").append('<li role="button" tabindex="0" aria-label="'+ value.path +'" data-url="/files"aria-selected="">'+ value.path +'</li>');
                  });
                }else{
                    console.log(data.item);
                }
            }
        });
    }

    $(document).on("click", "#copy-button, #move-button", function(e){
        $("#copy-modal").show();
        $('.overlay').show();
        var folder = sessionStorage.getItem("folder-names");
        $("#folder-list-code").html(folder);
        folderlist(folder, "");
        console.log("click on cpmv");
        if ($(this).is('#move-button')){
            console.log("click on mv");
            $('#copy-modal div h2').html('Move');
            $('#copy-modal .card-content p').first().html('Choose the place to move your files:');
            $('#copy-modal div').children('button').eq('1').html('Move');
            $('#copy-modal div').children('button').eq('1').attr('id', 'move-item');
        }else{
            console.log("click on cp");
            $('#copy-modal div h2').html('Copy');
            $('#copy-modal .card-content p').first().html('Choose the place to copy your files:');
            $('#copy-modal div').children('button').eq('1').html('Copy');
            $('#copy-modal div').children('button').eq('1').attr('id', 'copy-item');
        }
    });

    var DELAY = 200, clicks = 0, timer = null;

    $(document).on("click", "li", function(e){
        var $this = $(this);
        clicks++;  //count clicks

        if(clicks === 1) {

            timer = setTimeout(function() {

                console.log('Single Click folder'); //perform single-click action
                if ($this.attr("aria-selected") == "true"){
                    $this.removeAttr("aria-selected");
                    sessionStorage.setItem("folder-list-select", "");
                    sessionStorage.setItem("folder-list-name", "");
                }else{
                    $this.attr("aria-selected", true);
                    if (sessionStorage.getItem("folder-list-select") == "true"){
                        $('[aria-label="' + sessionStorage.getItem("folder-list-name") + '"]').removeAttr("aria-selected");
                    }else{
                       sessionStorage.setItem("folder-list-select", "true");
                    }
                    sessionStorage.setItem("folder-list-name",$this.attr("aria-label"));
                }
                clicks = 0;  //after action performed, reset counter
            }, DELAY);

        } else {

            clearTimeout(timer);  //prevent single-click action
            console.log('Double Click folder');  //perform double-click action
            var folderName = $this.attr("aria-label");
            var curFolder = sessionStorage.getItem('folder-names');
            var listFolderName = $("#folder-list-code").html();
            // console.log($("#folder-list-code").html(), folderName);
            if (folderName == '..'){
                    folderlist(listFolderName, folderName);
                    var fname = $("#folder-list-code").html();
                    var arr = fname.split("/");
                    arr.pop();
                    arr.pop();
                    if (arr.length == 1){
                        var foname = arr.join('/');
                        $("#folder-list-code").html(foname + '/');
                    }else{
                        var foname = arr.join('/');
                        if (foname == ''){
                            $("#folder-list-code").html('');
                        }else{
                            $("#folder-list-code").html(foname);
                        }
                    }
            }else{
                console.log(curFolder);
                console.log($("#folder-list-code").html());
                console.log(folderName);
                folderlist(curFolder+$("#folder-list-code").html(),folderName);
                $("#folder-list-code").html($("#folder-list-code").html() + folderName + "/");
            }
            clicks = 0;  //after action performed, reset counter
        }

    }).on("dblclick", function(e){
        e.preventDefault();  //cancel system double-click event
    });

    $(document).on("click", "#close-folder-list", function(e){
      $("#copy-modal").hide();
      $('.overlay').hide();
      $("code").html('');
    });

    $(document).on("click", "#copy-item, #move-item", function(e){
        var source = sessionStorage.getItem("folder-names");
        var fodestination = $('code').html();
        var destination = sessionStorage.getItem("folder-list-name");
        var itemName = sessionStorage.getItem("selected-item");
        if ($(this).is('#move-item')){
            console.log("click on mv it");
            var url = "/moveItem";
        }else{
            console.log("click on cp it");
            var url = "/copyItem"
        }
        $.ajax({
            url : url,
            type : "POST",
            data : JSON.stringify({source : source, itemName : itemName, destination : destination, fodestination : fodestination}),
            dataType : "json",
            contentType : "application/json; charset=utf-8",
            complete : function(data){
                if (data.status == 200){
                    $('#copy-modal').hide();
                    $('.overlay').hide();
                    if (url == '/moveItem'){
                        console.log("item moved");
                    }else{
                        console.log("item copied");
                    }
                    loaddata(source, "");
                    unselecte()
                    sessionStorage.setItem("folder-list-select", "");
                    sessionStorage.setItem("folder-list-name", "");
                    $("code").html('');
                }else if (data.status == 500){
                    console.log("Internal Server Error")
                }
            }
        });
    });

});
