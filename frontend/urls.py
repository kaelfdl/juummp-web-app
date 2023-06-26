from django.urls import path

from frontend.views import index

app_name = "frontend"
urlpatterns = [
    path('', index, name=''),
]