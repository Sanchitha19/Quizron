from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('', views.api_root),

    # Auth
    path('auth/register/', views.register),
    path('auth/login/', views.login_view),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('auth/me/', views.me),

    # Profile
    path('profile/', views.profile),
    path('profile/history/', views.quiz_history),

    # Quiz
    path('quiz/create/', views.create_quiz),
    path('generate-quiz/', views.create_quiz),
    path('quiz/<uuid:session_id>/', views.get_quiz),
    path('quiz/<uuid:session_id>/answer/', views.submit_answer),
    path('quiz/<uuid:session_id>/finish/', views.finish_quiz),
    path('quiz/<uuid:session_id>/results/', views.quiz_results),

    # Cheatsheet
    path('quiz/<uuid:session_id>/cheatsheet/', views.get_cheatsheet),
    path('quiz/<uuid:session_id>/cheatsheet/generate/', views.generate_cheatsheet_view),
    path('quiz/<uuid:session_id>/cheatsheet/download/', views.download_pdf),
]
