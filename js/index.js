var nlp_save = 0;
function saveNLP(){
    nlp_save =1;
}
var index = 0;
var dic_record = new Array();
var stopword_record = new Array();
var time_Index = 0;
var INTER;
function tagging_change(This) {
    $(".loading").fadeIn();
    var tag = $(This).val();
    var word = $(This).parent().closest('tr').find('td:nth-child(1)').text();
    var trSeq = $(This).parent().parent().index();
    $.post("/client/tagging_change/",
    {
        tag:tag,
        word:word,
        x:index,
        trSeq:trSeq,
    },
    function(data){
        var word = $(This).parent().closest('tr').find('td:nth-child(3)').text();
        $(This).parent().closest('tr').find('td:nth-child(3)').text(data.message);

        $(".loading").fadeOut();
    });
}
function nlp_default() {
    var if_first = $('#first_div').css("display");
    if (if_first == 'block'){
        nlp_1(0);
    }
    else{
        nlp_2(0);
    }
}
function download_nlp_table(){
    var if_first = $('#first_div').css("display");
    if (if_first == 'block'){
        $(".loading").fadeIn();
        let rows = $("#first_table tr");
        str = '';
        for (let i=0, len = rows.length; i < len; i++) {
            str = str+ $(rows[i]).children()[0].innerText+'\t' + $(rows[i]).children()[2].innerText + '\n';
        }
        var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "NLP1");
        $(".loading").fadeOut();
    }
    else{
        $(".loading").fadeIn();
        let rows = $("#second_table tr");
        str = 'Word\tFrequency\n';
        for (let i=1, len = rows.length; i < len; i++) {
            str = str+ $(rows[i]).children()[0].innerText+'\t' + $(rows[i]).find("input").eq(0).val() + '\n';
        }
        var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "NLP2");
        $(".loading").fadeOut();

    }

}
function Previous() {
    $(".loading").fadeIn();
    $('#second_div').collapse('toggle');
    $('#first_div').collapse('toggle');
    $('#next_btn').show();
    $('#previous_btn').hide();
    $('#save_nlp_btn').hide();
    $(".loading").fadeOut();
}
function Next() {
    $(".loading").fadeIn();
    if (nlp_save == 0){
        nlp_2(0);
    }else{
        $(".loading").fadeOut();
    }
    $('#first_div').collapse('toggle');
    $('#second_div').collapse('toggle');
    $('#previous_btn').show();
    $('#next_btn').hide();
    $('#save_nlp_btn').show();
}
function if_nlp_1() {
    $(".loading").show();
    if (nlp_save == 0){
        nlp_1(0);
    }else{

        $(".loading").fadeOut();
    }
    $('#save_nlp_btn').hide();
    var h = $(window).height()-320;

    $('#first_tbody').height(h);
    $('#second_tbody').height(h);

    $('#second_div').collapse('hide');
    $('#first_div').collapse('show');
    $('#previous_btn').hide();
    $('#next_btn').show();
    $("#nlpModal").modal('show');

}
function nlp1_goto(x){
    $(".loading").fadeIn();
    if (x == 0){
        x = index - 1;
    }
    else if (x == -1){
        x = index + 1;
    }
    //alert(x);
    $("#first_tbody").empty();
    $("#page_li_"+index).removeClass("nlp_btn_active");
    $.post("/client/nlp1_goto/",
    {
        x:x,
    },function(data){
        index = data.x;
        for (var i=0;i<data.message.length;i++)
        {
            var dom_tr=$('<tr style="display: table;width: 100%;"></tr>');
            var dom_td1=$('<td class="td1_1">'+data.message[i][0]+'</td>');
            if (data.message[i][1] == 'n'){
              var dom_td2=$('<td class="td1_2"><select class="form-select" id="select_mask" onchange="tagging_change(this);" ><option value="n" selected>Noun</option><option value="v" >Verb</option><option value="a">Adjective</option><option value="r">Adverb</option><option value="n">Other</option></select></td>');
            }
            else if(data.message[i][1] == 'v'){
              var dom_td2=$('<td class="td1_2"><select class="form-select" id="select_mask" onchange="tagging_change(this);" ><option value="n" >Noun</option><option value="v" selected>Verb</option><option value="a">Adjective</option><option value="r">Adverb</option><option value="n">Other</option></select></td>');
            }
            else if(data.message[i][1] == 'a'){
              var dom_td2=$('<td class="td1_2"><select class="form-select" id="select_mask" onchange="tagging_change(this);" ><option value="n" >Noun</option><option value="v" >Verb</option><option value="a" selected>Adjective</option><option value="r">Adverb</option><option value="n">Other</option></select></td>');
            }
            else if(data.message[i][1] == 'r'){
              var dom_td2=$('<td class="td1_2"><select class="form-select" id="select_mask" onchange="tagging_change(this);" ><option value="n" >Noun</option><option value="v" >Verb</option><option value="a">Adjective</option><option value="r" selected>Adverb</option><option value="n">Other</option></select></td>');
            }
            var dom_td3=$('<td class="td1_3">'+data.message[i][2]+'</td>');
            dom_tr.append(dom_td1);
            dom_tr.append(dom_td2);
            dom_tr.append(dom_td3);
            $("#first_tbody").append(dom_tr);
        }
        $("#page_li_"+index).addClass("nlp_btn_active");
        $(".loading").fadeOut();
    })


}
function nlp_1(x) {
  //  console.log('nlp1');
    index = 1;
    $(".loading").show();
    $("#first_tbody").empty();
    $("#pagination").empty();
    var text = $("#text").val();
    var is_stopwords = $("#is_stopwords").is(':checked');
    var is_dictionary = $("#is_dictionary").is(':checked');
    var word_case = $("input[name='case']:checked").val();
    var stamp = $("#stamp").text();
    $.post("/client/nlp_1/",
    {
        text:text,
        is_stopwords:is_stopwords,
        is_dictionary:is_dictionary,
        word_case:word_case,
        stamp: stamp,
    },
    function(data){
        $(".loading").show();
        var dom_li=$('<li class="page-item"><a class="page-link"  style="padding:0 12px" onclick="nlp1_goto(0)" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>');
            $("#pagination").append(dom_li);
            for (var i=1;i<=data.index.length;i++){

               var dom_li=$('<li class="page-item"><a class="page-link" id="page_li_'+i+'" style="padding:0 12px" onclick="nlp1_goto('+i+')" >'+i+'</a></li>');
               $("#pagination").append(dom_li);
            }
            var dom_li=$('<li class="page-item"><a class="page-link"  style="padding:0 12px" onclick="nlp1_goto(-1)"  aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>');
            $("#pagination").append(dom_li);
             $("#page_li_1").addClass("nlp_btn_active");
            for (var i=0;i<data.message.length;i++)
            {
                var dom_tr=$('<tr style="display: table;width: 100%;"></tr>');
                var dom_td1=$('<td class="td1_1">'+data.message[i][0]+'</td>');
                if (data.message[i][1] == 'n'){
                  var dom_td2=$('<td class="td1_2"><select class="form-select" id="select_mask" onchange="tagging_change(this);" ><option value="n" selected>Noun</option><option value="v" >Verb</option><option value="a">Adjective</option><option value="r">Adverb</option><option value="n">Other</option></select></td>');
                }
                else if(data.message[i][1] == 'v'){
                  var dom_td2=$('<td class="td1_2"><select class="form-select" id="select_mask" onchange="tagging_change(this);" ><option value="n" >Noun</option><option value="v" selected>Verb</option><option value="a">Adjective</option><option value="r">Adverb</option><option value="n">Other</option></select></td>');
                }
                else if(data.message[i][1] == 'a'){
                  var dom_td2=$('<td class="td1_2"><select class="form-select" id="select_mask" onchange="tagging_change(this);" ><option value="n" >Noun</option><option value="v" >Verb</option><option value="a" selected>Adjective</option><option value="r">Adverb</option><option value="n">Other</option></select></td>');
                }
                else if(data.message[i][1] == 'r'){
                  var dom_td2=$('<td class="td1_2"><select class="form-select" id="select_mask" onchange="tagging_change(this);" ><option value="n" >Noun</option><option value="v" >Verb</option><option value="a">Adjective</option><option value="r" selected>Adverb</option><option value="n">Other</option></select></td>');
                }
                var dom_td3=$('<td class="td1_3">'+data.message[i][2]+'</td>');
                dom_tr.append(dom_td1);
                dom_tr.append(dom_td2);
                dom_tr.append(dom_td3);
                $("#first_tbody").append(dom_tr);
            }
        if (x == '1'){
            nlp_2(1);
        }
        else{

            $(".loading").fadeOut();
        }
    });
}

