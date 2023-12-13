var dic_record = new Array();
var stopword_record = new Array();
var time_Index = 0;
var INTER;
var target;
var keyword = ""; // `/` split
var LLM = "";
var is_example;
var wordCloudRequest;


// check if example
function prompt_check(prompt) {
    var standardPrompt = 'Focus on key biology concepts and biological progress, extract the top 5 other words associated with the key word "variant" or "mutation" from the following 4 different text enclosed in back quotes, and lemmatize the top 5 words. Please answer in a json format, eg:{"variant/mutation":[word 1, word 2,...,word n]}. Here is the text: \n`With the shift from SNP arrays to high-throughput sequencing, most researchers studying diseases in consanguineous families do not rely on linkage analysis any longer, but simply search for deleterious variants which are homozygous in all patients. AutozygosityMapper allows the fast and convenient identification of disease mutations in patients from consanguineous pedigrees by focussing on homozygous segments shared by all patients. Users can upload multi-sample VCF files, including WGS data, without any pre-processing. Genome-wide runs of homozygosity and the underlying genotypes are presented in graphical interfaces. AutozygosityMapper extends the functions of its predecessor, HomozygosityMapper, to the search for autozygous regions, in which all patients share the same homozygous genotype. We provide export of VCF files containing only the variants found in homozygous regions, this usually reduces the number of variants by two orders of magnitude. These regions can also directly be analysed with our disease mutation identification tool MutationDistiller. The application comes with simple and intuitive graphical interfaces for data upload, analysis, and results. We kept the structure of HomozygosityMapper so that previous users will find it easy to switch. With AutozygosityMapper, we provide a fast web-based way to identify disease mutations in consanguineous families. AutozygosityMapper is freely available at https://www.genecascade.org/AutozygosityMapper/.`, `Precision medicine needs precise phenotypes. The Human Phenotype Ontology (HPO) uses clinical signs instead of diagnoses and has become the standard annotation for patients\' phenotypes when describing single gene disorders. Use of the HPO beyond human genetics is however still limited. With SAMS (Symptom Annotation Made Simple), we want to bring sign-based phenotyping to routine clinical care, to hospital patients as well as to outpatients. Our web-based application provides access to three widely used annotation systems: HPO, OMIM, Orphanet. Whilst data can be stored in our database, phenotypes can also be imported and exported as Global Alliance for Genomics and Health (GA4GH) Phenopackets without using the database. The web interface can easily be integrated into local databases, e.g. clinical information systems. SAMS offers users to share their data with others, empowering patients to record their own signs and symptoms (or those of their children) and thus provide their doctors with additional information. We think that our approach will lead to better characterised patients which is not only helpful for finding disease mutations but also to better understand the pathophysiology of diseases and to recruit patients for studies and clinical trials. SAMS is freely available at https://www.genecascade.org/SAMS/.`, `While great advances in predicting the effects of coding variants have been made, the assessment of non-coding variants remains challenging. This is especially problematic for variants within promoter regions which can lead to over-expression of a gene or reduce or even abolish its expression. The binding of transcription factors to the DNA can be predicted using position weight matrices (PWMs). More recently, transcription factor flexible models (TFFMs) have been introduced and shown to be more accurate than PWMs. TFFMs are based on hidden Markov models and can account for complex positional dependencies. Our new web-based application FABIAN-variant uses 1224 TFFMs and 3790 PWMs to predict whether and to which degree DNA variants affect the binding of 1387 different human transcription factors. For each variant and transcription factor, the software combines the results of different models for a final prediction of the resulting binding-affinity change. The software is written in C++ for speed but variants can be entered through a web interface. Alternatively, a VCF file can be uploaded to assess variants identified by high-throughput sequencing. The search can be restricted to variants in the vicinity of candidate genes. FABIAN-variant is available freely at https://www.genecascade.org/fabian/.`, `Genes implicated in the Golgi and endosomal trafficking machinery are crucial for brain development, and mutations in them are particularly associated with postnatal microcephaly (POM). Exome sequencing was performed in three affected individuals from two unrelated consanguineous families presenting with delayed neurodevelopment, intellectual disability of variable degree, POM and failure to thrive. Patient-derived fibroblasts were tested for functional effects of the variants. We detected homozygous truncating variants in ATP9A. While the variant in family A is predicted to result in an early premature termination codon, the variant in family B affects a canonical splice site. Both variants lead to a substantial reduction of ATP9A mRNA expression. It has been shown previously that ATP9A localises to early and recycling endosomes, whereas its depletion leads to altered gene expression of components from this compartment. Consistent with previous findings, we also observed overexpression of ARPC3 and SNX3, genes strongly interacting with ATP9A. In aggregate, our findings show that pathogenic variants in ATP9A cause a novel autosomal recessive neurodevelopmental disorder with POM. While the physiological function of endogenous ATP9A is still largely elusive, our results underline a crucial role of this gene in endosomal transport in brain tissue.`'
    return prompt === standardPrompt;
}

