from django.urls import path

from . import views

urlpatterns = [
    path("simulate/", views.simulate),
    path("runs/", views.runs),
    path("register/", views.register),
    path("login/", views.login),
]
