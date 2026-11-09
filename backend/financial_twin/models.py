from django.conf import settings
from django.db import models


class SimulationRun(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE)
    scenario = models.CharField(max_length=10)
    value = models.FloatField()
    inputs = models.JSONField(default=dict)
    risk = models.FloatField()
    median_first_negative = models.IntegerField(null=True, blank=True)
    buffer = models.FloatField(default=0)
    end_likely = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.scenario} {self.value} -> {self.risk:.0f}% ({self.created_at:%d %b %H:%M})"
