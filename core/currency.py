"""
Currency utilities for Ghana Cedis (GHS)
"""
from decimal import Decimal
from django.conf import settings


def format_currency(amount, currency_code=None):
    """
    Format amount as currency with appropriate symbol
    
    Args:
        amount: The amount to format (Decimal or float)
        currency_code: Currency code (defaults to settings.DEFAULT_CURRENCY)
    
    Returns:
        Formatted currency string
    """
    if currency_code is None:
        currency_code = getattr(settings, 'DEFAULT_CURRENCY', 'GHS')
    
    # Convert to Decimal for precise calculation
    if isinstance(amount, (int, float)):
        amount = Decimal(str(amount))
    
    # Currency symbols mapping
    symbols = {
        'GHS': '₵',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'GHS': '₵'
    }
    
    symbol = symbols.get(currency_code, currency_code)
    return f"{symbol}{amount:,.2f}"


def get_currency_info():
    """Get current currency configuration"""
    return {
        'code': getattr(settings, 'DEFAULT_CURRENCY', 'GHS'),
        'symbol': getattr(settings, 'CURRENCY_SYMBOL', '₵'),
        'name': 'Ghana Cedi'
    }


def convert_to_pesewas(cedis_amount):
    """Convert Ghana Cedis to pesewas (smallest unit)"""
    return int(Decimal(str(cedis_amount)) * 100)


def convert_from_pesewas(pesewas_amount):
    """Convert pesewas to Ghana Cedis"""
    return Decimal(pesewas_amount) / 100