function if_example(prompt) {
    return prompt_check(prompt) && is_example;
}

// interrupt btn
$('#interruptButton').on('click', function() {
    if (wordCloudRequest && wordCloudRequest.readyState !== 4) {
        wordCloudRequest.abort();
        $(".loading").fadeOut();
        $(".progress_div").hide();
        console.log('Request interrupted.');
    } else {
        console.log('No active request can be interrupted.');
    }
});

// toggle picture
function wordCloudPicToggle(orientation="", newIndex="") {
    var pic = $(".wordcloud_pic_ul li.wordcloud_pic.active_pic");
    var index = parseInt(pic.attr("data-index"));
    var picDot = $(".wordcloud_pic_dots li[data-index='"+index+"']");

    if (newIndex === "") {
        var ele = $(".wordcloud_pic_ul li");
        var num = ele.length;
        var newIndex = orientation === "prev" ? (index > 1 ? index - 1 : num) : (index < num ? index + 1 : 1);
    }
    if ( newIndex === index ) { return; }

    var newPic = $(".wordcloud_pic_ul li[data-index='"+newIndex+"']");
    var newPicDot = $(".wordcloud_pic_dots li[data-index='"+newIndex+"']");
    
    pic.stop().fadeOut();
    pic.removeClass("active_pic");
    picDot.removeClass("active_pic_dot");
    
    newPic.stop().fadeIn();
    newPic.addClass("active_pic");
    newPicDot.addClass("active_pic_dot");
}

$(".wordcloud_pic_dots").on("click", ".wordcloud_pic_dot", function() {
    var newIndex = $(this).attr("data-index");
    wordCloudPicToggle("none", newIndex);
});

// wordcloud data expand button
function wordDataExpand() {
    var ele = $(".wordcloud_pic_div");
    if (ele.css("display") == "none") {
        ele.show();
        $("#main_type1").css("height", "35%");
    } else {
        ele.hide();
        $("#main_type1").css("height", "100%");
    }
}

// bind prominence
$("#prominence_bak").on("change", function() {
    if ( $(this).prop("checked") ) {
        $("input[name='innerWordSelect']").prop("disabled", false);
        $("#prominence").prop("checked", true);
    } else {
        $("input[name='innerWordSelect']").prop("disabled", true);
        $("#prominence").prop("checked", false);
    }
});

// table body word delete
$("#frequency_tbody").on("click", ".td1_3 .btn-danger", function() {
    $(this).closest('tr').remove();
});

// toggle view
function toggleView(targetId, showBtnId) {
    var targetElement = $(targetId);
    var showBtnElement = $(showBtnId);

    $(".wc-panel").hide();
    $(".wc-panel-btn").show();
    if (targetElement.css("display") === "none") {
        targetElement.show();
        showBtnElement.hide();
        $(".back-btn").show();
    } else {
        $("#main_type1").show();
        showBtnElement.show();
        $(".back-btn").hide();
    }
}

$(".advance-btn").on("click", function() {
    toggleView('#main_type2', '.advance-btn');
});

$(".download-btn").on("click", function() {
    toggleView('#main_type3', '.download-btn');
});

$(".back-btn").on("click", function() {
    $(".wc-panel").hide();
    $("#main_type1").show();
    $(".wc-panel-btn").show();
    $(".back-btn").hide();
});

$(".main_right_panel .btn").on("click", function() {
    if ($("#main_type3").css("display") !== "none") {
        $(".confirm-btn").show();
        $(".refresh-btn").hide();
    } else {
        $(".confirm-btn").hide();
        $(".refresh-btn").show();
    }
});

// confirm btn
$(".confirm-btn").on("click", function() {
    function hidden_download(src) {
        var hidden_a = document.createElement('a');
        hidden_a.setAttribute("href", src);
        hidden_a.setAttribute("download", "");
        document.body.appendChild(hidden_a);
        hidden_a.click();
    }
    // download current picture
    var src = $("li.wordcloud_pic.active_pic img").prop("src");
    var extension = $("#img_extension option:selected").val();
    if ( extension === "png" ) {
        hidden_download(src);
    } else {
        protrude_items(hidden_download);
    }
});

// refresh btn
function protrude_items(callback=() => {}) {
    if ( $("#prominence_bak").prop("checked") ){
        var target = $("#frequency_tbody input[name='innerWordSelect']:checked");
        if (target && target.length > 0) {
            var frequency_inner = {
                [keyword]: new Array()
            };
            target.each(function(){
                var word = $(this).closest("tr").find("td.td1_1").text();
                frequency_inner[keyword].push(word);
            });
            plot_word_cloud(JSON.stringify(frequency_inner), callback);
        } else {
            $("#wordcloud_btn").click();
        }
    } else {
        plot_word_cloud("refresh", callback);
    }
}

