# Generated by Django 3.2.4 on 2023-07-07 12:07

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Playlist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('playlist_id', models.CharField(max_length=150, unique=True)),
                ('track_id', models.CharField(default='', max_length=150)),
                ('track_number', models.IntegerField(default=0)),
                ('track_count', models.IntegerField(default=0)),
                ('duration', models.IntegerField(default=0)),
                ('progress', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='SpotifyToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.CharField(max_length=150, unique=True)),
                ('access_token', models.CharField(max_length=255)),
                ('refresh_token', models.CharField(default='', max_length=255)),
                ('token_type', models.CharField(max_length=50)),
                ('expires_in', models.DateTimeField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_client', models.BooleanField(default=False)),
            ],
        ),
    ]
