import numpy as np
import pandas as pd
from nltk import word_tokenize, pos_tag, MWETokenizer, FreqDist
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
from nltk.collocations import BigramAssocMeasures, BigramCollocationFinder
import re, os
from scipy.spatial import distance
from scipy import stats
from sklearn.preprocessing import MinMaxScaler, QuantileTransformer
import seaborn as sns
import matplotlib.pyplot as plt
import spacy
import math
import pytextrank
from rake_nltk import Rake
import yake


def get_wordnet_pos(treebank_tag):
    if treebank_tag.startswith('J'):
        return wordnet.ADJ
    elif treebank_tag.startswith('V'):
        return wordnet.VERB
    elif treebank_tag.startswith('N'):
        return wordnet.NOUN
    elif treebank_tag.startswith('R'):
        return wordnet.ADV
    else:
        return wordnet.NOUN

def valid_words(word:str, stop_words:list):
    if re.match(r"[()/\-:;,.0-9]+", word):
        return False
    # elif word in stopwords.words('english'):
    elif len(word) < 4 or word in stop_words:
        return False
    else:
        return True

def wordcaseTransform(words):
    # exception: length
    if len(words) < 20:
        raise ValueError("The number of valid words entered is too small, at least 20 valid words (removing the stop words).")
    # exception: length

    memoryLowerCaseWords = {}
    for index, word in enumerate(words):
        lowercase = word.lower()
        if lowercase not in memoryLowerCaseWords:
            memoryLowerCaseWords[lowercase] = word
        else:
            words[index] = memoryLowerCaseWords[lowercase]
    return words

def preprocess(method:str, text:str, keyword:list, mwetokenizer:MWETokenizer, stop_words:list):
    if method == "TF":
        words = [WordNetLemmatizer().lemmatize(word, get_wordnet_pos(POS)) for word, POS in pos_tag(word_tokenize(text))]
        words = mwetokenizer.tokenize(words)
        words = [w for w in words if valid_words(w.lower(), stop_words)]
        words = wordcaseTransform(words)
        return words

    elif method == "keyword":
        words = [WordNetLemmatizer().lemmatize(word, get_wordnet_pos(POS)) for word, POS in pos_tag(word_tokenize(text))]
        words = mwetokenizer.tokenize(words)
        words = [word for word in words if word.lower() in keyword or valid_words(word.lower(), stop_words)]
        words = wordcaseTransform(words)
        if keyword[0]:
            return words, keyword
        else:
            DEFAULT_KEYWORD = FreqDist(words).max()
            return words, [DEFAULT_KEYWORD]

def word2val(words:list):
    '''将word转换为数字
    :param words: 单词列表
    :return: 单词对应值的列表和转换字典
    '''
    word_to_id = {}
    id_to_word = {}
    for word in words:
        if word not in word_to_id:
            new_id = len(word_to_id)
            word_to_id[word] = new_id
            id_to_word[new_id] = word

    wordVal = np.array([word_to_id[w] for w in words])

    return wordVal, word_to_id, id_to_word

def WeightFunction(distance:int, window_size:int):
    """
    计算位置权重函数

    :param distance: 单词之间的距离
    :param max_distance: 最大窗口距离
    :return: 权重值
    """
    if distance > window_size:
        return 0
    else:
        return 1 / (distance + 1)
        return 0

def window_co_matrix(wordVal:list, vocab_size:int, window_size=8):
    '''生成共现矩阵

    :param wordVal: 语料库（单词ID列表）
    :param vocab_size: 词汇个数
    :param window_size: 窗口大小（当窗口大小为1时，左右各1个单词为上下文）
    :return: 共现矩阵
    '''
    corpus_size = len(wordVal)
    window_size = corpus_size if window_size > corpus_size else window_size
    co_matrix = np.zeros((vocab_size, vocab_size))

    for idx, word_id in enumerate(wordVal):
        for i in range(1, window_size + 1):
            left_idx = idx - i
            right_idx = idx + i

            weight = WeightFunction(i, window_size)

            if left_idx >= 0:
                left_word_id = wordVal[left_idx]
                co_matrix[word_id, left_word_id] += 1 + weight

            if right_idx < corpus_size:
                right_word_id = wordVal[right_idx]
                co_matrix[word_id, right_word_id] += 1 + weight

    return co_matrix
    return MinMaxScaler(feature_range=(0, 1)).fit_transform(co_matrix)

