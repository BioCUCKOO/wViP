import nltk
from nltk.tokenize import MWETokenizer  # Multi-Word Expression
from matplotlib import pyplot as plt
import os
import time
import json
import math

import docx
from PIL import ImageFile, Image
import numpy as np
import pandas as pd

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import base64

import matplotlib

from wordcloud import WordCloud
from sklearn.feature_extraction.text import TfidfVectorizer

from .enrichment import do_go, do_kegg, do_gesa, do_do, uniprot2gene, gene2uniprot
from .func import transparence2white, delet, read_pdf, Area

from . import com
import openai
import replicate

matplotlib.use('Agg')


ImageFile.LOAD_TRUNCATED_IMAGES = True
Image.MAX_IMAGE_PIXELS = None

# USERBASEDIR = "F:/7_WVIP/ONLP"
USERBASEDIR = "/data/www/wvip/ONLP/ONLP"

def set_cookie(request):
    delet(f'{USERBASEDIR}/client/media/img/')
    delet(f'{USERBASEDIR}/client/media/files/')

    x = request.POST.get('x')
    response = HttpResponse("OK")
    response.set_cookie("is_cookie", "True", max_age=60 * 60 * 24)
    if x == 'false':
        response.delete_cookie("is_cookie")

    return response


def index(request):
    request.session.flush()
    stop_words = []
    # stop_words = stopwords.words('english')
    f = open(f'{USERBASEDIR}/client/static/client/collection/example_stopwords.txt',
             'r', encoding='utf-8')
    for l in f:
        l = l.rstrip()
        stop_words.append(l)

    f.close()
    mwe = []
    f = open(f'{USERBASEDIR}/client/static/client/collection/example_dictionary.txt',
             'r', encoding='utf-8')
    for l in f:
        l = l.rstrip()
        mwe.append(l)
    f.close()

    request.session['stop_words'] = stop_words
    request.session['mwe_text'] = mwe

    is_cookie = request.COOKIES.get('is_cookie')
    if not is_cookie:
        is_cookie = 'false'

    return render(request, f'{USERBASEDIR}/client/templates/client/index.html', {'is_cookie': is_cookie})


def enrichment(request):
    is_cookie = request.COOKIES.get('is_cookie')
    if not is_cookie:
        is_cookie = 'false'
    return render(request, f'{USERBASEDIR}/client/templates/client/enrichment.html', {'is_cookie': is_cookie})


def documentation(request):
    is_cookie = request.COOKIES.get('is_cookie')
    if not is_cookie:
        is_cookie = 'false'
    return render(request, f'{USERBASEDIR}/client/templates/client/documentation.html', {'is_cookie': is_cookie})


def get_mwetokenizer(request):
    mwe_text = request.session.get('mwe_text', 'null')
    mwetokenizer = MWETokenizer([], separator=' ')
    if mwe_text == 'null':
        print(mwe_text)
    else:
        for i in mwe_text:
            sp = i.rstrip().split(' ')
            mwetokenizer.add_mwe(tuple(sp))
    return mwetokenizer


