from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

	initial = True

	dependencies = [
		migrations.swappable_dependency(settings.AUTH_USER_MODEL),
	]

	operations = [
		migrations.CreateModel(
			name='Profile',
			fields=[
				('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
				('age', models.PositiveIntegerField(blank=True, null=True)),
				('interests', models.JSONField(blank=True, default=list)),
				('bio', models.TextField(blank=True)),
				('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
			],
		),
		migrations.CreateModel(
			name='ContentItem',
			fields=[
				('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
				('title', models.CharField(max_length=255)),
				('description', models.TextField(blank=True)),
				('url', models.URLField(blank=True)),
				('content_type', models.CharField(choices=[('article', 'Article'), ('video', 'Video'), ('quiz', 'Quiz')], max_length=20)),
				('tags', models.JSONField(blank=True, default=list)),
				('created_at', models.DateTimeField(auto_now_add=True)),
			],
		),
		migrations.CreateModel(
			name='Interaction',
			fields=[
				('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
				('action', models.CharField(max_length=50)),
				('score', models.FloatField(default=0.0)),
				('timestamp', models.DateTimeField(auto_now_add=True)),
				('content_item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interactions', to='core.contentitem')),
				('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interactions', to=settings.AUTH_USER_MODEL)),
			],
			options={'ordering': ['-timestamp']},
		),
	]


