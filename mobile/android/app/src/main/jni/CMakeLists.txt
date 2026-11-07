cmake_minimum_required(VERSION 3.13)

# Reduz o limite para o CMake encurtar caminhos de arquivos objeto.
set(CMAKE_OBJECT_PATH_MAX 128)

project(appmodules)

include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)