def wc_plot(
    request, timeticket, is_mask, width, height, scale, 
    prefer_horizontal, max_font_size, show_img, font_type, 
    colormaps, ColorBySize_threshold, frequency, extension,
    if_relayout=False, img_type="", repeat=True, font_step=1, min_font_size=1
):
    data = {}
    data['frequency'] = frequency
    font_path = f'{USERBASEDIR}/client/static/client/Fonts/' + font_type + '.TTF'
    stop_words = request.session.get('stop_words', 'null')

    if is_mask == 'false':
        url = f"{USERBASEDIR}/client/static/client/img/rectangular.png"
        pic = np.array(Image.open(url).convert("RGBA"))
        mask = transparence2white(pic, img_type)
    else:
        if show_img == 'custom':
            pic = request.session.get('custom', 'null')
            pic = np.array(pic)
        else:
            url = f"{USERBASEDIR}/client/static/client/img/" + show_img
            pic = np.array(Image.open(url).convert("RGBA"))

        mask = transparence2white(pic, img_type) if if_relayout else transparence2white(pic)

    def test_color_func(word, font_size, position, orientation, font_path, random_state):
        r, g, b, alpha = plt.get_cmap(colormaps)(font_size / ColorBySize_threshold)
        return int(r * 255), int(g * 255), int(b * 255), 

    EXTENSION_PARAM = {
        "jpg": ["RGB", "white"],
        "png": ["RGBA", None],
        "tiff": ["RGB", "white"],
        "pdf": ["RGB", "white"]
    }

    wc = WordCloud(font_path=font_path, width=width, height=height, scale=scale, 
                   prefer_horizontal=prefer_horizontal,
                   max_font_size=max_font_size, min_font_size=min_font_size, relative_scaling=0,
                   mask=mask, mode=EXTENSION_PARAM[extension][0], background_color=EXTENSION_PARAM[extension][1],
                   stopwords=stop_words, colormap=colormaps, repeat=repeat, max_words=100, font_step=font_step)

    if len(frequency) != 0:
        frequency = {k[0]: int(k[1]) for k in frequency}
        wc.generate_from_frequencies(frequency)
    else:
        wc.generate('None')
    wc.recolor(color_func=test_color_func)

    img = wc.to_image()
    data["img"] = img
    data['time'] = timeticket
    data['status'] = 'success'
    return data


def word_ranking(text:str, keyword:list, mwetokenizer:MWETokenizer, stop_words:list, ranking:str, normalize:bool=True, heatmapURL:str="") -> list:
    if ranking == "TF":
        words = com.preprocess("TF", text, keyword, mwetokenizer, stop_words)
        fdist = nltk.FreqDist(words)
        frequency = fdist.most_common(100) # -> list

    elif ranking == "TF-log":
        words = com.preprocess("TF", text, keyword, mwetokenizer, stop_words)
        fdist = nltk.FreqDist(words)
        frequency = [(word, math.log(freq) + 1) for word, freq in fdist.most_common(100)] # -> list

    elif ranking == "TF-IDF":
        words = com.preprocess("TF", text, keyword, mwetokenizer, stop_words)
        tfidf_vectorizer = TfidfVectorizer()
        tfidf_matrix = tfidf_vectorizer.fit_transform(words)
        average_tfidf = tfidf_matrix.mean(axis=0)
        feature_names = tfidf_vectorizer.get_feature_names_out()
        word_importance = [(word, average_tfidf[0, idx]) for idx, word in enumerate(feature_names)]
        word_importance.sort(key=lambda x: x[1], reverse=True)
        frequency = [(word, int(importance * 1000)) for word, importance in word_importance] # -> list
    
    elif ranking == "PMI":
        words, keyword = com.preprocess("keyword", text, keyword, mwetokenizer, stop_words)
        frequency = com.PMI(words, keyword) # -> list

    elif ranking == "Textrank":
        frequency = com.textrank(text) # -> list

    elif ranking == "Rake":
        frequency = com.rake(text)

    elif ranking == "Yake":
        frequency = com.yake_(text)

    else:
        words, keyword = com.preprocess("keyword", text, keyword, mwetokenizer, stop_words)
        wordVal, word_to_id, id_to_word = com.word2val(words)
        C = com.window_co_matrix(wordVal, len(word_to_id))
        frequency = com.most_similar(ranking, keyword, word_to_id, id_to_word, C, 100, normalize) # -> list
        # com.co_matrix_heatmap(pd.DataFrame(C), frequency, word_to_id, id_to_word, f"{USERBASEDIR}/client/media/heatmap/{heatmapURL}.png")

    return frequency


