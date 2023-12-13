var result = '-1';
var time_Index = 0;
var INTER;

function upload_geneset() {
    var str = $("#text_gene").val();
    if (str != ''){
        str = str + '\n';
    }
    const form_data = new FormData();
    form_data.append('files',$('#upload_geneset')[0].files[0]);
    form_data.append('csrfmiddlewaretoken', csrf);
    $.ajax({
        url:'/client/upload_geneset/',
        type:'post',
        contentType:false,
        processData:false,
        data:form_data,
        success: function(data) {
            for (var i=0;i<data.geneset.length;i++)
            {
                str = str + data.geneset[i] +'\n';
            }
            $("#text_gene").val(str);
        }
    })
}
function numBy1(a,b){return b[1]-a[1];}
function numBy2(a,b){return b[2]-a[2];}
function numBy3(a,b){return b[3]-a[3];}
function numBy4(a,b){return b[4]-a[4];}
function numBy1_r(a,b){return a[1]-b[1];}
function numBy2_r(a,b){return a[2]-b[2];}
function numBy3_r(a,b){return a[3]-b[3];}
function numBy4_r(a,b){return a[4]-b[4];}
function advance_change(){
    $(".loading").fadeIn();
    $("#Analysis_tbody").empty();
    var p_threshold = $("#p_threshold").val();

    var e_threshold = $("#e_threshold").val();
    var way = $("#way").val();
    var sortBy = $("input[name='sortBy']:checked").val();
    if (result =='-1'){
        toast('No result.');
    }else{
        if (sortBy == 'E'){
            if (way =='go' || way =='bp' || way =='mf' || way =='cc' || way =='kegg'){
                var cha=result.sort(numBy3);
            }
            else if (way =='do'){
                var cha=result.sort(numBy2);
            }
            else{
                var cha=result.sort(numBy1);
            }
        }
        else{
            if (way =='go' || way =='bp' || way =='mf' || way =='cc' || way =='kegg'){
                var cha=result.sort(numBy4_r);
            }
            else if (way =='do'){
                var cha=result.sort(numBy3_r);
            }
            else{
                var cha=result.sort(numBy2_r);
            }
        }

        for (var i=0;i<cha.length;i++)
        {
            if (way =='do'){
                if (cha[i][2]>e_threshold && getFullNum(cha[i][3])<p_threshold){
                    var dom_tr=$('<tr style="display: table;width: 100%;"></tr>');
                    var dom_td1=$('<td class="td_25">'+cha[i][0]+'</td>');
                    var dom_td2=$('<td class="td_25">'+cha[i][1]+'</td>');
                    var dom_td3=$('<td class="td_25">'+cha[i][2]+'</td>');
                    var dom_td4=$('<td class="td_25">'+cha[i][3]+'</td>');

                    dom_tr.append(dom_td1);
                    dom_tr.append(dom_td2);
                    dom_tr.append(dom_td3);
                    dom_tr.append(dom_td4);
                }
            }
            else if (way =='go' || way =='bp' || way =='mf' || way =='cc' || way =='kegg'){
                if (cha[i][3]>e_threshold && getFullNum(cha[i][4])<p_threshold){
                    var dom_tr=$('<tr style="display: table;width: 100%;"></tr>');
                    var dom_td1=$('<td class="td_20">'+cha[i][0]+'</td>');
                    var dom_td2=$('<td class="td_20">'+cha[i][1]+'</td>');
                    var dom_td3=$('<td class="td_20">'+cha[i][2]+'</td>');
                    var dom_td4=$('<td class="td_20">'+cha[i][3]+'</td>');
                    var dom_td5=$('<td class="td_20">'+cha[i][4]+'</td>');
                    dom_tr.append(dom_td1);
                    dom_tr.append(dom_td2);
                    dom_tr.append(dom_td3);
                    dom_tr.append(dom_td4);
                    dom_tr.append(dom_td5);
                }
            }
            else{
                if (cha[i][2]>e_threshold && getFullNum(cha[i][3])<p_threshold){
                    var dom_tr=$('<tr style="display: table;width: 100%;"></tr>');
                    var dom_td1=$('<td class="td_33"><a href="'+data.result[i][1]+'"  target="_blank">'+data.result[i][0]+'</td>');
                    var dom_td2=$('<td class="td_33">'+data.result[i][2]+'</td>');
                    var dom_td3=$('<td class="td_33">'+data.result[i][3]+'</td>');

                    dom_tr.append(dom_td1);
                    dom_tr.append(dom_td2);
                    dom_tr.append(dom_td3);
                }
            }
            $("#Analysis_tbody").append(dom_tr);
        }

        $("td").on("click",function(){
            $(this).parent().toggleClass("td_select");
        });
    }

    selectAll();
    $(".loading").fadeOut();
}
function advance_default(){
    $("input[name='sortBy']").get(0).checked=true;
    $("#e_threshold").val("0.05");
    $("#p_threshold").val("0.01");
}
function enrichment_analysis() {
    $(".loading").fadeIn();
    $("#Analysis_tbody").empty();
    var text_gene = $("#text_gene").val();
    var species = $("#species").val();
    var way = $("#way").val();
    var sortBy = $("input[name='sortBy']:checked").val();
    var p_threshold = $("#p_threshold").val();
    var e_threshold = $("#e_threshold").val();

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
          else if(time_Index > 90)  {
            $(".progress-bar").attr("aria-valuenow",time_Index).css("width",time_Index + "%").text(time_Index + "%");
            if (gap == 15){
                time_Index++;
                gap=0;
            }else{
                gap++;
            }
          }
          else if(time_Index > 85)  {
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
    },100);

    $.post("/client/enrichment_analysis/",
    {
        text_gene:text_gene,
        species:species,
        way:way,
    },
    function(data){
        if (data.status =='error'){
            toast(data.message);
        }else if (data.result =='-1'){
            toast('No result.');
        }else{
            result = data.result;
            if (sortBy == 'E'){
                if (way =='go' || way =='bp' || way =='mf' || way =='cc' || way =='kegg'){
                    var cha=data.result.sort(numBy3);
                }
                else if (way =='do'){
                    var cha=data.result.sort(numBy2);
                }
                else{
                    var cha=data.result.sort(numBy1);
                }
            }
            else{
                if (way =='go' || way =='bp' || way =='mf' || way =='cc' || way =='kegg'){
                    var cha=data.result.sort(numBy4_r);
                }
                else if (way =='do'){
                    var cha=data.result.sort(numBy3_r);
                }
                else{
                    var cha=data.result.sort(numBy2_r);
                }
            }


            for (var i=0;i<cha.length;i++)
            {
                if (way =='do'){
                    if (cha[i][2]>e_threshold && getFullNum(cha[i][3])<p_threshold){
                        var dom_tr=$('<tr style="display: table;width: 100%;"></tr>');
                        var dom_td1=$('<td class="td_25">'+cha[i][0]+'</td>');
                        var dom_td2=$('<td class="td_25">'+cha[i][1]+'</td>');
                        var dom_td3=$('<td class="td_25">'+cha[i][2]+'</td>');
                        var dom_td4=$('<td class="td_25">'+cha[i][3]+'</td>');

                        dom_tr.append(dom_td1);
                        dom_tr.append(dom_td2);
                        dom_tr.append(dom_td3);
                        dom_tr.append(dom_td4);
                    }
                }
                else if (way =='go' || way =='bp' || way =='mf' || way =='cc' || way =='kegg'){
                    if (cha[i][3]>e_threshold && getFullNum(cha[i][4])<p_threshold){
                        var dom_tr=$('<tr style="display: table;width: 100%;"></tr>');
                        var dom_td1=$('<td class="td_20">'+cha[i][0]+'</td>');
                        var dom_td2=$('<td class="td_20">'+cha[i][1]+'</td>');
                        var dom_td3=$('<td class="td_20">'+cha[i][2]+'</td>');
                        var dom_td4=$('<td class="td_20">'+cha[i][3]+'</td>');
                        var dom_td5=$('<td class="td_20">'+cha[i][4]+'</td>');
                        dom_tr.append(dom_td1);
                        dom_tr.append(dom_td2);
                        dom_tr.append(dom_td3);
                        dom_tr.append(dom_td4);
                        dom_tr.append(dom_td5);
                    }
                }
                else{
                    if (cha[i][2]>e_threshold && getFullNum(cha[i][3])<p_threshold){
                        var dom_tr=$('<tr style="display: table;width: 100%;"></tr>');
                        var dom_td1=$('<td class="td_33"><a href="'+data.result[i][1]+'"  target="_blank">'+data.result[i][0]+'</td>');
                        var dom_td2=$('<td class="td_33">'+data.result[i][2]+'</td>');
                        var dom_td3=$('<td class="td_33">'+data.result[i][3]+'</td>');

                        dom_tr.append(dom_td1);
                        dom_tr.append(dom_td2);
                        dom_tr.append(dom_td3);
                    }
                }
                $("#Analysis_tbody").append(dom_tr);
            }
            $("td").on("click",function(){
                $(this).parent().toggleClass("td_select");
            });
            $("#selectall").click();
          //  toast('Before drawing the word cloud, click the table to select the path.');
        }
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
        },20);

        $(".loading").fadeOut();
    });
}


