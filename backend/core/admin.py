from django.contrib import admin

from .models import ContentItem, Interaction, Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "age")
	search_fields = ("user__username",)


@admin.register(ContentItem)
class ContentItemAdmin(admin.ModelAdmin):
	list_display = ("id", "title", "content_type", "created_at")
	search_fields = ("title",)
	list_filter = ("content_type",)


@admin.register(Interaction)
class InteractionAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "content_item", "action", "score", "timestamp")
	search_fields = ("user__username", "content_item__title")
	list_filter = ("action",)


