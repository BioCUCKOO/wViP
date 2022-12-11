function toast(message){
    var toastLiveExample = document.getElementById('liveToast');
    var toast = new bootstrap.Toast(toastLiveExample);

    $("#toast-body").text(message);
    toast.show();

}

function colorGradient(startColor, endColor, step = 10) {
    let startRGB = hexToRgb(startColor, false); //转换为rgb数组模式
    let startR = startRGB[0];
    let startG = startRGB[1];
    let startB = startRGB[2];

    let endRGB = hexToRgb(endColor, false);
    let endR = endRGB[0];
    let endG = endRGB[1];
    let endB = endRGB[2];

    let sR = (endR - startR) / step; //总差值
    let sG = (endG - startG) / step;
    let sB = (endB - startB) / step;
    let colorArr = [];
    for (let i = 0; i < step; i++) {
        //计算每一步的hex值
        let hex = rgbToHex('rgb(' + Math.round((sR * i + startR)) + ',' + Math.round((sG * i + startG)) + ',' + Math.round((sB *
            i + startB)) + ')');
        colorArr.push(hex);
    }
    return colorArr;
}

function hexToRgb(sColor, str = true) {
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    sColor = sColor.toLowerCase();
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            let sColorNew = "#";
            for (let i = 1; i < 4; i += 1) {
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }
        //处理六位的颜色值
        let sColorChange = [];
        for (let i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        if(!str) {
            return sColorChange;
        } else {
            return `rgb(${sColorChange[0]},${sColorChange[1]},${sColorChange[2]})`;
        }
    } else if (/^(rgb|RGB)/.test(sColor)) {
        let arr = sColor.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",")
        return arr.map(val => Number(val));
    } else {
        return sColor;
    }
};
function rgbToHex(rgb) {
    let _this = rgb;
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (/^(rgb|RGB)/.test(_this)) {
        let aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
        let strHex = "#";
        for (let i = 0; i < aColor.length; i++) {
            let hex = Number(aColor[i]).toString(16);
            hex = String(hex).length == 1 ? 0 + '' + hex : hex; // 保证每个rgb的值为2位
            if (hex === "0") {
                hex += hex;
            }
            strHex += hex;
        }
        if (strHex.length !== 7) {
            strHex = _this;
        }
        return strHex;
    } else if (reg.test(_this)) {
        let aNum = _this.replace(/#/, "").split("");
        if (aNum.length === 6) {
            return _this;
        } else if (aNum.length === 3) {
            let numHex = "#";
            for (let i = 0; i < aNum.length; i += 1) {
                numHex += (aNum[i] + aNum[i]);
            }
            return numHex;
        }
    } else {
        return _this;
    }
}

function set_placeholder(e) {
    var filename = $(e).val();
    if (filename) {
        var idx = filename.lastIndexOf("\\");
        filename = filename.substring(idx + 1);
        $(e).parent().prev().prop("placeholder", filename);
    }
}

function getFullNum(num){
    //处理非数字
    if(isNaN(num)){return num};
    //处理不需要转换的数字
    var str = ''+num;
    if(!/e/i.test(str)){return num;};
    return parseFloat(num).toFixed(18).replace(/\.?0+$/, "");
}
var tooltipTriggerList = Array.prototype.slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

function base64ToBlob(code) {
    let parts = code.split(';base64,');
    let contentType = parts[0].split(':')[1];
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;

    let uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
}

