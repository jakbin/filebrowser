$(document).ready(function(){

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

    var folder = $("#folder-names").val();
    loaddata(folder, '');

    $(document).on("click","#home, #myfiles", function(e){
        e.preventDefault();

        if ($("#folder-names").val() != ""){
            loaddata("", "");
            $("#folder-names").val("");
            $("#links").children().remove();
        }
    });

    $(document).on("click","#link", function(e){
        e.preventDefault();

        if ($(this).attr("href") != $("#folder-names").val()){
            loaddata($(this).attr("href"), "");
            $(this).nextAll().remove();
            $("#folder-names").val($(this).attr("href"));

            if ($("#select").val() == "true"){
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
        $.ajax({
            url : "/info",
            type : "GET",
            success : function(data){
                $('#info-data').append('<p class="break-word"><strong>Display Name:</strong> '+data.foldername+'</p>'+
                    '<p><strong>Last Modified:</strong> '+data.lastmd+'</p><p><strong>Number of files:</strong> '+data.file+'</p>'+
                    '<p><strong>Number of directories:</strong> '+data.folder+'</p>')
            }
        });
    });

    $(document).on("click", "#ok", function(e){
        $('#info-modal').hide();
        $('.overlay').hide();
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
      $('.overlay').hide();
    });

    $(document).on("click", "#new-folder, #new-file, #rename-button", function(e){
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
            $('#modal1 .card-content p').first().html('Insert a new name for '+'<code>'+$("#selected-item").val()+'</code>');
            $('#item-name').val($("#selected-item").val());
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
        var folder = $("#folder-names").val();

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
        var folder = $("#folder-names").val();

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
    
        if ($("#select").val() == "true"){

            var name = $("#selected-item").val();
            var folder = $("#folder-names").val();
        
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
                    $("#dropdown").find(".action:lt(4)").remove();
                    $(".counter").remove();
                    $('.overlay').hide();
                    $('#select').val('');
                    $("#selected-item").val('');
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
    
        if ($("#select").val() == "true"){

            var name = $("#selected-item").val();
            var folder = $("#folder-names").val();
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
                    // $('#message').show();
                    $("#modal1").hide();
                    $("#dropdown").find(".action:lt(4)").remove();
                    $(".counter").remove();
                    $('.overlay').hide();
                    $('#select').val('');
                    $("#selected-item").val('');
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
        if ($("#select").val() == 'true'){
        var name = $("#selected-item").val();
        var folder = $("#folder-names").val();

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

    $("#file-upload").change(function(e){
        var folder = $("#folder-names").val();
        var form_data = new FormData();
        form_data.append("file1", $("#file-upload")[0].files[0]);
        form_data.append('folder', folder);

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

        var folder = $("#folder-names").val();
        var form_data = new FormData();
        form_data.append("file1", e.dataTransfer.files[0]);
        form_data.append('folder', folder);

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
    });

    function folderlist(folder, folderName){
        $("#folder-list").html('');
        $.ajax({
            url : "/folderlist",
            type : "POST",
            data : JSON.stringify({foldername : folderName, folder : folder}),
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
        var folder = $("#folder-names").val();
        folderlist(folder, "");
        if ($(this).is('#move-button')){
            $('#copy-modal div h2').html('Move');
            $('#copy-modal .card-content p').first().html('Choose the place to move your files:');
            $('#copy-modal div').children('button').eq('1').html('Move');
            $('#copy-modal div').children('button').eq('1').attr('id', 'move-item');
        }else{
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
                    $("#folder-list-select").val('');
                    $('#folder-list-name').val('');
                }else{
                    $this.attr("aria-selected", true);
                    if ($("#folder-list-select").val() == "true"){

                        $('[aria-label="' + $("#folder-list-name").val() + '"]').removeAttr("aria-selected");
                    }else{
                        $("#folder-list-select").val("true");
                    }
                    $('#folder-list-name').val($this.attr("aria-label"));
                }

                clicks = 0;  //after action performed, reset counter

            }, DELAY);

        } else {

            clearTimeout(timer);  //prevent single-click action

            console.log('Double Click folder');  //perform double-click action

            var folderName = $this.attr("aria-label");

            if (folderName == '..'){
                    folderlist($("#folder-list-code").html(), folderName);
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
                folderlist($("#folder-list-code").html(), folderName);
                $("#folder-list-code").html($("#folder-list-code").html() + folderName + "/");
            }
            clicks = 0;  //after action performed, reset counter
        }

    }).on("dblclick", function(e){
        e.preventDefault();  //cancel system double-click event
    });

    $(document).on("click", "#copy-item, #move-item", function(e){
        var source = $("#folder-names").val();
        var fodestination = $('code').html();
        var destination = $('#folder-list-name').val();
        var itemName = $('#selected-item').val();
        if ($(this).is('#move-item')){
            var url = "/moveItem";
        }else{
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
                        loaddata(source, "");
                    }else{
                        console.log("item copied");
                    }
                    $("#dropdown").find(".action:lt(4)").remove();
                    $(".counter").remove();
                    $('#select').val('');
                    $("#selected-item").val('');
                }else if (data.status == 500){
                    console.log("Internal Server Error")
                }
            }
        });

    });

});
