from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Category(models.Model):
        TYPE_CHOICES = [('income','income'),('expense','expense')]
        user = models.ForeignKey(User,on_delete=models.CASCADE)
        name = models.CharField(max_length=100)
        type = models.CharField(max_length=10,choices=TYPE_CHOICES)

class Budget(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    year = models.IntegerField()
    month = models.IntegerField()
    amount = models.DecimalField(max_digits=10,decimal_places=2,default=0.00)
    class Meta:
        db_table = 'finance_monthlybudget'
        unique_together = ('user','year','month')


class Transaction(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    category = models.ForeignKey(Category,on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12,decimal_places=2)
    date = models.DateField()
    description = models.CharField(max_length=200, blank=True)