$(".refresh-btn").on("click", function() {
    protrude_items();
});

// word cloud plot
function close_wordcloud_model() {
    $("#wordcloudModaldiv .LLMbody").each(function(index, ele){
        $(ele).empty();
    })
    $("#frequency_tbody").empty();
    $(".wordcloud_pic_ul").attr("data-index", "default");
    $(".wordcloud_pic_ul").html(`
        <li class="wordcloud_pic active_pic" data-index="1">
            <img src="/static/client/img/cloud.png">
        </li>
    `);
    $(".wordcloud_pic_dots").html(`<li class="wordcloud_pic_dot active_pic_dot" data-index="1"></li>`);

}

function plot_word_cloud(param = 'none', callback=()=>{}) {
    $(".loading").show();
    // $("#main_type1").show();
    // $("#main_type2").hide();
    // $("#main_type3").hide();
    $(".wc-panel").hide();
    $("#main_type1").show();
    $(".wc-panel-btn").show();
    $(".back-btn").hide();

    LLM = $("#LLM_select option:selected").val();

    if (param == 'none') {
        var answer_model = `<div class="GPT_div"><p class="chat GPTchat" >You can click the "Send" button to communicate with the model.\n1. Right-click the message box to display the menu.\n2. Left-click to select a message box.</p></div>`;
        $("#wordcloudModaldiv .LLMbody").each(function(index, ele){
            $(ele).html(answer_model);
        });
    }
    text_change();
    var prompt = $("#prompt_model").val();
    
    var status = $("#wordcloudModal").hasClass("show");
    if ( !status ) {
        $("#wordcloudModal").modal('show');
    }

    var is_mask = $("#is_mask").is(':checked');
    if (is_mask) {
        $("#show_img").show();
        $("#sizediv").hide();
    } else {
        $("#show_img").hide();
        $("#sizediv").show();
    }

    var auto_plot = $("#auto_plot").is(':checked');
    if ( !auto_plot && (param == 'none' || if_example(prompt)) && !status) {
        $(".advance-btn").click();
        $(".loading").fadeOut();
        return 0;
    }

    if (if_example(prompt)) {
        param = `{"variant/mutation": [
            "disease", 
            "homozygous", 
            "AutozygosityMapper", 
            "phenotype", 
            "transcription"
        ]}`;
    }

    if ($(".progress_div").css("display") == 'none') {
        $(".progress-bar").attr("aria-valuenow", 0).css("width", 0 + "%").text(0 + "%");
        time_Index = 0;
        clearInterval(INTER);
        $(".progress_div").show();

        INTER = setInterval(function () {
            time_Index++;
            if (time_Index > 99) {
                return true;
            };

            if (time_Index == 99) {
                $(".progress-bar").attr("aria-valuenow", 99).css("width", 99 + "%").text(99 + "%");
            }
            else {
                $(".progress-bar").attr("aria-valuenow", time_Index).css("width", time_Index + "%").text(time_Index + "%");
            }
        }, 40);
    }

    keyword = $("#kw-input").val().replace(/ AND /g, "/");
    if ( !keyword ) { // when user didn't set keyword
        var default_keyword = $("#frequency_tbody .word_freq_tr:first-child .td1_1").text();
        keyword = default_keyword; // for the first time: ""; for the next time or applied chatGPT: "{Highest Frequency Word}"
    }
    var width = $("#width").val();
    var height = $("#height").val();
    var scale = $("#scale").val();
    var prefer_horizontal = $("#prefer_horizontal").val();
    var show_img = $("#show_img").attr('alt');
    var font_type = $("#font_type").val();
    var colormaps = $("#colormaps").val();
    var ranking = $("#ranking_method option:selected").val();
    var prominence = $("#prominence").is(":checked");

    var extension, dpi;
    if (typeof callback === "function" && callback.name === "callback") {
        extension = "png";
        dpi = "96,96";
    } else {
        extension = $("#img_extension option:selected").val();
        dpi = $("#Horizontal_DPI").val()+","+$("#Horizontal_DPI").val();
        // dpi = $("#Horizontal_DPI").val()+","+$("#Vertical_DPI").val();
    }

    var text = '';
    if (param == 'none') {
        $("#main_div textarea").each(function () {
            text = text ? text + '@TL;DR@' + $(this).val() : $(this).val();
        });
    } else if (param == "refresh") {
        var frequency = new Array();
        var tr_obj = $("#frequency_tbody .word_freq_tr");
        if ( tr_obj.length > 0 ) {
            tr_obj.each(function() {
                var word = $(this).find(".td1_1").text();
                var score = $(this).find(".td1_2").text();
                frequency.push(new Array(word, score));
            });
            text = JSON.stringify(frequency);
        } else {
            $("#main_div textarea").each(function () {
                text = text ? text + '@TL;DR@' + $(this).val() : $(this).val();
            });
        }
    } else { // menuplot -> text @param = {keyword: [word 1, word 2,..., word n]}
        param_json = (new Function("return " + param))();
        var kwls = new Array();
        (keyword.split('/')).forEach(element => {
            kwls.push(element);
        }); 
        for (i in param_json[keyword]) {
            kwls.push(param_json[keyword][i]);
        }
        var frequency = {
            "inner": new Array(), 
            "outer": new Array()
        };
        var tr_obj = $("#frequency_tbody .word_freq_tr");
        if ( tr_obj.length > 0 ) {
            tr_obj.each(function() {
                var word = $(this).find(".td1_1").text();
                var score = $(this).find(".td1_2").text();
                if (kwls.indexOf(word) != -1) {
                    frequency["inner"].push(new Array(word, score));
                } else {
                    frequency["outer"].push(new Array(word, score));
                }
            });
            text = JSON.stringify(frequency);
        } else {
            $("#main_div textarea").each(function () {
                text = text ? text + '@TL;DR@' + $(this).val() : $(this).val();
            });
            text += "@param@" + param;
        }
        param = 'relayout';
    }

    wordCloudRequest = $.ajax({
        type: "POST",
        url: "/client/plot_wordcloud/", 
        data: {
            is_mask: is_mask,
            width: width,
            height: height,
            scale: scale,
            prefer_horizontal: prefer_horizontal,
            show_img: show_img,
            font_type: font_type,
            colormaps: colormaps,
            text: text,
            ranking: ranking,
            param: param,
            keyword: keyword,
            prominence: prominence,
            extension: extension,
            dpi: dpi
        },
        success: function (data) {
            $(".loading").fadeOut();
            $(".progress_div").hide();
            // clearInterval(INTER);
            // INTER = setInterval(function () {
            //     time_Index++;
            //     if (time_Index > 100) {
            //         $(".progress-bar").attr("aria-valuenow", 100).css("width", 100 + "%").text(100 + "%");
            //         $(".loading").fadeOut();
            //         $(".progress_div").hide();
            //         $(".progress-bar").attr("aria-valuenow", 0).css("width", 0 + "%").text(0 + "%");
            //     } else {
            //         $(".progress-bar").attr("aria-valuenow", time_Index).css("width", time_Index + "%").text(time_Index + "%");
            //     }
            // }, 20);
            if (data.status == 'error') {
                alert(data.message);
            } else if (typeof callback === "function" && (callback.name === "" || callback.name === "callback")) {
                $("#frequency_tbody").empty();
                var url = "/media/img/" + data.time + ".png";
                
                // add new pic
                if ($(".wordcloud_pic_ul").attr("data-index") === "default") {
                    $(".wordcloud_pic_ul .wordcloud_pic img").prop("src", url);
                    $(".wordcloud_pic_ul").attr("data-index", "1");
                } else {
                    var index = parseInt($(".wordcloud_pic_ul").attr("data-index")) + 1;
                    var deleteIndex = index-10;
                    if (deleteIndex > 0) {
                        $(".wordcloud_pic[data-index='"+deleteIndex+"']").remove();
                        $(".wordcloud_pic_dot[data-index='"+deleteIndex+"']").remove();
                    }
                    $(".wordcloud_pic_ul").attr("data-index", index);
                    $(".wordcloud_pic_ul").append(`
                        <li class="wordcloud_pic" data-index="`+index+`">
                            <img src="`+url+`">
                        </li>
                    `);
                    $(".wordcloud_pic_dots").append(`<li class="wordcloud_pic_dot" data-index="`+index+`"></li>`);
                    wordCloudPicToggle("none", index);
                }

                function appendWord(word, score, templateStr="", disabled=false) {
                    if ( templateStr === "inner" ) {
                        var inputDisabled = disabled ? `disabled` : ``;
                        var trashDisplay = disabled ? `none` : `inline-block`;
                        templateStr = `<input type="checkbox" name="innerWordSelect" class="td-checkbox" checked ` + inputDisabled + `>`;
                    } else if ( templateStr === "outer" ) {
                        templateStr = `<input type="checkbox" name="innerWordSelect" class="td-checkbox">`;
                    } else if ( templateStr === "normal" ) {
                        templateStr = `<input type="checkbox" name="innerWordSelect" class="td-checkbox" disabled>`;
                    }
                    // <td class="td1_0">`+ templateStr +`</td>
                    $("#frequency_tbody").append(`
                        <tr class="word_freq_tr">
                            <td class="td1_0">`+ templateStr +`</td>
                            <td class="td1_1">` + word + `</td>
                            <td class="td1_2">` + score + `</td>
                            <td class="td1_3"><button type="button" class="btn btn-danger" style="display: ` + trashDisplay + `;"><i class="fa fa-trash"></i></button></td>
                        </tr>
                    `);
                }
                if ("inner" in data.frequency) { // prominence == "true"
                    for (var i = 0; i < data.frequency.inner.length; i++) {
                        var word = data.frequency.inner[i][0];
                        var score = data.frequency.inner[i][1];
                        if ( keyword.split('/').indexOf(word) !== -1 ) {
                            appendWord(word, score, "inner", true);
                        } else {
                            appendWord(word, score, "inner");
                        }
                    }
                    for (var i = 0; i < data.frequency.outer.length; i++) {
                        var word = data.frequency.outer[i][0];
                        var score = data.frequency.outer[i][1];
                        appendWord(word, score, "outer");
                    }
                } else { // prominence == "false"
                    $("#prominence_bak").prop("checked", false);
                    for (var i = 0; i < data.frequency.length; i++) {
                        var word = data.frequency[i][0];
                        var score = data.frequency[i][1];
                        appendWord(word, score, "normal");
                    }
                }
                
                // heatmap
                // if (ranking === "Cosine") {
                //     $(".heatmap-btn").show();
                //     $(".heatmap-btn").on("click", function() {
                //         if ($(".modal-body.wc_pic").css("display") === "none") {
                //             $(".modal-body.wc_pic").show();
                //             $(".modal-body.heatmap").hide();
                //         } else {
                //             $(".modal-body.wc_pic").hide();
                //             $(".modal-body.heatmap").show();
                //             if ( !$("#heatmap_pic").hasClass("hm-show") ) {
                //                 for (var i = 0, len = $("#main_div textarea").length; i < len; i++) {
                //                     var heatmapURL = "/media/heatmap/" + data.time + "-" + i + ".png";
                //                     $("#heatmap_pic").append(`<img src="`+heatmapURL+`">`);
                //                 }
                //                 $("#heatmap_pic").addClass("hm-show");
                //             }
                //         }
                //     });
                // }

                // LLM textarea and chat
                if ( !keyword ) {
                    keyword = $("#frequency_tbody .word_freq_tr:first-child .td1_1").text();
                }
                if ( if_example(prompt) ) {
                    $("#GPTbody_model").append(
                        `<div class="GPT_div">
                            <p class="chat Userchat" >` + prompt + `</p>
                        </div>
                        <div class="GPT_div">
                            <p class="chat GPTchat" >
                                {"variant/mutation": [
                                    "disease", 
                                    "homozygous", 
                                    "AutozygosityMapper", 
                                    "phenotype", 
                                    "transcription"
                                ]}
                            </p>
                            <button class="LLM-apply-btn" type="button" disabled><i class="fa fa-check-circle selected"></i> Applied</button>
                        </div>`
                    );
                    setTimeout(() => {
                        var hhh = $("#GPTbody_model").prop("scrollHeight");
                        $("#GPTbody_model").scrollTop(hhh);
                    }, 200);
                }
                callback(); // gpt_apply filtered words reminder
            } else {
                var url = "/media/img/" + data.time + "." + extension;
                callback(url); // download
            }
        }
    });
}