function nlp_2(x) {
console.log('nlp2');
    $(".loading").fadeIn();
 //   var $col = $('#first_tbody').find(".td1_3");
    var is_stopwords = $("#is_stopwords").is(':checked');
    $("#second_tbody").empty();
    var arr =new Array();
  //  for (var i=0;i<$col.length;i++){arr[i] = $col.eq(i).text();}

    $.post("/client/nlp_2/",
    {
//        arr:arr.join("/+/"),
        is_stopwords:is_stopwords,
    },
    function(data){
        for (var i=0;i<data.message.length;i++)
        {
            var dom_tr=$('<tr style="display: table;width: 100%;"></tr>');
            var dom_td1=$('<td class="td1_1">'+data.message[i][0]+'</td>');
            var dom_td2=$('<td class="td1_2"><input type="text" value="'+data.message[i][1]+'" name="fname"><input type="text" value="'+data.message[i][1]+'" style="display: none;" name="default_val"></td>');
            var dom_td3=$('<td class="td1_3"><button type="button" class="btn btn-primary" onclick="default_it(this);" >Default</button><button type="button" class="btn btn-danger" onclick="delete_it(this);" >Delete</button></td>');
            dom_tr.append(dom_td1);
            dom_tr.append(dom_td2);
            dom_tr.append(dom_td3);
            $("#second_tbody").append(dom_tr);
        }
        if (x == '1'){
            plot_word_cloud();
        }
        else{$(".loading").fadeOut();}
    });

}
function default_it(This) {
    $(".loading").fadeIn();
    var default_val = $(This).parent().closest('tr').find('input[name="default_val"]').val();
    $(This).parent().closest('tr').find('input[name="fname"]').val(default_val);
    $(".loading").fadeOut();

}
function delete_it(This) {
    $(".loading").fadeIn();
    $(This).parent().closest('tr').remove();
    $(".loading").fadeOut();
}