function example(){
    $("#species").val('yeast');
    $("#way").val('bp');
    $("#text_gene").val('');
    $("#text_gene").load("/static/client/collection/ExampleEA.txt",function(responseTxt,statusTxt,xhr){
          $("#text_gene").val($("#text_gene").text())
          enrichment_analysis();

    });


}


function way_change(){
    way = $("#way").val();
    $("#main_thead").empty();
    if (way =='do'){
        $("#species").val("human");
        var dom_tr=$('<tr style="display: table;width: 100%;"></tr>');
        var dom_td1=$('<th class="td_25">DOID</th>');
        var dom_td2=$('<th class="td_25">Disease Name</th>');
        var dom_td3=$('<th class="td_25"><span style="font-style: italic;">&nbsp;E</span>-ratio</th>');
        var dom_td4=$('<th class="td_25"><span style="font-style: italic;">&nbsp;P</span> value</th>');
        dom_tr.append(dom_td1);
        dom_tr.append(dom_td2);
        dom_tr.append(dom_td3);
        dom_tr.append(dom_td4);
    }else if (way =='go' || way =='bp' || way =='mf' || way =='cc' || way =='kegg'){
        var dom_tr=$('<tr style="display: table;width: 100%;"></tr>');
        var dom_td1=$('<th class="td_20">ID</th>');
        var dom_td2=$('<th class="td_20">Term</th>');
        var dom_td3=$('<th class="td_20">Ontology</th>');
        var dom_td4=$('<th class="td_20"><span style="font-style: italic;">&nbsp;E</span>-ratio</th>');
        var dom_td5=$('<th class="td_20"><span style="font-style: italic;">&nbsp;P</span> value</th>');
        dom_tr.append(dom_td1);
        dom_tr.append(dom_td2);
        dom_tr.append(dom_td3);
        dom_tr.append(dom_td4);
        dom_tr.append(dom_td5);
    }
    else{
        $("#species").val("human");
        var dom_tr=$('<tr style="display: table;width: 100%;"></tr>');
        var dom_td1=$('<th class="td_33">ID</th>');
        var dom_td2=$('<th class="td_33"><span style="font-style: italic;">&nbsp;E</span>-ratio</th>');
        var dom_td3=$('<th class="td_33"><span style="font-style: italic;">&nbsp;P</span> value</th>');
        dom_tr.append(dom_td1);
        dom_tr.append(dom_td2);
        dom_tr.append(dom_td3);

    }
    $("#main_thead").append(dom_tr);
}