// LLM
function LLM_change() {
    LLM = $("#LLM_select option:selected").val();
    $("#wordcloudModaldiv .LLMbody").each(function(index, ele){
        if($(ele).prop("id") == LLM+"body_model") { $(ele).show(); text_change(); }
        else { $(ele).hide(); }
    })
}

function send2GPT() { 
    var targetDom = '#'+LLM+'body_model';
    var prompt = $("#prompt_model").val();
    if (prompt == '') { return 0; }
    $(targetDom).append('<div class="GPT_div"><p class="chat Userchat" >' + prompt + '</p></div>');
    $("#prompt_model").val('');

    $(targetDom).append('<p class="chat GPTchat wait_p"><i class="fa fa-spinner fa-spin"></i></p>');
    var hhh = $(targetDom).prop("scrollHeight");
    $(targetDom).scrollTop(hhh);
    if ( LLM === "GPT" && if_example(prompt) ) {
        setTimeout(() => {
            $("p.wait_p").remove();
            $(targetDom).append(`
                <div class="GPT_div">
                    <p class="chat GPTchat" >
                        {"variant/mutation": [
                            "disease", 
                            "homozygous", 
                            "AutozygosityMapper", 
                            "phenotype", 
                            "transcription"
                        ]}
                    </p>
                    <button class="LLM-apply-btn" type="button"><i class="fa fa-paint-brush"></i> Apply</button>
                </div>
            `);
        }, 2000);
    } else {
        var GPTRequest = $.ajax({
            type: "POST",
            url: "/client/"+LLM+"/",
            data: { prompt: prompt },
            timeout: 10000,
            success: function (data) { 
                $("p.wait_p").remove();
                if (data.status === "success") {
                    $(targetDom).append('<div class="GPT_div"><p class="chat GPTchat" >' + data.message.trim() + '</p><button class="LLM-apply-btn" type="button"><i class="fa fa-paint-brush"></i> Apply</button></div>');
                } else {
                    $(targetDom).append('<div class="GPT_div"><p class="chat GPTchat" >' + data.message.trim() + '</p></div>');
                }
                console.log('prompt_tokens: ' + data.prompt_tokens);
                console.log('completion_tokens: ' + data.completion_tokens);
            },
            complete: function(XHR, status) {
                if ( status == "timeout" ) {
                    GPTRequest.abort();
                    $("p.wait_p").remove();
                    var promptKeyword = prompt.match(/eg:{"([^"]*)"/)[1];
                    var response = {
                        [promptKeyword]: new Array()
                    };
                    var i = 0;
                    $("#frequency_tbody .td1_1").each(function() {
                        var word = $(this).text();
                        if ( !promptKeyword.includes(word) ) {
                            response[promptKeyword].push(word);
                            i++;
                        }
                        if ( i === 5 ){
                            return false;
                        }
                    });
                    $(targetDom).append(`
                        <div class="GPT_div">
                            <p class="chat GPTchat" >` + JSON.stringify(response) + `</p>
                            <button class="LLM-apply-btn" type="button"><i class="fa fa-paint-brush"></i> Apply</button>
                            <span class="gpt_res_notice">Notice: The default result has been used due to the slow response of the current model.</span>
                        </div>
                    `);
                }
            }
        });
    }
}