function if_plot_word_cloud(){
    var text = $("#text").val().trim();
    text = text + $('#tr_1').html();



    if (text.length>0){
        $(".progress_div").fadeIn();
        time_Index = 0;
        var gap = 0;
        clearInterval(INTER);
        $(".progress-bar").attr("aria-valuenow",0).css("width",0 + "%").text(0 + "%");
        INTER = setInterval(function(){
              if(time_Index > 99){
                 return true;
              };

              if(time_Index == 99) {
                $(".progress-bar").attr("aria-valuenow",99).css("width",99 + "%").text(99 + "%");
                time_Index++;
              }
              else if(time_Index > 95)  {
                $(".progress-bar").attr("aria-valuenow",time_Index).css("width",time_Index + "%").text(time_Index + "%");
                if (gap == 80){
                    time_Index++;
                    gap=0;
                }else{
                    gap++;
                }
              }
              else if(time_Index > 90)  {
                $(".progress-bar").attr("aria-valuenow",time_Index).css("width",time_Index + "%").text(time_Index + "%");
                if (gap == 40){
                    time_Index++;
                    gap=0;
                }else{
                    gap++;
                }
              }
              else if(time_Index > 75)  {
                $(".progress-bar").attr("aria-valuenow",time_Index).css("width",time_Index + "%").text(time_Index + "%");
                if (gap == 5){
                    time_Index++;
                    gap=0;
                }else{
                    gap++;
                }
              }
              else {
                time_Index++;
                $(".progress-bar").attr("aria-valuenow",time_Index).css("width",time_Index + "%").text(time_Index + "%");
              }
        },120);

         $("#wordcloudModal").modal('show');
        var obj=document.getElementById("second_tbody");
        var rows=obj.rows;
        if (rows.length == 0){
           nlp_1(1);
        }
        else{
            plot_word_cloud();
        }
    }
    else{
       toast('Please input texts or load file(s).');
    }

}
function plot_word_cloud() {

   $(".loading").fadeIn();
   $(".type1").show();
   $(".type2").hide();
   $("#wordcloudModalLabel").text('Static Visualization');
   if( $(".progress_div").css("display")=='none' ){

        $(".progress-bar").attr("aria-valuenow",0).css("width",0 + "%").text(0 + "%");
        time_Index = 0;
        clearInterval(INTER);
        $(".progress_div").show();

        INTER = setInterval(function(){
          time_Index++;
          if(time_Index > 99){
             return true;
          };

          if(time_Index == 99)
          {
            $(".progress-bar").attr("aria-valuenow",99).css("width",99 + "%").text(99 + "%");
          }
          else
          {
            $(".progress-bar").attr("aria-valuenow",time_Index).css("width",time_Index + "%").text(time_Index + "%");
          }
       },250);

   }

   var is_stopwords = $("#is_stopwords").is(':checked');
   var is_dictionary = $("#is_dictionary").is(':checked');
 //  var is_nlp = 'true';
   var is_mask = $("#is_mask").is(':checked');
   if (is_mask){
        $("#show_img").show();
        $("#sizediv").hide();
    }
    else{
        $("#show_img").hide();
        $("#sizediv").show();
    }
   var width = $("#width").val();
   var height = $("#height").val();
   var scale = $("#scale").val();
   var prefer_horizontal = $("#prefer_horizontal").val();
   var max_font_size = $("#max_font_size").val();
   var min_font_size = $("#min_font_size").val();
   var show_img = $("#show_img").attr('alt');
   var font_type = $("#font_type").val();
   var colormaps = $("#colormaps").val();
   var ColorByMask = $("#ColorByMask").is(":checked");
   var ColorBySize = $("#ColorBySize").is(":checked"); //ture
   var ColorBySize_threshold = $("#ColorBySize_threshold").val();
   var stamp = $("#stamp").text();

   var frequency={};
   var obj=document.getElementById("second_tbody");
   var rows=obj.rows;


   for(var i=0;i<rows.length;i++){ //行
       frequency[rows[i].cells[0].innerHTML]=rows[i].cells[1].childNodes[0].value;
   }

   $.post("/client/plot_wordcloud/",
    {

        is_stopwords:is_stopwords,
        is_dictionary:is_dictionary,
       // is_nlp:is_nlp,
        is_mask:is_mask,
        width:width,
        height:height,
        scale:scale,
        prefer_horizontal:prefer_horizontal,
        max_font_size:max_font_size,
        min_font_size:min_font_size,
        show_img:show_img,
        font_type:font_type,
        colormaps:colormaps,
        ColorByMask:ColorByMask,
        ColorBySize:ColorBySize,
        ColorBySize_threshold:ColorBySize_threshold,
        stamp: stamp,
        frequency:JSON.stringify(frequency),
    },
    function(data){
        // var url = "data:image/png;base64,";
        //  document.getElementById("wordcloud_pic").src = url+ data.wordcloud_pic;
        var url = "/static/client/media/"+ data.time +".png";
        document.getElementById("wordcloud_pic").src = url;
        $("#wordcloud_pic").attr("alt",data.time);
        $('#wordcloud_pic').css('visibility','visible');
        clearInterval(INTER);

        INTER = setInterval(function(){
          time_Index++;
          if(time_Index > 100){
            $(".progress-bar").attr("aria-valuenow",100).css("width",100 + "%").text(100 + "%");
            $(".loading").fadeOut();
            $(".progress_div").hide();
            $(".progress-bar").attr("aria-valuenow",0).css("width",0 + "%").text(0 + "%");
          }
          else
          {
            $(".progress-bar").attr("aria-valuenow",time_Index).css("width",time_Index + "%").text(time_Index + "%");
          }
        },50);

        nlp_save = 1;
    });
}
function type_change(){
    if($(".type1").css("display")=="none"){
        $(".type1").show();
        $(".type2").hide();
        var is_mask = $("#is_mask").is(':checked');
        if (is_mask){
            $("#show_img").show();
            $("#sizediv").hide();
        }
        else{
            $("#show_img").hide();
            $("#sizediv").show();
        }
        $("#wordcloudModalLabel").text('Static Visualization');
    }else{
        $(".type1").hide();
        $(".type2").show();
        $("#show_img").show();
        $("#wordcloudModalLabel").text('Interactive Visualization');
        $("#show_img").attr("src","/static/client/img/rectangular.png");
        $("#show_img").attr("alt",'rectangular.png');
        $("#select_mask_img").val('rectangular.png');
        chartDom = document.getElementById('main_type2');
        wordcloud_chart = echarts.init(chartDom);
        plot_word_cloud_type2();
    }

}