def plot_wordcloud(request):
    try:
        timeticket = time.time()
        request.session["timeticket"] = timeticket
        text = request.POST.get('text', 'none')
        # plot param
        is_mask = request.POST.get('is_mask')
        width = int(request.POST.get('width'))
        height = int(request.POST.get('height'))
        scale = float(request.POST.get('scale'))
        prefer_horizontal = float(request.POST.get('prefer_horizontal'))
        show_img = request.POST.get('show_img')
        font_type = request.POST.get('font_type')
        colormaps = request.POST.get('colormaps')
        param = request.POST.get('param')
        prominence = request.POST.get("prominence") # -> str  "true" or "false"
        extension = request.POST.get('extension', "png")
        dpi = [float(x) for x in request.POST.get('dpi').split(',')]

        max_font_size = 125
        ColorBySize_threshold = 120
        # ranking param
        stop_words = request.session.get('stop_words', 'null')
        keyword = request.POST.get('keyword').strip().split('/') # "" or "keyword string" or "keyword1/keyword2" -> list
        ranking = request.POST.get("ranking")
        mwetokenizer = get_mwetokenizer(request)

        if param == 'none':
            # extract keyword from merged text
            merged_text = text.replace("@TL;DR@", " ")
            if not keyword[0]:
                _, keyword = com.preprocess("keyword", merged_text, keyword, mwetokenizer, stop_words)
            # ranking

            # access merge text
            frequency = word_ranking(merged_text, keyword, mwetokenizer, stop_words, ranking, False, f'{request.session["timeticket"]}') # -> list

            # access text separately
            # frequency = {
            #     "inner": [(kw, 100) for kw in keyword], 
            #     "outer": []
            # }
            # for index, singleText in enumerate(text.split("@TL;DR@")):
            #     try:
            #         freq = word_ranking(singleText, keyword, mwetokenizer, stop_words, ranking, False, f'{request.session["timeticket"]}-{index}')
            #     except KeyError:
            #         continue
            #     frequency["inner"].append(freq[1])
            #     frequency["outer"] += freq[2:]
            # 
            # postprocess frequency
            # seen_words = set()
            # frequency_duplicated = []
            # for word, score in frequency['inner']:
            #     if word not in seen_words:
            #         seen_words.add(word)
            #         frequency_duplicated.append((word, score))
            # frequency['inner'] = frequency_duplicated
            # frequency_duplicated = []
            # for word, score in frequency['outer']:
            #     if word not in seen_words:
            #         seen_words.add(word)
            #         frequency_duplicated.append((word, score))
            # frequency['outer'] = sorted(frequency_duplicated, key=lambda x: int(x[1]), reverse=True)

        elif param == "refresh":
            if "@TL;DR@" in text:
                pass
            else:
                frequency = json.loads(text) # -> list

        elif param == 'relayout':
            if "@param@" in text: # example
                text, GPTresponse = text.split("@param@")
                # before justify: generate frequency
                tmp = [request.POST["text"], request.POST["param"], request.POST["prominence"]]
                request.POST._mutable = True
                request.POST["text"], request.POST["param"], request.POST["prominence"] = text, "none", "not plot"
                frequency_ = plot_wordcloud(request) # -> dict
                request.POST["text"], request.POST["param"], request.POST["prominence"] = tmp
                request.POST._mutable = False
                # justify
                GPTres = json.loads(GPTresponse)
                kw, relatedWord = list(GPTres.items())[0]
                kwls = [word for word in (*kw.split('/'), *relatedWord)]
                frequency = {
                    "inner": [], 
                    "outer": []
                }
                for word, score in frequency_:
                # for word, score in (*frequency_["inner"], *frequency_["outer"]):
                    if word in kwls:
                        frequency["inner"].append((word, score))
                    else:
                        frequency["outer"].append((word, score))
            else:
                frequency = json.loads(text) # -> dict
            prominence = "true"

        

        # plot start
        if prominence == "false":
            if type(frequency) == dict:
                frequency = frequency["inner"] + frequency["outer"]

            frequency = sorted(frequency, key=lambda x: int(x[1]), reverse=True)
            data = wc_plot(request, request.session["timeticket"], is_mask, width, height, scale, 
                    prefer_horizontal, max_font_size, show_img, font_type, 
                    colormaps, ColorBySize_threshold, frequency, extension)
            img = Image.fromarray(np.array(data["img"]))
            img.save(f"{USERBASEDIR}/client/media/img/{request.session['timeticket']}.{extension}", optimize=True, dpi=dpi)
            data["img"] = None
            
        elif prominence == "true":
            MIN_CORE_WORDS = 3
            if type(frequency) == list:
                frequency_inner = frequency[:MIN_CORE_WORDS]
                frequency_outer = frequency[MIN_CORE_WORDS:]
            else:
                frequency_inner = frequency["inner"]
                frequency_outer = frequency["outer"]
                splitNum = MIN_CORE_WORDS - len(frequency_inner)
                if splitNum > 0:
                    frequency_inner = frequency_inner + frequency_outer[:splitNum]
                    frequency_outer = frequency_outer[splitNum:]
            data = {}
            data["frequency"] = {
                "inner": frequency_inner,
                "outer": frequency_outer
            }
            data["time"] = request.session["timeticket"]

            data_inner = wc_plot(request, request.session["timeticket"]-1, is_mask, width, height, scale / 2, 
                       prefer_horizontal, max_font_size, show_img, font_type, 
                       colormaps, ColorBySize_threshold / 3, frequency_inner, extension,
                       if_relayout=True, img_type="inner", repeat=False, font_step=1, min_font_size=1)
            data_outer = wc_plot(request, request.session["timeticket"]+1, is_mask, width, height, scale / 2, 
                       prefer_horizontal, max_font_size // 2, show_img, font_type, 
                       colormaps, ColorBySize_threshold, frequency_outer, extension,
                       if_relayout=True, img_type="outer", repeat=True)

            inner_img = np.array(data_inner["img"])
            outer_img = np.array(data_outer["img"])
            merge_img = outer_img.copy()

            width = outer_img.shape[0]
            height = outer_img.shape[1]
            area = Area(width, height)
            for yh in range(area.topBorder, area.bottomBorder):
                for xw in range(area.leftBorder, area.rightBorder):
                    if area.is_in_area(xw, yh):
                        merge_img[xw, yh] = inner_img[xw, yh]
            url = f"{USERBASEDIR}/client/media/img/{request.session['timeticket']}.{extension}"
            Image.fromarray(merge_img).save(url, optimize=True, dpi=dpi)
            
            data["status"] = "success" if data_inner["status"] == "success" and data_outer["status"] == "success" else "error"
        else:
            return frequency # when param == 'relayout'
        # plot end
        
        return JsonResponse(data)
    
    except OSError as err:
        data = {'status': 'error', 'message': str(err)}
        return JsonResponse(data)
    except ValueError as err:
        data = {'status': 'error', 'message': str(err)}
        return JsonResponse(data)
    except RuntimeError as err:
        data = {'status': 'error', 'message': str(err)}
        return JsonResponse(data)
    except KeyError as err:  # when error occurs at com.py
        data = {'status': 'error', 'message': str(err)}
        return JsonResponse(data)
    except Exception as err:
        data = {'status': 'error',
                'message': 'Rendering word cloud error, please see the documentation for correct configuration parameters. Or contact us to solve the problem.'}
        data = {'status': 'error', 'message': str(err)}
        return JsonResponse(data)


