import os
import time

import matplotlib
import PyPDF2

matplotlib.use('Agg')

from nltk.stem import *
from nltk.corpus import wordnet


def read_pdf(filepath, text):
    pdfFileObj = open(filepath, 'rb')  # rw,r+都会出错
    # pdfFileObj = open(filename, 'r+',encoding="utf-8")
    pdfReader = PyPDF2.PdfFileReader(pdfFileObj)

  #  print("pages cnt:", pdfReader.numPages)

    for i in range(pdfReader.numPages):
        pageObj = pdfReader.getPage(i)
        dataStr = pageObj.extractText()

        #      print("current page index:", i)
        #       print("============text===============")
        text = text + dataStr


    pdfFileObj.close()
    return text

import numpy as np

class Area():
    leftBorder, rightBorder, topBorder, bottomBorder = 0, 0, 0, 0
    def __init__(self, width:int, height:int, partition=2) -> None:
        self.center_x = width // 2
        self.center_y = height // 2
        Area.leftBorder = self.center_x - (width - self.center_x) // partition
        Area.rightBorder = self.center_x + (width - self.center_x) // partition
        Area.topBorder = self.center_y - (height - self.center_y) // partition
        Area.bottomBorder = self.center_y + (height - self.center_y) // partition
        self.edge_x = (Area.leftBorder - Area.rightBorder) / 2
        self.edge_y = (Area.topBorder - Area.bottomBorder) / 2

    def is_in_area(self, x:int, y:int) -> bool:
        return (x - self.center_x) ** 2 / self.edge_x ** 2 + (y - self.center_y) ** 2 / self.edge_y ** 2 <= 1

def transparence2white(img, img_type=None):
    '''
    :param img: RGBA img
    :param img_type: inner img or outer img
    :return: accessed img
    Notice: mask将非白色区域的边界识别为轮廓，图片上的透明区域要转换成白色
    '''
    sp = img.shape  # 获取图片维度
    width = sp[0]  # 宽度
    height = sp[1]  # 高度
    area = Area(width, height)
    
    for yh in range(height):
        for xw in range(width):
            if img_type:
                if img_type=="inner" and \
                    not area.is_in_area(xw, yh):
                    # ((leftBorder > xw or xw > rightBorder) or (topBorder > yh or yh > bottomBorder)):
                    img[xw, yh] = [255, 255, 255, 255]
                elif img_type=="outer" and \
                    area.is_in_area(xw, yh):
                    # leftBorder*0.95 < xw and xw < rightBorder*1.05 and topBorder*0.95 < yh and yh < bottomBorder*1.05:
                    img[xw, yh] = [255, 255, 255, 255]
            if img[xw, yh][3] == 0:  # 最后一个通道为透明度，如果其值为0，即图像是透明
                img[xw, yh] = [255, 255, 255, 255]  # 则将当前点的颜色设置为白色，且图像设置为不透明
    return img


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


def binary_conversion(var: int):
    """
    二进制单位转换
    :param var: 需要计算的变量，bytes值
    :return: 单位转换后的变量，kb 或 mb
    """
    assert isinstance(var, int)
    if var <= 1024:
        return f'占用 {round(var / 1024, 2)} KB内存'
    else:
        return f'占用 {round(var / (1024 ** 2), 2)} MB内存'


def del_files(dir_path):
    if os.path.isfile(dir_path):
        try:
            os.remove(dir_path) # 这个可以删除单个文件，不能删除文件夹
        except BaseException as e:
            print(e)
    elif os.path.isdir(dir_path):
        file_lis = os.listdir(dir_path)
        for file_name in file_lis:
            # if file_name != 'wibot.log':
            tf = os.path.join(dir_path, file_name)
            del_files(tf)


def delet(path):
    # initializing the count
    deleted_files_count = 0
    # specify the days
    days = 1
    # converting days to seconds
    # time.time() returns current time in seconds
    seconds = time.time() - (days * 24 * 60 * 60)
    # checking whether the file is present in path or not
    if os.path.exists(path):
        # iterating over each and every folder and file in the path
        for root_folder, folders, files in os.walk(path):
            # comparing the days\
            for file in files:
                # file path
                file_path = os.path.join(root_folder, file)
                # comparing the days
                if seconds >= get_file_or_folder_age(file_path):
                    # invoking the remove_file function
                    remove_file(file_path)
                    deleted_files_count += 1  # incrementing count
    else:
        # file/folder is not found
        print(f'"{path}" is not found')
        deleted_files_count += 1  # incrementing count
    print(f"Total files deleted: {deleted_files_count}")
def remove_file(path):
    # removing the file
    if not os.remove(path):
        # success message
        print(f"{path} is removed successfully")
    else:
        # failure message
        print(f"Unable to delete the {path}")

def get_file_or_folder_age(path):
    # getting ctime of the file/folder
    # time will be in seconds
    ctime = os.stat(path).st_ctime
    # returning the time
    return ctime