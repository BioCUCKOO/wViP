function example1(){
    $(".loading").fadeIn();
    nlp_save = 0;
    $("#text").html("");
    $("#text").val("");
    $("#first_tbody").empty();
    $("#second_tbody").empty();
    var stamp = $("#stamp").text();
    if($('#input_type_title').html() == 'Files Input'){
         $("#fa-btn-blast1").click();
    }
    $(".type2").hide();
    $('#sizediv').hide();
    $("#show_img").show();

    $("#scale").val('6');
    $("#prefer_horizontal").val('0.9');
    $("#max_font_size").val('280');
    $("#min_font_size").val('1');

    $("#font_type").val('ONYX');
    $("#colormaps").val('Reds_r');
    $("#show_font").attr("src","/static/client/Fonts_img/ONYX.png");
    $("#show_color").attr("src","/static/client/colormaps/Reds_r.jpg");

    $("#ColorByMask").prop("checked",false);
    $("#ColorBySize").prop("checked",true);
    $("#ColorBySize_threshold").val('210');
    $("#show").html('210');
    $("#select_mask_img").val('Heart.png');

    $("#is_mask").prop("checked",true);
    $("#show_img").attr("src","/static/client/img/Heart.png");
    $("#show_img").attr("alt",'Heart.png');

    $("#width_type2").val('400');
    $("#height_type2").val('400');
    $("#max_font_size_type2").val('120');
    $("#min_font_size_type2").val('20');

    if (stamp != 0){
        $.post("/client/example_del/",
        {
            stamp:stamp,
        },
        function(data){
            $("#text").load("/static/client/collection/Example1.txt",function(responseTxt,statusTxt,xhr){
                  $("#text").val($("#text").text())
            });
            get_files_name();
        });
    }
    else{
        $("#text").load("/static/client/collection/Example1.txt",function(responseTxt,statusTxt,xhr){
              $("#text").val($("#text").text())
        });
        $(".loading").fadeOut();
    }

}


function example2(){

    $(".loading").fadeIn();
    nlp_save = 0;
    $("#text").html("");
    $("#text").val("");
    $("#first_tbody").empty();
    $("#second_tbody").empty();

    var stamp = $("#stamp").text();
    if($('#input_type_title').html() == 'Keyboard Input'){
         $("#fa-btn-blast").click();
    }
    $(".type2").hide();
    $('#sizediv').hide();
    $("#show_img").show();

    $("#scale").val('6');
    $("#prefer_horizontal").val('0.9');
    $("#max_font_size").val('250');
    $("#min_font_size").val('2');

    $("#font_type").val('times');
    $("#colormaps").val('YlOrBr_r');
    $("#show_font").attr("src","/static/client/Fonts_img/times.png");
    $("#show_color").attr("src","/static/client/colormaps/YlOrBr_r.jpg");

    $("#ColorByMask").prop("checked",false);
    $("#ColorBySize").prop("checked",true);
    $("#ColorBySize_threshold").val('180');
    $("#show").html('180');
    $("#select_mask_img").val('Mouse.png');

    $("#is_mask").prop("checked",true);
    $("#show_img").attr("src","/static/client/img/Mouse.png");
    $("#show_img").attr("alt",'Mouse.png');

    $("#width_type2").val('400');
    $("#height_type2").val('400');
    $("#max_font_size_type2").val('120');
    $("#min_font_size_type2").val('20');

    $.post("/client/example2/",
    {
        stamp:stamp,
    },
    function(data){
        $("#stamp").text(data.stamp);
        get_files_name();
        $(".loading").fadeOut();
    });
}


function example3(){
    $(".loading").fadeIn();
    nlp_save = 0;
    $("#text").html("");
    $("#text").val("");
    $("#first_tbody").empty();
    $("#second_tbody").empty();

    var stamp = $("#stamp").text();
    if($('#input_type_title').html() == 'Keyboard Input'){
         $("#fa-btn-blast").click();
    }
    $(".type2").hide();
    $('#sizediv').hide();
    $("#show_img").show();

    $("#scale").val('6');
    $("#prefer_horizontal").val('0.9');
    $("#max_font_size").val('250');
    $("#min_font_size").val('2');

    $("#font_type").val('BERNHC');
    $("#colormaps").val('Spectral_r');
    $("#show_font").attr("src","/static/client/Fonts_img/BERNHC.png");
    $("#show_color").attr("src","/static/client/colormaps/Spectral_r.jpg");

    $("#ColorByMask").prop("checked",true);
    $("#ColorBySize").prop("checked",false);
    $("#ColorBySize_threshold").val('120');
    $("#show").html('120');

    $("#select_mask_img").val('Hepatocyte.png');
    $("#is_mask").prop("checked",true);
    $("#show_img").attr("src","/static/client/img/Hepatocyte.png");
    $("#show_img").attr("alt",'Hepatocyte.png');

    $("#width_type2").val('400');
    $("#height_type2").val('400');
    $("#max_font_size_type2").val('140');
    $("#min_font_size_type2").val('20');

    $.post("/client/example3/",
    {
        stamp:stamp,
    },
    function(data){
        $("#stamp").text(data.stamp);
        get_files_name();
        $(".loading").fadeOut();
    });

}

function example4(){
    $(".loading").fadeIn();
    nlp_save = 0;
    $("#text").html("");
    $("#text").val("");
    $("#first_tbody").empty();
    $("#second_tbody").empty();
     var stamp = $("#stamp").text();
    if($('#input_type_title').html() == 'Files Input'){
         $("#fa-btn-blast1").click();
    }
    $(".type2").hide();
    $('#sizediv').hide();
    $("#show_img").show();

    $("#scale").val('6');
    $("#prefer_horizontal").val('0.9');
    $("#max_font_size").val('120');
    $("#min_font_size").val('2');

    $("#font_type").val('STENCIL');
    $("#colormaps").val('twilight_shifted');
    $("#show_font").attr("src","/static/client/Fonts_img/STENCIL.png");
    $("#show_color").attr("src","/static/client/colormaps/twilight_shifted.jpg");

    $("#ColorByMask").prop("checked",false);
    $("#ColorBySize").prop("checked",true);
    $("#ColorBySize_threshold").val('120');
    $("#show").html('120');
    $("#select_mask_img").val('NAR.png');

    $("#is_mask").prop("checked",true);
    $("#show_img").attr("src","/static/client/img/NAR.png");
    $("#show_img").attr("alt",'NAR.png');

    $("#width_type2").val('400');
    $("#height_type2").val('400');
    $("#max_font_size_type2").val('120');
    $("#min_font_size_type2").val('20');

    if (stamp != 0){
        $.post("/client/example_del/",
        {
            stamp:stamp,
        },
        function(data){
            $("#text").load("/static/client/collection/Example4.txt",function(responseTxt,statusTxt,xhr){
              $("#text").val($("#text").text())
            });

            get_files_name();

        });
    }
    else{
        $("#text").load("/static/client/collection/Example4.txt",function(responseTxt,statusTxt,xhr){
          $("#text").val($("#text").text())
        });
        $(".loading").fadeOut();
    }

}