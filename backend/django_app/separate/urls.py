from django.urls import path
import separate.views as views

urlpatterns = [
    path('separate/', views.SpleeterModelSeparate.as_view(), name = 'api_separate'),
]
