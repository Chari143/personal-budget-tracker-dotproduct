from rest_framework import viewsets, permissions, decorators, response
from django.db.models import Sum
from datetime import date
from .models import Category, Transaction, Budget
from .serializers import CategorySerializer, TransactionSerializer, BudgetSerializer




class OwnedModelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryViewSet(OwnedModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class TransactionViewSet(OwnedModelViewSet):
    queryset = Transaction.objects.select_related('category').all()
    serializer_class = TransactionSerializer
    def get_queryset(self):
        qs = super().get_queryset()
        p = self.request.query_params
        if 'category' in p:
            qs = qs.filter(category_id=p['category'])
        if 'date__gte' in p:
            qs = qs.filter(date__gte=p['date__gte'])
        if 'date__lte' in p:
            qs = qs.filter(date__lte=p['date__lte'])
        if 'amount__gte' in p:
            qs = qs.filter(amount__gte=p['amount__gte'])
        if 'amount__lte' in p:
            qs = qs.filter(amount__lte=p['amount__lte'])
        return qs.order_by('-date','-id')

class BudgetViewSet(OwnedModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer

    @decorators.action(detail=False, methods=['get'])
    def current(self, request):
        today = date.today()
        b, _ = Budget.objects.get_or_create(user=request.user, year=today.year, month=today.month, defaults={'amount':0})
        return response.Response(BudgetSerializer(b).data)

    @decorators.action(detail=False, methods=['post'])
    def set_current(self, request):
        y = int(request.data.get('year'))
        m = int(request.data.get('month'))
        amt = request.data.get('amount','0')
        b, _ = Budget.objects.update_or_create(user=request.user, year=y, month=m, defaults={'amount': amt})
        return response.Response(BudgetSerializer(b).data)

@decorators.api_view(['GET'])
def summary(request):
    inc = Transaction.objects.filter(user=request.user, category__type='income').aggregate(total=Sum('amount'))['total'] or 0
    exp = Transaction.objects.filter(user=request.user, category__type='expense').aggregate(total=Sum('amount'))['total'] or 0
    today = date.today()
    mon_exp = Transaction.objects.filter(user=request.user, date__year=today.year, date__month=today.month, category__type='expense').aggregate(total=Sum('amount'))['total'] or 0
    b = Budget.objects.filter(user=request.user, year=today.year, month=today.month).first()
    return response.Response({
        'total_income': float(inc),
        'total_expenses': float(exp),
        'balance': float(inc) - float(exp),
        'month_expenses': float(mon_exp),
        'month_budget': float(b.amount) if b else 0,
    })