def get_frequency(request):
    data = {'frequency': request.session.get('frequency', 'null')}
    return JsonResponse(data)


def upload_maskImage(request):
    try:
        pic = request.FILES.get('files')

        image_byte = pic.read()
        image_base64 = str(base64.b64encode(image_byte))[2:-1]
        data = image_base64
        request.session['custom'] = np.array(Image.open(pic)).tolist()
    except:
        print('无文件')
        data = '无文件'

    return HttpResponse(data, 'image/png')


def upload_dictionary(request):
    data = {'mwe_text': []}
    try:
        # 这个files就是前面ajax的那个key,我一开始搞错了,获取不到文件名
        file_object = request.FILES.get('files')
        file_name = file_object.name.split('.')[0]

        for chunk in file_object.chunks():
            l = chunk.decode().rstrip().split('\r\n')
            for i in l:
                data['mwe_text'].append(i)
    except:
        print('无文件')

    return JsonResponse(data)


def save_dictionary(request):
    mwe_text = request.POST.get('mwe_text')
    mwe_text = mwe_text.rstrip().split('\n')
    VALUE = request.session.get('mwe_text', 'null')
    if VALUE == 'null':
        request.session['mwe_text'] = mwe_text
    else:
        VALUE.extend(mwe_text)
        request.session['mwe_text'] = list(set(VALUE))

    data = {}
    return JsonResponse(data)


