from rest_framework import serializers
from .models import Category, Transaction, Budget

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'type']

class TransactionSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), write_only=True, source='category'
    )

    class Meta:
        model = Transaction
        fields = ['id', 'category', 'category_id', 'amount', 'date', 'description']

    def validate_category(self, value):
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError('Invalid category for user')
        return value

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id', 'year', 'month', 'amount']