def cosine_similarity(x:np.ndarray, y:np.ndarray):
    '''计算余弦相似度

    :param x: 向量
    :param y: 向量
    :return: 余弦相似度
    '''
    cos_sim = x.dot(y) / (np.linalg.norm(x) * np.linalg.norm(y))
    return cos_sim

def most_similar(method:str, querys:list, word_to_id:dict, id_to_word:dict, word_matrix:np.ndarray, top=100, normalize=True):
    '''相似单词的查找

    :param method: 相似度计算方法
    :param querys: 查询词 列表
    :param word_to_id: 从单词到单词ID的字典
    :param id_to_word: 从单词ID到单词的字典
    :param word_matrix: 汇总了单词向量的矩阵，假定保存了与各行对应的单词向量
    :param top: 显示到前几位
    :return: 相似单词
    '''
    SUCCESS = False
    similarity_merged = []
    for index, query in enumerate(querys):
        if query not in word_to_id:
            continue
        SUCCESS = True

        query_id = word_to_id[query]
        query_vec = word_matrix[query_id]

        vocab_size = len(id_to_word)

        # distance
        if method == "Cosine":
            similarity = [cosine_similarity(word_matrix[i], query_vec) for i in range(vocab_size)]
        elif method == "Euclidean":
            similarity = [1 / (1 + distance.euclidean(word_matrix[i], query_vec)) for i in range(vocab_size)]
        elif method == "Seuclidean":
            similarity = [1 / (1 + distance.seuclidean(word_matrix[i], query_vec)) for i in range(vocab_size)]
        elif method == "Sqeuclidean":
            similarity = [1 / (1 + distance.sqeuclidean(word_matrix[i], query_vec)) for i in range(vocab_size)]
        elif method == "Manhattan":
            similarity = [1 / (1 + distance.cityblock(word_matrix[i], query_vec)) for i in range(vocab_size)]
        elif method == "Minkowski":
            similarity = [1 / (1 + distance.minkowski(word_matrix[i], query_vec)) for i in range(vocab_size)]
        elif method == "Jaccard":
            similarity = [1 / (1 + distance.jaccard(word_matrix[i], query_vec)) for i in range(vocab_size)]
        elif method == "Chebyshev":
            similarity = [1 / (1 + distance.chebyshev(word_matrix[i], query_vec)) for i in range(vocab_size)]
        elif method == "Hamming":
            similarity = [1 / (1 + distance.hamming(word_matrix[i], query_vec)) for i in range(vocab_size)]
        elif method == "Mahalanobis":
            similarity = [1 / (1 + distance.mahalanobis(word_matrix[i], query_vec)) for i in range(vocab_size)]
        elif method == "Jensenshannon":
            similarity = [1 / (1 + distance.jensenshannon(word_matrix[i], query_vec)) for i in range(vocab_size)]
        elif method == "Braycurtis":
            similarity = [1 / (1 + distance.braycurtis(word_matrix[i], query_vec)) for i in range(vocab_size)]
        elif method == "Canberra":
            similarity = [1 / (1 + distance.canberra(word_matrix[i], query_vec)) for i in range(vocab_size)]
        # correlation
        elif method == "Spearman":
            similarity = [abs(stats.spearmanr(word_matrix[i], query_vec).statistic) for i in range(vocab_size)]
        elif method == "Pearson":
            similarity = [abs(stats.pearsonr(word_matrix[i], query_vec).statistic) for i in range(vocab_size)]
        elif method == "Kendall":
            similarity = [abs(stats.kendalltau(word_matrix[i], query_vec).statistic) for i in range(vocab_size)]
        elif method == "Weightedtau":
            similarity = [abs(stats.weightedtau(word_matrix[i], query_vec).statistic) for i in range(vocab_size)]
        elif method == "Somersd":
            similarity = [abs(stats.somersd(word_matrix[i], query_vec).statistic) for i in range(vocab_size)]
        elif method == "Covariance":
            similarity = [abs(np.cov(word_matrix[i], query_vec)[0][1]) for i in range(vocab_size)]
            # similarity = [1 / (1 + math.exp(-abs(np.cov(word_matrix[i], query_vec)))) for i in range(vocab_size)]
        similarity_merged.append(similarity)

    if not SUCCESS:
        raise KeyError(f'{"/".join(querys)} is/are not found in the context. Please check the case of keyword(s) and invalid characters.')

    # similarity scale to [0, 1]
    similarity_normalized = np.array(similarity_merged).mean(axis=0)
    if normalize:
        transformer = QuantileTransformer(n_quantiles=len(similarity_normalized), output_distribution='uniform')
        similarity_normalized = transformer.fit_transform(similarity_normalized.reshape(-1, 1))
    
    count = 0
    co_matrix_sim = [(query, 100) for query in querys]
    # co_matrix_sim.append(('/'.join(querys), 100))
    index = [i for i in range(len(similarity_normalized))]
    sortedIndex = sorted(index, key=lambda x: similarity_normalized[x], reverse=True)
    for i in sortedIndex:
        if id_to_word[i] in querys:
            continue
        score = int(similarity_normalized[i] * 100)
        co_matrix_sim.append((id_to_word[i], score))

        count += 1
        if count >= top:
            return co_matrix_sim
    return co_matrix_sim