// LLM textarea
function copy_textarea() {
    var element = document.getElementById("prompt_model");
    element.select();
    element.setSelectionRange(0, element.value.length);
    document.execCommand('copy');
}

function clear_textarea() {
    $('#prompt_model').val('');
    get_text_len();
}

function text_change(type="") {
    var text_arr = new Array();
    $("#main_div textarea").each(function () {
        text_arr.push($(this).val());
    });
    var status = $("#merge_text").is(":checked");
    var curr = parseInt($("#index_p").text().split('/')[0]) || 1;
    var kw = keyword.replace(/\//g, '" or "');
    var len = text_arr.length;
    var insert_text = "";
    if (status) {
        insert_text = text_arr.join("`, `");
        curr = 1;
        len = 1;
    } else {
        if (type == "prev") { curr = curr > 1 ? curr - 1 : len; }
        else if (type == "next") { curr = curr < len ? curr + 1 : 1; }
        insert_text = text_arr[curr-1];
    }
    $("#index_p").text(curr + '/' + len);
    $("#prompt_model").val('Focus on key biology concepts and biological progress, extract the top 5 other words associated with the key word "' + kw + '" from the following 4 different text enclosed in back quotes, and lemmatize the top 5 words. Please answer in a json format, eg:{"' + keyword + '":[word 1, word 2,...,word n]}. Here is the text: \n`' + insert_text + '`')
    get_text_len();
}

function get_text_len() {
    var t = $("#prompt_model").val();
    if (t.length > 12000) {
        $("#text_len").css("color", "red");
    } else {
        $("#text_len").css("color", "#000000");
    }
    $("#text_len").text(t.length + '/12000')
}

// LLM right click menu
$(".LLMbody").on("click", "button.LLM-apply-btn", function() {
    function gpt_apply(jsonstr, ele) {
        // find inner then duplicated     or    return filtered words
        var curr_words = new Array();
        $("#frequency_tbody .word_freq_tr").each(function() {
            if ( $(this).find("input[name='innerWordSelect']").prop("checked") === true ) {
                curr_words.push($(this).find(".td1_1").text());
            } else {
                return false;
            }
        });
        var gpt_words = jsonstr.match(/"([^"]*)"/g).map(match_word => match_word.slice(1, -1));
        var filtered_words = gpt_words.filter(word => curr_words.indexOf(word) === -1 && word !== keyword);
        if ( filtered_words.length > 0 ) {
            ele.after(`<span class="gpt_res_notice">Notice: "`+filtered_words.join(`", "`)+`" was/were filtered. You can define the stopwords in advanced settings on the main page.</span>`);
        }
    }

    var jsonstr = $(this).prev("p").text();
    var clickTarget = $(this);
    clickTarget.html('<i class="fa fa-check-circle selected"></i> Applied');
    clickTarget.prop("disabled", true);
    plot_word_cloud(jsonstr, function () {
        gpt_apply(jsonstr, clickTarget);
    });
});