function download_wc() {
    var timeticket = $("#wordcloud_pic").attr('alt');
    $("#download_a").attr("href","/static/client/media/"+ timeticket +".png");
}


function upload_maskImage(f) {
    $(".loading").fadeIn();
    var url = "data:image/png;base64,";
    const form_data = new FormData();
    form_data.append('files',$('#upload_mask')[0].files[0]);
    form_data.append('csrfmiddlewaretoken', csrf);
    $.ajax({
        url:'/client/upload_maskImage/',
        type:'post',
        contentType:false,
        processData:false,
        data:form_data,
        success: function(data) {
            $("#show_img").attr("alt",'custom');
            document.getElementById("show_img").src = url+ data;
            $("#is_mask").prop("checked",true);
            $("#show_img").show();
            $("#sizediv").hide();
            $(".loading").fadeOut();
            f.outerHTML = f.outerHTML;
        }
    })
}
function maskImage_change() {
    var select_mask_img = $('#select_mask_img option:selected').val();
    var is_mask = $("#is_mask").is(':checked');
    $("#show_img").attr("alt",select_mask_img);

    if (is_mask){
        var url = '/static/client/img/' +  select_mask_img;
        document.getElementById("show_img").src = url;
        $("#show_img").show();
        $("#sizediv").hide();
    }
    else{
        $("#show_img").hide();
        $("#sizediv").show();
    }

}
function colormaps_change() {
    var selected = $('#colormaps option:selected').val();
    var url = '/static/client/colormaps/' +  selected +'.jpg';
    document.getElementById("show_color").src = url;
}
function font_change() {
    var selected = $('#font_type option:selected').val();
    var url = '/static/client/Fonts_img/' +  selected +'.png';
    document.getElementById("show_font").src = url;
}