def PMI(words:list, keywords:list):
    frequency = [[keyword, 100] for keyword in keywords]
    finder = BigramCollocationFinder.from_words(words, 4)
    for row in finder.score_ngrams(BigramAssocMeasures.pmi):
        data = (*row[0],row[1])
        if data[0] in keywords:
            frequency.append([data[1], int(data[2] * 10)])
        elif data[1] in keywords:
            frequency.append([data[0], int(data[2] * 10)])
    return frequency

def textrank(text:str):
    nlp = spacy.load("en_core_web_sm") # python -m spacy download en_core_web_sm
    nlp.add_pipe("textrank")
    doc = nlp(text)
    frequency = []
    for phrase in doc._.phrases:
        frequency.append((phrase.text, 100 * phrase.rank))
    return frequency
    

def rake(text:str):
    r = Rake()
    r.extract_keywords_from_text(text)
    r.get_ranked_phrases()
    frequency_ = r.get_ranked_phrases_with_scores()
    frequency = [(word, freq) for freq, word in frequency_]
    return frequency

def yake_(text:str):
    kw_extractor = yake.KeywordExtractor()
    frequency = kw_extractor.extract_keywords(text)
    frequency = [(word, 100 / (freq + 1)) for word, freq in frequency]
    return frequency

def co_matrix_heatmap(df:pd.DataFrame, frequency:list, word_to_id:dict, id_to_word:dict, url:str):
    pltWords = [word_to_id[word] for word, _ in frequency[:30]]
    plt.figure(figsize=(20,20))
    df = df.iloc[pltWords, pltWords].rename(columns=id_to_word)
    df.to_csv("./heatmap-source-data.txt")
    data = df.corr()
    mask = np.zeros_like(data)
    mask[np.triu_indices_from(mask)] = True
    sns.heatmap(data, mask=mask, vmax=.3, square=True)
    plt.xticks(rotation=90, fontsize=10)
    plt.savefig(url)