def search_dictionary(request):
    VALUE = request.session.get('mwe_text', 'null')
    data = {}

    if VALUE != 'null':
        data['record'] = list(set(VALUE))
    return JsonResponse(data)


def clear_dictionary(request):
    data = {}
    try:
        del request.session['mwe_text']
    except:
        print('没有字典session')
    return JsonResponse(data)


def default_dictionary(request):
    data = {}
    try:
        del request.session['mwe_text']
    except:
        print('没有字典session')
    mwe = []
    f = open(f'{USERBASEDIR}/client/static/client/collection/example_dictionary.txt',
             'r', encoding='utf-8')
    for l in f:
        l = l.rstrip()
        mwe.append(l)
    f.close()
    request.session['mwe_text'] = mwe

    return JsonResponse(data)


def upload_stopwords(request):
    data = {'stop_words': []}
    try:
        # 这个files就是前面ajax的那个key,我一开始搞错了,获取不到文件名
        file_object = request.FILES.get('files')
        file_name = file_object.name.split('.')[0]

        for chunk in file_object.chunks():
            l = chunk.decode().rstrip().split('\r\n')
            for i in l:
                data['stop_words'].append(i)
    except:
        print('无文件')

    return JsonResponse(data)


def save_stopwords(request):
    stop_words = request.POST.get('stop_words')
    stop_words = stop_words.rstrip().split('\n')
    VALUE = request.session.get('stop_words', 'null')
    if VALUE == 'null':
        request.session['stop_words'] = stop_words
    else:
        VALUE.extend(stop_words)
        request.session['stop_words'] = list(set(VALUE))
    data = {}
    return JsonResponse(data)


def search_stopwords(request):
    VALUE = request.session.get('stop_words', 'null')

    data = {}
    if VALUE != 'null':
        data['record'] = list(VALUE)
    return JsonResponse(data)


def clear_stopwords(request):
    data = {}
    try:
        del request.session['stop_words']
    except:
        print('没有stopwords')
    return JsonResponse(data)


def default_stopwords(request):
    data = {}
    try:
        del request.session['stop_words']
    except:
        print('没有stopwords')
    stop_words = []
    f = open(f'{USERBASEDIR}/client/static/client/collection/example_stopwords.txt',
             'r', encoding='utf-8-sig')
    for l in f:
        l = l.rstrip()
        stop_words.append(l)
    f.close()

    request.session['stop_words'] = stop_words
    return JsonResponse(data)


def single_upload(f, stamp, suffix):
    file_path = os.path.join(f'{USERBASEDIR}/client/media/files/' + stamp + '.' + suffix)  # 拼装目录名称+文件名称
    with open(file_path, 'wb+') as destination:  # 写文件word
        for chunk in f.chunks():
            destination.write(chunk)
    destination.close()