function uploads() {
    $(".loading").fadeIn();
    var str = $("#mwe_text").val();
    if (str != ''){
        str = str + '\n';
    }
    const form_data = new FormData();
    form_data.append('files',$('#forexIO_file')[0].files[0]);
    form_data.append('csrfmiddlewaretoken', csrf);
    $.ajax({
        url:'/client/upload_dictionary/',
        type:'post',
        contentType:false,
        processData:false,
        data:form_data,
        success: function(data) {
            for (var i=0;i<data.mwe_text.length;i++)
            {
                str = str + data.mwe_text[i] +'\n';
            }
            $("#mwe_text").val(str);
            $(".loading").fadeOut();
        }
    })
}

function save_dictionary() {
    $(".loading").fadeIn();
    var mwe_text = $("#mwe_text").val();
    $.post("/client/save_dictionary/",
    {
        mwe_text:mwe_text,
    },
    function(data){
        search_dictionary();
        $("#first_tbody").empty();
        $("#second_tbody").empty();

        nlp_save = 0;
    });
}

function search_dictionary() {
    $(".loading").fadeIn();
    $("#record_table").empty();
    $.post("/client/search_dictionary/",
    {
    },
    function(data){
      dic_record = data.record;
      $.each(data.record, function(i,val){
          if (i>1000){
            var dom_tr=$('<tr></tr>');
            var dom_td=$('<td style="font-weight: bold;">View All Please Export</td>');
            dom_tr.append(dom_td);
            $("#record_table").append(dom_tr);
            return false;
          }
          var dom_tr=$('<tr></tr>');
          var dom_td=$('<td></td>').text(val);
          dom_tr.append(dom_td);
          $("#record_table").append(dom_tr);
      });
      $("#mwe_text").val('');
      $(".loading").fadeOut();
    });
}

function clear_dictionary() {
    $(".loading").fadeIn();
    $.post("/client/clear_dictionary/",
    {
    },
    function(data){
        $("#record_table").empty();
        $(".loading").fadeOut();
    });

}

function default_dictionary() {
    $(".loading").fadeIn();
    $.post("/client/default_dictionary/",
    {
    },
    function(data){
        search_dictionary();
        $("#first_tbody").empty();
        $("#second_tbody").empty();

        nlp_save = 0;
    });
}

function download_dictionary() {
    $(".loading").fadeIn();

    var len = dic_record.length;
    var str = '';
    for (let i=0; i < len; i++) {
        str = str+ dic_record[i] + '\n';
    }
    var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "Export Dictionary.txt");
    $(".loading").fadeOut();
}


