import uuid
from django.db import models
from django.contrib.auth.models import User


class QuizSession(models.Model):
    DIFFICULTY_CHOICES = [('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')]
    STATUS_CHOICES = [('pending', 'Pending'), ('active', 'Active'), ('completed', 'Completed')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_sessions')
    topic = models.CharField(max_length=200)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    num_questions = models.IntegerField(default=10)
    score = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.topic} ({self.difficulty})"


class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(QuizSession, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    options = models.JSONField()  # list of 4 strings
    correct_index = models.IntegerField()  # 0-3
    explanation = models.TextField()
    order = models.IntegerField()

    class Meta:
        ordering = ['order']


class UserAnswer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(QuizSession, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_index = models.IntegerField(null=True, blank=True)
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['session', 'question']


class CheatSheet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(QuizSession, on_delete=models.CASCADE, related_name='cheatsheet')
    content = models.TextField()  # full markdown
    pdf_file = models.FileField(upload_to='cheatsheets/', null=True, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)