def up_files(request):
    data = {}
    files = request.FILES.getlist('filelist')  # 获得多个文件上传进来的文件列表。
    filetext = ''
    for f in files:
        stamp = str(time.time())
        suffix = f.name.split('.')[-1]
        single_upload(f, stamp, suffix)  # 处理上传来的文件

        filepath = f'{USERBASEDIR}/client/media/files/{stamp}.{suffix}'
        fsize = os.path.getsize(filepath)
        if suffix == 'docx':
            if fsize > 1 * 1024 * 1024:
                data['status'] = "Error"
                data['message'] = "Error: The uploaded file is too large. The maximum size is 1 MB."
                return JsonResponse(data)

            file = docx.Document(filepath)
            for para in file.paragraphs:
                if len(para.text) != 0:
                    filetext = filetext + para.text + '\n'

        elif suffix == 'txt':
            if fsize > 1 * 1024 * 1024:
                data['status'] = "Error"
                data['message'] = "Error: The uploaded file is too large. The maximum size is 1 MB."
                return JsonResponse(data)
            
            with open(filepath, encoding='utf-8') as file:
                content = file.read()
                filetext = content.rstrip()

        elif suffix == 'pdf':
            if fsize > 10 * 1024 * 1024:
                data['status'] = "Error"
                data['message'] = "Error: The uploaded file is too large. The maximum size is 10 MB."
                return JsonResponse(data)
            
            filetext = read_pdf(filepath, filetext)

    filetext = filetext.rstrip()
    filetexts = filetext.splitlines()
    text = []

    for i in filetexts:
        if i.startswith('Content: '):
            text.append(i.lstrip('Content: '))
        elif len(text) > 0:
            text[-1] = text[-1] + '\n' + i

    if len(text) == 0:
        text.append(filetext)
    data['status'] = "Success"
    data['message'] = text
    return JsonResponse(data)


def example1(request):
    data = {}
    with open(f'{USERBASEDIR}/client/static/client/collection/example1.txt', encoding='utf-8') as file:
        content = file.read()
        filetext = content.rstrip()
    filetext = filetext.splitlines()
    text = []
    for i in filetext:
        if i.startswith('Content: '):
            text.append(i.lstrip('Content: '))
        elif len(text) > 0:
            text[-1] = text[-1] + '\n' + i
    data['message'] = text
    return JsonResponse(data)


def example2(request):
    data = {}
    with open(f'{USERBASEDIR}/client/static/client/collection/example2.txt', encoding='utf-8') as file:
        content = file.read()
        filetext = content.rstrip()
    filetext = filetext.splitlines()
    text = []
    for i in filetext:
        if i.startswith('Content: '):
            text.append(i.lstrip('Content: '))
        elif len(text) > 0:
            text[-1] = text[-1] + '\n' + i
    data['message'] = text
    return JsonResponse(data)


def example3(request):
    data = {}
    with open(f'{USERBASEDIR}/client/static/client/collection/example3.txt', encoding='utf-8') as file:
        content = file.read()
        filetext = content.rstrip()
    filetext = filetext.splitlines()
    text = []
    for i in filetext:
        if i.startswith('Content: '):
            text.append(i.lstrip('Content: '))
        elif len(text) > 0:
            text[-1] = text[-1] + '\n' + i
    data['message'] = text
    return JsonResponse(data)


def GPT(request):
    data = {}
    try:
        prompt = request.POST.get('prompt')

        openai.api_key = "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"
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-1106",
            messages=[{
                "role":"user",
                "content":prompt
            }],
            # prompt=prompt,
            temperature=0.2,
            top_p=1,
            frequency_penalty=0.0,
            presence_penalty=0.6,
            stop=None,
        )
        data['status'] = "success"
        data['message'] = response.choices[0].message["content"].strip()
        data['prompt_tokens'] = response.usage['prompt_tokens']
        data['completion_tokens'] = response.usage['completion_tokens']
        return JsonResponse(data)
    except Exception as e:
        data = {'status': 'error', 'message': str(e)}
        return JsonResponse(data)