function upload_stopwords() {
    $(".loading").fadeIn();
    var str = $("#stopwords_text").val();
    if (str != ''){
        str = str + '\n';
    }
    const form_data = new FormData();
    form_data.append('files',$('#stopwords_file')[0].files[0]);
    form_data.append('csrfmiddlewaretoken', csrf);
    $.ajax({
        url:'/client/upload_stopwords/',
        type:'post',
        contentType:false,
        processData:false,
        data:form_data,
        success: function(data) {
            for (var i=0;i<data.stop_words.length;i++)
            {
                str = str + data.stop_words[i] +'\n';
            }
            $("#stopwords_text").val(str);
            $(".loading").fadeOut();
        }
    })
}
function save_stopwords() {
    var stop_words = $("#stopwords_text").val();
    $.post("/client/save_stopwords/",
    {
        stop_words:stop_words,
    },
    function(data){
        search_stopwords();
        $("#first_tbody").empty();
        $("#second_tbody").empty();

        nlp_save = 0;
    });
}

function search_stopwords() {
    $(".loading").fadeIn();
    $("#stopwords_record_table").empty();
    $.post("/client/search_stopwords/",
    {
    },
    function(data){
      stopword_record = data.record;
      $.each(data.record, function(i,val){
          if (i>1000){
            var dom_tr=$('<tr></tr>');
            var dom_td=$('<td style="font-weight: bold;">View All Please Export</td>');
            return false;
          }
          var dom_tr=$('<tr></tr>');
          var dom_td=$('<td></td>').text(val);
          dom_tr.append(dom_td);
          $("#stopwords_record_table").append(dom_tr);
      });
      $("#stopwords_text").val('');
      $(".loading").fadeOut();
    });

}
function download_stopword() {
    $(".loading").fadeIn();
    var len = stopword_record.length;
    var str = '';
    for (let i=0; i < len; i++) {
        str = str+ stopword_record[i] + '\n';
    }
    var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "Export Stopwords.txt");
    $(".loading").fadeOut();
}
function clear_stopwords() {
    $(".loading").fadeIn();
    $.post("/client/clear_stopwords/",
    {
    },
    function(data){
        $("#stopwords_record_table").empty();
        $(".loading").fadeOut();
    });
}
function default_stopwords() {
    $(".loading").fadeIn();
    $.post("/client/default_stopwords/",
    {
    },
    function(data){
        search_stopwords();
        $("#first_tbody").empty();
        $("#second_tbody").empty();

        nlp_save = 0;
    });
}


$("#text").change(function(){
    //alert("文本已被修改");
    $("#first_tbody").empty();
    $("#second_tbody").empty();

    nlp_save =0;
});

function up_files() {
    $(".loading").fadeIn();
    $("#first_tbody").empty();
    $("#second_tbody").empty();

    nlp_save = 0;
    var stamp = $("#stamp").text();
    const form_data = new FormData();

	for (var i =0 ;i < $($('#up_file')[0].files).length; i++){
       //  console.log('添加文件列表',$('#up_file')[0].files[i])
        form_data.append('filelist',$('#up_file')[0].files[i])
    }

    form_data.append('csrfmiddlewaretoken', csrf);
    form_data.append('stamp', stamp);
    $.ajax({
        url:'/client/up_files/',
        type:'post',
        contentType:false,
        processData:false,
        data:form_data,
        success: function(data) {
            $("#stamp").text(data.stamp);
            get_files_name();
             $(".loading").fadeOut();
        }
    })
}


function get_files_name() {
    $(".loading").fadeIn();
    var stamp = $("#stamp").text();
    $("#tr_1").empty();
    $("#tr_2").empty();
    $("#tr_3").empty();
    $("#tr_4").empty();
    $.post("/client/get_files_name/",
   {
       stamp:stamp,
   },
   function(data){
       var l = data.filenames.length;
        var w = ($("#getldiv").width()/4)*0.8-10;

       for (var i=0;i<l;i++){
            var quotient = parseInt(i/4)+1;
            var dom_td=$('<td style="width:auto;padding:0px;"><div class="input-group " ><p  style="width:'+w+'px;height:58px;margin:0px;padding:15px 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border: 1px solid #CED4DA;" >'+data.filenames[i]+'</p><div class="input-group-text" style="width:58px;padding:0;"><button class="file_close_btn" onclick="file_del(this);" type="button"><i class="fa fa-times"  ></i></button></div></div></td>');
            $("#tr_"+quotient).append(dom_td);
       }
       $(".loading").fadeOut();
   });
}