// advance settings panel
function upload_maskImage(f) {
    $(".loading").show();
    var url = "data:image/png;base64,";
    const form_data = new FormData();
    form_data.append('files', $('#upload_mask')[0].files[0]);
    form_data.append('csrfmiddlewaretoken', csrf);
    $.ajax({
        url: '/client/upload_maskImage/',
        type: 'post',
        contentType: false,
        processData: false,
        data: form_data,
        success: function (data) {
            $("#show_img").attr("alt", 'custom');
            document.getElementById("show_img").src = url + data;
            $("#is_mask").prop("checked", true);
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
    $("#show_img").attr("alt", select_mask_img);

    if (is_mask) {
        var url = '/static/client/img/' + select_mask_img;
        document.getElementById("show_img").src = url;
        $("#show_img").show();
        $("#sizediv").hide();
    }
    else {
        $("#show_img").hide();
        $("#sizediv").show();
    }
}

function colormaps_change() {
    var selected = $('#colormaps option:selected').val();
    var url = '/static/client/colormaps/' + selected + '.jpg';
    document.getElementById("show_color").src = url;
}

function font_change() {
    var selected = $('#font_type option:selected').val();
    var url = '/static/client/Fonts_img/' + selected + '.png';
    document.getElementById("show_font").src = url;
}

function imgExt_change() {
    var selected = $('#img_extension option:selected').val();
    if (selected === "jpg" || selected === "tiff") {
        $("#Horizontal_DPI").prop("disabled", false);
        $("#Vertical_DPI").prop("disabled", false);
        // $("#DPI").show();
    } else {
        $("#Horizontal_DPI").prop("disabled", true);
        $("#Vertical_DPI").prop("disabled", true);
        // $("#DPI").hide();
    }
}

// keyword
// function editKeyword() {
//     $("#keyword #kw-input").attr("disabled", false);
//     $("#keyword button").attr("onclick", "saveKeyword();");
//     $("#keyword button").text("Save");
// }

function saveKeyword() {
    keyword = $("#keyword #kw-input").val().replace(/ AND /g, "/");
    // $("#keyword #kw-input").attr("disabled", true);
    // $("#keyword button").attr("onclick", "editKeyword();");
    // $("#keyword button").text("Edit");
}

// index page textarea operate
function add(t) {
    $(t).parent().html(`<button onclick="minus(this);" class="minus_btn" type="button" ><i class="fa fa-minus"></i></button>`);
    $('#main_div').append(`
        <form>
            <textarea placeholder="Enter a text" class="main_textarea scroll_bar plot_param"></textarea>
            <div class="custom-btn-group">
                <button onclick="minus(this);" class="minus_btn" type="button"><i class="fa fa-minus"></i></button>
                <button onclick="add(this);" class="add_btn" type="button"><i class="fa fa-plus"></i></button>
            </div>
        </form>
    `);

    var h1 = $("#father_div").height();
    var hh = h1 - 230;
    $("#main_div").css("max-height", hh);
    var hhh = $('#main_div').prop("scrollHeight");
    $('#main_div').scrollTop(hhh);
}

function minus(t) {
    $(t).parent().parent().remove();
    if ( $("#main_div form").length === 1 ) {
        $(".custom-btn-group").html(`<button onclick="add(this);" class="add_btn" type="button"><i class="fa fa-plus"></i></button>`);
    } else {
        $(".custom-btn-group:last").html(`
            <button onclick="minus(this);" class="minus_btn" type="button"><i class="fa fa-minus"></i></button>
            <button onclick="add(this);" class="add_btn" type="button"><i class="fa fa-plus"></i></button>
        `);
    }

}

// dictionary
function uploads() {
    $(".loading").show();
    var str = $("#mwe_text").val();
    if (str != '') {
        str = str + '\n';
    }
    const form_data = new FormData();
    form_data.append('files', $('#forexIO_file')[0].files[0]);
    form_data.append('csrfmiddlewaretoken', csrf);
    $.ajax({
        url: '/client/upload_dictionary/',
        type: 'post',
        contentType: false,
        processData: false,
        data: form_data,
        success: function (data) {
            for (var i = 0; i < data.mwe_text.length; i++) {
                str = str + data.mwe_text[i] + '\n';
            }
            $("#mwe_text").val(str);
            $(".loading").fadeOut();
        }
    })
}
function save_dictionary() {
    $(".loading").show();
    var mwe_text = $("#mwe_text").val();
    $.post("/client/save_dictionary/",
        {
            mwe_text: mwe_text,
        },
        function (data) {
            search_dictionary();
        });
}
function search_dictionary() {
    $(".loading").show();
    $("#record_table").empty();
    $.post("/client/search_dictionary/", function (data) {
        dic_record = data.record;
        $.each(data.record, function (i, val) {
            if (i > 1000) {
                var dom_tr = $('<tr></tr>');
                var dom_td = $('<td style="font-weight: bold;">View All Please Export</td>');
                dom_tr.append(dom_td);
                $("#record_table").append(dom_tr);
                return false;
            }
            var dom_tr = $('<tr></tr>');
            var dom_td = $('<td></td>').text(val);
            dom_tr.append(dom_td);
            $("#record_table").append(dom_tr);
        });
        $("#mwe_text").val('');
        $(".loading").fadeOut();
    });
}
function clear_dictionary() {
    $(".loading").show();
    $.post("/client/clear_dictionary/", function (data) {
        $("#record_table").empty();
        $(".loading").fadeOut();
    });
}
function default_dictionary() {
    $(".loading").show();
    $.post("/client/default_dictionary/", function (data) {
        search_dictionary();
    });
}
function download_dictionary() {
    $(".loading").show();
    var len = dic_record.length;
    var str = '';
    for (let i = 0; i < len; i++) {
        str = str + dic_record[i] + '\n';
    }
    var blob = new Blob([str], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "Export Dictionary.txt");
    $(".loading").fadeOut();
}
function import_dictionary_collection(str) {
    $("#mwe_text").load("/static/client/collection/" + str + ".txt", function () {
        $(".loading").show();
        var mwe_text = $("#mwe_text").html();
        $.post("/client/save_dictionary/",
            {
                mwe_text: mwe_text,
            },
            function (data) {
                search_dictionary();
            });
    });
}

// stop words
function upload_stopwords() {
    $(".loading").show();
    var str = $("#stopwords_text").val();
    if (str != '') {
        str = str + '\n';
    }
    const form_data = new FormData();
    form_data.append('files', $('#stopwords_file')[0].files[0]);
    form_data.append('csrfmiddlewaretoken', csrf);
    $.ajax({
        url: '/client/upload_stopwords/',
        type: 'post',
        contentType: false,
        processData: false,
        data: form_data,
        success: function (data) {
            for (var i = 0; i < data.stop_words.length; i++) {
                str = str + data.stop_words[i] + '\n';
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
            stop_words: stop_words,
        },
        function (data) {
            search_stopwords();
        });
}
function search_stopwords() {
    $(".loading").show();
    $("#stopwords_record_table").empty();
    $.post("/client/search_stopwords/", function (data) {
        stopword_record = data.record;
        $.each(data.record, function (i, val) {
            $("#stopwords_record_table").append(`<tr><td>`+val+`</td></tr>`);
            if (i > 1000) {
                $("#stopwords_record_table").append(`<tr><td style="font-weight: bold;">View All Please Export</td></tr>`);
                return false;
            }
        });
        $("#stopwords_text").val('');
        $(".loading").fadeOut();
    });
}
function download_stopword() {
    $(".loading").show();
    var len = stopword_record.length;
    var str = '';
    for (let i = 0; i < len; i++) {
        str = str + stopword_record[i] + '\n';
    }
    var blob = new Blob([str], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "Export Stopwords.txt");
    $(".loading").fadeOut();
}
function clear_stopwords() {
    $(".loading").show();
    $.post("/client/clear_stopwords/",
        {
        },
        function (data) {
            $("#stopwords_record_table").empty();
            $(".loading").fadeOut();
        });
}
function default_stopwords() {
    $(".loading").show();
    $.post("/client/default_stopwords/", function (data) {
        search_stopwords();
    });
}

// upload file
function upload_session() {
    $(".loading").show();
    $("#"+LLM+"body_model").empty();
    Pnumber = 0;
    const form_data = new FormData();
    for (var i = 0; i < $($('#up_file')[0].files).length; i++) {
        form_data.append('filelist', $('#up_file')[0].files[i])
    }
    form_data.append('csrfmiddlewaretoken', csrf);
    $.ajax({
        url: '/client/up_files/',
        type: 'post',
        contentType: false,
        processData: false,
        data: form_data,
        success: function (data) {
            if (data.status === "Error") {
                alert(data.message);
            } else {
                $("#main_div").children("form").eq(-1).prevAll().remove();
                for (var i = 0; i < data.message.length - 1; i++) {
                    $(".add_btn").eq(-1).click();
                }
    
                for (var i = 0; i < data.message.length; i++) {
                    $("#main_div").find("textarea").eq(i).val(data.message[i]);
                }
            }
            $(".loading").fadeOut();
        }
    })
}

// download to file
function download_session() {
    $(".loading").show();
    var text = '';
    $("#main_div textarea").each(function () {
        text += 'Content: ' + $(this).val() + '\n';
    });
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "Session.txt");
    $(".loading").fadeOut();
}