def Llama(request):
    data = {}
    try:
        os.environ["REPLICATE_API_TOKEN"] = "r8_8dZnYTbRL3V40MdsuEEiG5MKP0XDfeP04h1US"
        prompt = request.POST.get('prompt')
        output = replicate.run(
            "meta/llama-2-70b-chat:2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1",
            input={
                "prompt": prompt, 
                "max-length": 100, 
                "temperature": 0.75
            }
        )
        # The meta/llama-2-70b-chat model can stream output as it's running.
        # The predict method returns an iterator, and you can iterate over that output.
        # https://replicate.com/meta/llama-2-70b-chat/versions/02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3/api#output-schema
        msg = ''.join(list(output))
        data['status'] = "success"
        data['message'] = msg
        data['prompt_tokens'] = len(prompt)
        data['completion_tokens'] = len(msg)
        return JsonResponse(data)
    except Exception as e:
        data = {'status': 'error', 'message': str(e)}
        return JsonResponse(data)


def Flan(request):
    data = {}
    try:
        os.environ["REPLICATE_API_TOKEN"] = "r8_8dZnYTbRL3V40MdsuEEiG5MKP0XDfeP04h1US"
        prompt = request.POST.get('prompt')
        output = replicate.run(
            "replicate/flan-t5-xl:7a216605843d87f5426a10d2cc6940485a232336ed04d655ef86b91e020e9210",
            input={
                "prompt": prompt, 
                "max-length": 100, 
                "temperature": 0.75
            }
        )
        # The replicate/flan-t5-xl model can stream output as it's running.
        # The predict method returns an iterator, and you can iterate over that output.
        # https://replicate.com/replicate/flan-t5-xl/versions/7a216605843d87f5426a10d2cc6940485a232336ed04d655ef86b91e020e9210/api#output-schema
        msg = ''.join(list(output))
        data['status'] = "success"
        data['message'] = msg
        data['prompt_tokens'] = len(prompt)
        data['completion_tokens'] = len(msg)
        return JsonResponse(data)
    except Exception as e:
        data = {'status': 'error', 'message': str(e)}
        return JsonResponse(data)


def Claude(request):
    data = {}
    try:
        prompt = request.POST.get('prompt')
        msg = "wait to complete"
        data['status'] = "success"
        data['message'] = msg
        data['prompt_tokens'] = len(prompt)
        data['completion_tokens'] = len(msg)
        return JsonResponse(data)
    except Exception as e:
        data = {'status': 'error', 'message': str(e)}
        return JsonResponse(data)


def enrichment_analysis(request):
    try:
        data = {}
        species = request.POST.get('species')
        way = request.POST.get('way')
        gene_set = request.POST.get('text_gene')
        gene_set = gene_set.rstrip().split('\n')

        gene_set_1 = gene2uniprot(gene_set, species)
        gene_set_2 = uniprot2gene(gene_set, species)
        if len(gene_set_1) > len(gene_set_2):
            gene_set = gene_set_1
        if way == 'go' or way == 'bp' or way == 'mf' or way == 'cc':
            ad = do_go(gene_set, species, way)
        elif way == 'kegg':
            ad = do_kegg(gene_set, species)
        elif way == 'do':
            ad = do_do(gene_set)
        else:
            ad = do_gesa(gene_set, way)

        data['result'] = ad
        data['status'] = 'success'
        return JsonResponse(data)
    except OSError as err:
        data = {'status': 'error', 'message': str(err)}
        return JsonResponse(data)
    except ValueError as err:
        data = {'status': 'error', 'message': str(err)}
        return JsonResponse(data)
    except RuntimeError as err:
        data = {'status': 'error', 'message': str(err)}
        return JsonResponse(data)
    except:
        data = {'status': 'error',
                'message': 'Rendering server error, please contact us.'}
        return JsonResponse(data)


def upload_geneset(request):
    data = {'geneset': list()}
    try:
        file_object = request.FILES.get('files')
        file_name = file_object.name.split('.')[0]

        for chunk in file_object.chunks():
            l = chunk.decode().rstrip().split('\r\n')
            for i in l:
                data['geneset'].append(i)
    except:
        print('无文件')
    return JsonResponse(data)