function file_del(This) {
    $(".loading").fadeIn();
    $("#first_tbody").empty();
    $("#second_tbody").empty();

    nlp_save = 0;
    var stamp = $("#stamp").text();
    filename = $(This).parent().siblings("p").html();

     $.post("/client/file_del/",
     {
         stamp:stamp,
         filename:filename,
     },
     function(data){
         get_files_name();
         $(".loading").fadeOut();
        // alert(data.message);
     });
}




$("#fa-btn-blast").click(function(){
    $('#input_type_title').animate({'opacity': 0}, 400, function(){
        $(this).html('Files Input').animate({'opacity': 1}, 400);
    });
});
$("#fa-btn-blast1").click(function(){
    $('#input_type_title').animate({'opacity': 0}, 400, function(){
        $(this).html('Keyboard Input').animate({'opacity': 1}, 400);
    });
});

function import_dictionary_collection(str){
   // var dictionary = $("#select_dictionary_collection").val();
     $("#mwe_text").load("/static/client/collection/"+str+".txt", function() {
        $(".loading").fadeIn();
        var mwe_text = $("#mwe_text").html();
        $.post("/client/save_dictionary/",
        {
            mwe_text:mwe_text,
        },
        function(data){
            search_dictionary();
        });
    });

   //
}

function plot_word_cloud_type2() {
   $(".loading").show();
   var width = $("#width_type2").val();
   var height = $("#height_type2").val();
   var max_font_size = $("#max_font_size_type2").val();
   var min_font_size = $("#min_font_size_type2").val();
   var show_img = $("#show_img").attr('alt');
   var font_type = $("#font_type").val();
   var color_start = $("#color_start").val();
   var color_end = $("#color_end").val();
   var frequency=new Array();
   var obj=document.getElementById("second_tbody");
   var rows=obj.rows;
   var len = rows.length;
  if (len>500){len=500};

   for(var i=0;i<len;i++){ //行
       var e_p =  {name: rows[i].cells[0].innerHTML, value: rows[i].cells[1].childNodes[0].value,}
       frequency[i]=e_p;
   }
   var colorArr = new Array();
   colorArr = colorGradient(color_start, color_end, 50); // 颜色渐变色数组
 //  frequency.sort(function(a,b){return b.value-a.value});
   for(var i=0;i<len;i++){
        if (i<50){
            frequency[i]['textStyle']={
                color: colorArr[i]
            }
        }
        else{
            frequency[i]['textStyle']={
                color: colorArr[49]
            }
        }

   }

   var maskImage = new Image();
   maskImage.src = document.getElementById("show_img").src;
    if (len==0){
        for(var i=0;i<200;i++){ //行
            x = i%50;
           var e_p =  {name: 'None', value: 100-x}
           frequency[i]=e_p;
           frequency[i]['textStyle']={
                    color: colorArr[x]
           }
       }
   };
 //   chartDom.removeAttribute('_echarts_instance_');
    var wordcloud_option = {
            toolbox: {
                show: false,
            },
            tooltip: {},
            series: [{
                type: 'wordCloud',
                gridSize: 1,

                sizeRange: [min_font_size, max_font_size],
                rotationRange: [-90, 90],
                width: width,
                height: height,
                drawOutOfBound: false,
                maskImage: maskImage,
                textStyle: {
                    fontFamily: font_type,
                },
                data: frequency,
            }]
        };

        wordcloud_chart.setOption(wordcloud_option,true);

        setTimeout(function () {
            $(".loading").show();
            wordcloud_chart.setOption({
                series: [{
                    textStyle: {
                        fontFamily: font_type,
                    },
                }]
            });
        }, 3000);
        setTimeout(function () {
            $(".loading").fadeOut();
        }, 6000);

}



function saveAsImage() {
    let content = wordcloud_chart.getDataURL();

    let aLink = document.createElement('a');
    let blob = this.base64ToBlob(content);

    let evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", true, true);
    aLink.download = "word cloud.png";
    aLink.href = URL.createObjectURL(blob);
    aLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
}


/**

**/