function download_table(){
    $('#result_table').table2excel({ //这里要选择table标签 我这里是用id选择
        exclude: '.not',   //不被导出表格行的class类
        name: 'Worksheet Name',     //Worksheet Name
        filename: `wholeCycle${new Date().toLocaleDateString()}.xls`, //文件名称
        exclude_img: false, //是否导出图片
        exclude_links: false,//是否导出超链接
        exclude_inputs: false//是否导出input框中的内容
    });
}


function selectAll(){
    let rows = $("#Analysis_tbody tr");
    if ($("#selectall").is(":checked")){
        for(var i=0;i<rows.length;i++){
            $(rows[i]).addClass("td_select");
        }
    }else{
        for(var i=0;i<rows.length;i++){
            $(rows[i]).removeClass("td_select");
        }
    }
}






var dom = document.getElementById('main');
var myChart = echarts.init(dom, null, {
  renderer: 'canvas',
  useDirtyRect: false,
});
var app = {};
var option;
function plot_word_cloud(){
    let rows = $("#Analysis_tbody tr").filter(".td_select");

    way = $("#way").val();
    var width = $("#width").val();
    var height = $("#height").val();
    $('#main').height(height);
    $('#main').width(width);
    var max_font_size = $("#max_font_size").val();
    var min_font_size = $("#min_font_size").val();
    var visibleMin = $("#visibleMin").val();
    var funnel_top = $("#funnel_top").val();

    var color_start = $("#color_start").val();
    var color_end = $("#color_end").val();
    var colorby = $("input[name='colorby']:checked").val();
    var fontby = $("input[name='fontby']:checked").val();
    var methods = $("#methods").val();

    let word_e_p = new Array();
    var name_col=0;
    var val_col = -2;
    var id_col = -2;

    if (fontby == 'P'){val_col = -1;}
    if (colorby == 'P'){id_col = -1;}
    if (way =='go' || way =='bp' || way =='mf' || way =='cc' || way =='kegg' || way =='do'){name_col=1}

    var len = rows.length;
    if (len == 0){
        word_e_p[0]={name: 'None', value: '1'};
        word_e_p[1]={name: 'None', value: '2'};
    }
    var legend_data = new Array();
    for (let i=0; i < len; i++) {
        legend_data[i] = $(rows[i]).children()[name_col].innerText;
        var e_p =  {name: $(rows[i]).children()[name_col].innerText, value: $(rows[i]).children().eq(val_col).text(),
        color: $(rows[i]).children().eq(id_col).text(), p:$(rows[i]).children().eq(-1).text(), e:$(rows[i]).children().eq(-2).text(),};
        word_e_p[i]=e_p;
    }

    word_e_p.sort(function(a,b){return b.p-a.p});
    var byP = new Array();
    for (let i=0; i < len; i++) {
        byP[i]=word_e_p[i].p;
    }

    if (fontby == 'P'){
        word_e_p.sort(function(a,b){return a.value-b.value})
        for (let i=0; i < len; i++) {
            word_e_p[i].value=byP[i];
        }
    }
    if (colorby == 'P'){
        word_e_p.sort(function(a,b){return a.color-b.color})
        for (let i=0; i < len; i++) {
            word_e_p[i].color=byP[i];
        }
    }



    var Funnel_max = Math.max.apply(Math, word_e_p.map(function(i) {return i.value}));;
    var Funnel_min = Math.min.apply(Math, word_e_p.map(function(i) {return i.value}));;
  //  var Funnel_max = 20*len;
   // var Funnel_min = 0;
    word_e_p.sort(function(a,b){return b.value-a.value});
    if (methods == 'funnel'){
        if (funnel_top > len){funnel_top=len;}
        word_e_p=word_e_p.slice(0,funnel_top);
        legend_data=legend_data.slice(0,funnel_top);
        len = funnel_top;
    }
    var gap = (max_font_size - min_font_size)/(len);
    for (let i=0; i < len; i++) {
      //  word_e_p[i]['value']=Funnel_max - 20*i;
        word_e_p[i]['label']={
            fontSize: max_font_size - i*gap,
        }
    }

    var colorArr = new Array();
    colorArr = colorGradient(color_start, color_end, len); // 颜色渐变色数组
    word_e_p.sort(function(a,b){return b.color-a.color});
    if (methods == 'treemap'){
        for (let i=0; i < len; i++) {
            word_e_p[i]['label']['backgroundColor']=colorArr[i]
        }
    }


    if (methods == 'treemap'){
        option = {
            tooltip: {
                formatter: function (info) {
                  var Name =   info['data'].name;
                  var p = info['data'].p;
                  var e  = info['data'].e;
                  return [
                    '<span style="font-weight: bold;">'+ Name+'</span><br>',
                    '<span style="font-style: italic;">&nbsp;E</span>-ratio: ' + e + '<br>',
                    '<span style="font-style: italic;">&nbsp;P</span> value: ' + p,
                  ].join('');
                }
            },
            toolbox: {
                show: false,
                feature: {
                  dataView: {
                    readOnly: false
                  },
                  saveAsImage: {}
                }
            },
            series:
            {
                type: 'treemap',
                data: word_e_p,
                visibleMin:visibleMin,
            //    visualMax: visualMax,
            //    visualMin: visualMin,
                label: {
                  show: true,
                  rotate: 0,

                  padding: [0, 0, 0, 0],
             //     width: 500,
              //    height: 500,

                  fontWeight: "bolder",
                  overflow: "break",
                },
                width: width,
                height: height,
                breadcrumb: {
                  show: false
                },

            },
        //    color: colorArr,

        };
    }
    else{
        option = {
          tooltip: {
            formatter: function (info) {
              var Name =   info['data'].name;
              var p = info['data'].p;
              var e  = info['data'].e;
              return [
                '<span style="font-weight: bold;">'+ Name+'</span><br>',
                '<span style="font-style: italic;">&nbsp;E</span>-ratio: ' + e + '<br>',
                '<span style="font-style: italic;">&nbsp;P</span> value: ' + p,
              ].join('');
            }
          },
          toolbox: {
            show: false,
            feature: {
              dataView: { readOnly: false },
              saveAsImage: {}
            }
          },

          series: [
            {
              name: 'Funnel',
              type: 'funnel',
              top: 60,
              bottom: 60,

              min: Funnel_min-Math.abs(Funnel_min),
              max: Funnel_max,
              minSize: '0%',
              maxSize: '100%',
              sort: 'descending',
              gap: 2,
              label: {
                position: 'inside'
              },
              data: word_e_p,
            }
          ],
          color: colorArr,
        };
    }


    if (option && typeof option === 'object') {
      myChart.setOption(option,true);
    }

    var myModalEl = document.getElementById('wordcloudModal');
    myModalEl.addEventListener('shown.bs.modal', function (event) {
        var myEvent = new Event('resize');
        window.dispatchEvent(myEvent);
    })
    window.addEventListener('resize', myChart.resize);

    myChart.resize();
    $(".loading").fadeOut();
}

function saveAsImage() {

    var a = document.createElement("a");
    var c = document.getElementsByTagName("canvas")[0];
    a.href = c.toDataURL();
  // download 属性定义了下载链接的地址
    a.download = 'img';
    a.click();

}

function method_change() {
    var method = $("#methods").val();
    if (method == 'funnel'){
        $(".treemap_method").hide();
        $(".funnel_method").show();
    }else{
        $(".funnel_method").hide();
        $(".treemap_method").show();
    }
}


