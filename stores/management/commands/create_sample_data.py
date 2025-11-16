from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from stores.models import Category, Store
from products.models import Product, ProductImage
from decimal import Decimal
import os

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample categories and products for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before creating new data',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Product.objects.all().delete()
            Category.objects.all().delete()
            Store.objects.filter(name__startswith='Sample').delete()

        self.stdout.write('Creating sample categories...')
        categories = self.create_categories()
        
        self.stdout.write('Creating sample store...')
        store = self.create_sample_store()
        
        self.stdout.write('Creating sample products...')
        self.create_products(categories, store)
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        )

    def create_categories(self):
        categories_data = [
            {
                'name': 'Electronics',
                'description': 'Laptops, phones, headphones, and other electronic devices',
                'icon': '💻'
            },
            {
                'name': 'Books & Stationery',
                'description': 'Textbooks, notebooks, pens, and academic materials',
                'icon': '📚'
            },
            {
                'name': 'Clothing & Fashion',
                'description': 'Shirts, dresses, shoes, and fashion accessories',
                'icon': '👕'
            },
            {
                'name': 'Food & Beverages',
                'description': 'Snacks, drinks, and meal items',
                'icon': '🍔'
            },
            {
                'name': 'Sports & Fitness',
                'description': 'Sports equipment, gym gear, and fitness accessories',
                'icon': '⚽'
            },
            {
                'name': 'Beauty & Personal Care',
                'description': 'Cosmetics, skincare, and personal hygiene products',
                'icon': '💄'
            },
            {
                'name': 'Home & Living',
                'description': 'Furniture, decorations, and household items',
                'icon': '🏠'
            },
            {
                'name': 'Art & Crafts',
                'description': 'Art supplies, craft materials, and creative tools',
                'icon': '🎨'
            }
        ]

        categories = []
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'is_active': True
                }
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {category.name}')
            else:
                self.stdout.write(f'Category already exists: {category.name}')

        return categories

    def create_sample_store(self):
        # Get or create a superuser for the sample store
        admin_user, created = User.objects.get_or_create(
            email='admin@campusshop.com',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'is_superuser': True,
                'is_staff': True,
                'is_seller': True
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()

        # Create sample store
        store, created = Store.objects.get_or_create(
            name='Sample Campus Store',
            defaults={
                'owner': admin_user,
                'description': 'A sample store with various campus products for demonstration',
                'contact_email': 'store@campusshop.com',
                'contact_phone': '+234-801-234-5678',
                'address': 'University Campus, Main Building',
                'status': 'approved',
                'is_featured': True
            }
        )
        
        if created:
            self.stdout.write(f'Created store: {store.name}')
        else:
            self.stdout.write(f'Store already exists: {store.name}')

        return store

    def create_products(self, categories, store):
        products_data = [
            # Electronics
            {
                'name': 'MacBook Air M2',
                'description': 'Apple MacBook Air with M2 chip, 8GB RAM, 256GB SSD. Perfect for students and professionals.',
                'category': 'Electronics',
                'price': Decimal('450000.00'),
                'compare_at_price': Decimal('500000.00'),
                'quantity': 5,
                'condition': 'new',
                'is_featured': True
            },
            {
                'name': 'iPhone 13',
                'description': 'Apple iPhone 13, 128GB, Blue. Excellent condition, barely used.',
                'category': 'Electronics',
                'price': Decimal('280000.00'),
                'quantity': 3,
                'condition': 'like_new'
            },
            {
                'name': 'Samsung Galaxy Buds',
                'description': 'Wireless earbuds with noise cancellation. Great for music and calls.',
                'category': 'Electronics',
                'price': Decimal('25000.00'),
                'quantity': 10,
                'condition': 'new',
                'is_featured': True
            },
            
            # Books & Stationery
            {
                'name': 'Calculus Textbook',
                'description': 'Advanced Calculus textbook for Engineering and Mathematics students.',
                'category': 'Books & Stationery',
                'price': Decimal('8500.00'),
                'quantity': 15,
                'condition': 'good'
            },
            {
                'name': 'Scientific Calculator',
                'description': 'Casio FX-991EX scientific calculator. Perfect for exams.',
                'category': 'Books & Stationery',
                'price': Decimal('12000.00'),
                'quantity': 8,
                'condition': 'new'
            },
            {
                'name': 'A4 Notebooks Set',
                'description': 'Pack of 5 high-quality A4 notebooks for note-taking.',
                'category': 'Books & Stationery',
                'price': Decimal('3500.00'),
                'quantity': 25,
                'condition': 'new'
            },
            
            # Clothing & Fashion
            {
                'name': 'University Hoodie',
                'description': 'Official university hoodie in navy blue. Size M.',
                'category': 'Clothing & Fashion',
                'price': Decimal('15000.00'),
                'quantity': 12,
                'condition': 'new',
                'is_featured': True
            },
            {
                'name': 'Nike Sneakers',
                'description': 'Nike Air Force 1 sneakers, size 42. Comfortable and stylish.',
                'category': 'Clothing & Fashion',
                'price': Decimal('35000.00'),
                'quantity': 6,
                'condition': 'like_new'
            },
            
            # Food & Beverages
            {
                'name': 'Energy Drink Pack',
                'description': 'Pack of 6 energy drinks to keep you going during study sessions.',
                'category': 'Food & Beverages',
                'price': Decimal('2400.00'),
                'quantity': 20,
                'condition': 'new'
            },
            {
                'name': 'Healthy Snack Box',
                'description': 'Assorted healthy snacks including nuts, dried fruits, and protein bars.',
                'category': 'Food & Beverages',
                'price': Decimal('4500.00'),
                'quantity': 15,
                'condition': 'new'
            },
            
            # Sports & Fitness
            {
                'name': 'Yoga Mat',
                'description': 'Premium yoga mat with carrying strap. Perfect for dorm workouts.',
                'category': 'Sports & Fitness',
                'price': Decimal('8000.00'),
                'quantity': 10,
                'condition': 'new'
            },
            {
                'name': 'Basketball',
                'description': 'Official size basketball for campus games.',
                'category': 'Sports & Fitness',
                'price': Decimal('6500.00'),
                'quantity': 8,
                'condition': 'new'
            },
            
            # Beauty & Personal Care
            {
                'name': 'Skincare Set',
                'description': 'Complete skincare routine set with cleanser, toner, and moisturizer.',
                'category': 'Beauty & Personal Care',
                'price': Decimal('12500.00'),
                'quantity': 12,
                'condition': 'new'
            },
            
            # Home & Living
            {
                'name': 'Desk Lamp',
                'description': 'LED desk lamp with adjustable brightness. Perfect for studying.',
                'category': 'Home & Living',
                'price': Decimal('7500.00'),
                'quantity': 15,
                'condition': 'new'
            },
            {
                'name': 'Mini Fridge',
                'description': 'Compact mini fridge for dorm rooms. Energy efficient.',
                'category': 'Home & Living',
                'price': Decimal('85000.00'),
                'quantity': 3,
                'condition': 'like_new',
                'is_featured': True
            },
            
            # Art & Crafts
            {
                'name': 'Art Supplies Kit',
                'description': 'Complete art supplies kit with brushes, paints, and canvas.',
                'category': 'Art & Crafts',
                'price': Decimal('18000.00'),
                'quantity': 8,
                'condition': 'new'
            }
        ]

        for product_data in products_data:
            # Find the category
            category = next((cat for cat in categories if cat.name == product_data['category']), None)
            if not category:
                self.stdout.write(f'Category not found: {product_data["category"]}')
                continue

            # Create product
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                store=store,
                defaults={
                    'description': product_data['description'],
                    'category': category,
                    'price': product_data['price'],
                    'compare_at_price': product_data.get('compare_at_price'),
                    'quantity': product_data['quantity'],
                    'condition': product_data['condition'],
                    'is_active': True,
                    'is_featured': product_data.get('is_featured', False),
                    'sku': f'PROD-{product_data["name"][:10].upper().replace(" ", "-")}'
                }
            )

            if created:
                self.stdout.write(f'Created product: {product.name}')
            else:
                self.stdout.write(f'Product already exists: {product.name}')

        self.stdout.write(f'Created {len(products_data)} products')