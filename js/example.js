function clear_form() {
    $("#main_div").html(`
        <form>
            <textarea placeholder="Enter a text" class="main_textarea scroll_bar plot_param"></textarea>
            <div class="custom-btn-group">
            <button onclick="add(this);" class="add_btn" type="button"><i class="fa fa-plus"></i></button>
            </div>
        </form>
    `);
    $("#kw-input").val("");
    $("#ranking_method option[value='Cosine']").prop("selected", true);
    $("#auto_plot").prop("checked", true);
    $("#prominence").prop("checked", true);
}

function example1(){
    $(".loading").show();
    $(".type2").hide();
    $('#sizediv').hide();
    $("#show_img").show();

    $("#kw-input").val("variant AND mutation");
    saveKeyword();
    $("select[name='ranking_method'] option[value='Cosine']").prop("selected", true);
    $("#auto_plot").prop("checked", true);
    $("#prominence").prop("checked", true);
    $("#prominence-bak").prop("checked", true);

    $("#scale").val('2');
    $("#prefer_horizontal").val('0.9');

    $("#show_font").prop("src", "/static/client/Fonts_img/impact.png");
    $("#font_type option[value='impact']").prop("selected", true);
    $("#show_color").prop("src", "/static/client/colormaps/tab20b_r.jpg");
    $("#colormaps option[value='tab20b_r']").prop("selected", true);
    $("#is_mask").prop("checked", true);
    $("#show_img").prop("src", "/static/client/img/rectangular.png");
    $("#select_mask_img option[value='rectangular.png']").prop("selected", true);

    is_example = true;

    $.get("/client/example1/", {}, function(data) {
        $("#main_div").children("form").eq(-1).prevAll().remove();
        for (var i=0;i<data.message.length-1;i++) {
            $(".add_btn").eq(-1).click();
        }
        for (var i=0;i<data.message.length;i++) {
            $("#main_div textarea").eq(i).val(data.message[i]);
        }
        $(".loading").fadeOut();
    });
    $("body").on("change", ".plot_param", function() {
        is_example = false;
        // $("#wordcloud_btn").attr("onclick", "plot_word_cloud('none');");
    });
}

function example2(){
    alert("你点个锤子");
    return
    $(".loading").show();
    $(".type2").hide();
    $('#sizediv').hide();
    $("#show_img").show();

    $("#scale").val('4');

    $("#kw-input").val("");
    saveKeyword();

    $("#wordcloud_btn").attr("onclick", "plot_word_cloud('none', '');")

    $.get("/client/example2/", {}, function(data) {
        $("#main_div").children("form").eq(-1).prevAll().remove();
        for (var i=0;i<data.message.length-1;i++) { 
            $(".add_btn").eq(-1).click();
        }
        for (var i=0;i<data.message.length;i++) { 
            $("#main_div textarea").eq(i).val(data.message[i]);
        }
        $(".loading").fadeOut();
    });
}

function example3(){
    alert("你点个锤子");
    return
    $(".loading").show();
    $(".type2").hide();
    $('#sizediv').hide();
    $("#show_img").show();

    $("#scale").val('4');
    $("#prefer_horizontal").val('0.9');
    $("#max_font_size").val('200');
    $("#min_font_size").val('10');

    $("#ColorByMask").prop("checked",false);
    $("#ColorBySize").prop("checked",true);
    $("#ColorBySize_threshold").val('120');
    $("#show").html('120');

    $("#is_mask").prop("checked",true);
    $("#show_img").attr("src","/static/client/img/Brain.png");
    $("#show_img").attr("alt",'Brain.png');
    $("#select_mask_img").val('Brain.png');

    $("#kw-input").val("");
    saveKeyword();

    $("#wordcloud_btn").attr("onclick", "plot_word_cloud('none', '');")

    // prompt_change('Q&A');
    $.get("/client/example3/", {}, function(data) {
        $("#main_div").children("form").eq(-1).prevAll().remove();
        for (var i=0;i<data.message.length-1;i++) {
            $(".add_btn").eq(-1).click();
        }
        for (var i=0;i<data.message.length;i++) {
            $("#main_div textarea").eq(i).val(data.message[i]);
        }
        $(".loading").fadeOut();
    });
}
