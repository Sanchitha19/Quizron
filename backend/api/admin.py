from django.contrib import admin
from .models import QuizSession, Question, UserAnswer, CheatSheet

admin.site.register(QuizSession)
admin.site.register(Question)
admin.site.register(UserAnswer)
admin.site.register(CheatSheet)
