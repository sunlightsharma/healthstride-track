# Django Backend API Specifications for Fitness Tracker

This document provides complete specifications for building a Django REST API backend that integrates with the React frontend.

## Tech Stack Requirements

- **Django**: 4.2+
- **Django REST Framework**: 3.14+
- **Django CORS Headers**: For handling CORS
- **djangorestframework-simplejwt**: For JWT authentication

## Installation Commands

```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary
```

---

## 1. Django Models

### User Model
Use Django's built-in `User` model from `django.contrib.auth.models`

### Activity Model

```python
# models.py
from django.db import models
from django.contrib.auth.models import User

class Activity(models.Model):
    ACTIVITY_TYPES = [
        ('workout', 'Workout'),
        ('meal', 'Meal'),
        ('steps', 'Steps'),
    ]
    
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    date = models.DateTimeField()
    value = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name_plural = 'Activities'
    
    def __str__(self):
        return f"{self.user.username} - {self.description}"
```

---

## 2. API Endpoints

### Base URL
```
http://localhost:8000/api/
```

### CORS Configuration
Configure CORS to allow requests from React frontend (default: `http://localhost:8080`):

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:5173",  # Vite default port
]

CORS_ALLOW_CREDENTIALS = True
```

---

## 3. Authentication Endpoints

### 3.1 Register User

**Endpoint**: `POST /api/auth/register/`

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!"
}
```

**Validation Rules**:
- `username`: Required, 3-150 characters, alphanumeric and @/./+/-/_ only
- `email`: Required, valid email format, max 255 characters
- `password`: Required, min 8 characters, must contain letters and numbers
- `password2`: Must match password

**Success Response** (201 Created):
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "email": ["User with this email already exists."],
  "username": ["A user with that username already exists."],
  "password": ["Password must contain at least 8 characters."]
}
```

---

### 3.2 Login User

**Endpoint**: `POST /api/auth/login/`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "detail": "Invalid credentials"
}
```

---

### 3.3 Logout User

**Endpoint**: `POST /api/auth/logout/`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Success Response** (205 Reset Content):
```json
{
  "detail": "Successfully logged out"
}
```

---

### 3.4 Refresh Token

**Endpoint**: `POST /api/auth/token/refresh/`

**Request Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Success Response** (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 4. Activity Endpoints

All activity endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### 4.1 List All Activities (Current User)

**Endpoint**: `GET /api/activities/`

**Query Parameters** (optional):
- `type`: Filter by activity type (`workout`, `meal`, `steps`)
- `status`: Filter by status (`planned`, `in progress`, `completed`)
- `date_from`: Filter activities from this date (ISO format)
- `date_to`: Filter activities until this date (ISO format)

**Example**: `GET /api/activities/?type=workout&status=completed`

**Success Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "workout",
    "description": "Morning Run",
    "status": "completed",
    "date": "2025-11-09T08:00:00Z",
    "value": "5km",
    "created_at": "2025-11-09T07:00:00Z",
    "updated_at": "2025-11-09T09:00:00Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "meal",
    "description": "Healthy Breakfast",
    "status": "completed",
    "date": "2025-11-09T07:30:00Z",
    "value": "400 cal",
    "created_at": "2025-11-09T07:00:00Z",
    "updated_at": "2025-11-09T08:00:00Z"
  }
]
```

---

### 4.2 Create Activity

**Endpoint**: `POST /api/activities/`

**Request Body**:
```json
{
  "type": "workout",
  "description": "Evening Yoga",
  "status": "planned",
  "date": "2025-11-09T18:00:00Z",
  "value": "45 mins"
}
```

**Validation Rules**:
- `type`: Required, must be one of: `workout`, `meal`, `steps`
- `description`: Required, max 255 characters, no empty strings
- `status`: Required, must be one of: `planned`, `in progress`, `completed`
- `date`: Required, must be valid ISO datetime format
- `value`: Optional, max 50 characters

**Success Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "type": "workout",
  "description": "Evening Yoga",
  "status": "planned",
  "date": "2025-11-09T18:00:00Z",
  "value": "45 mins",
  "created_at": "2025-11-09T10:00:00Z",
  "updated_at": "2025-11-09T10:00:00Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "type": ["\"invalid_type\" is not a valid choice."],
  "description": ["This field may not be blank."],
  "date": ["Datetime has wrong format. Use one of these formats instead: YYYY-MM-DDThh:mm[:ss[.uuuuuu]][+HH:MM|-HH:MM|Z]."]
}
```

---

### 4.3 Get Single Activity

**Endpoint**: `GET /api/activities/{id}/`

**Success Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "workout",
  "description": "Morning Run",
  "status": "completed",
  "date": "2025-11-09T08:00:00Z",
  "value": "5km",
  "created_at": "2025-11-09T07:00:00Z",
  "updated_at": "2025-11-09T09:00:00Z"
}
```

**Error Response** (404 Not Found):
```json
{
  "detail": "Not found."
}
```

---

### 4.4 Update Activity

**Endpoint**: `PUT /api/activities/{id}/`

**Request Body** (all fields required):
```json
{
  "type": "workout",
  "description": "Morning Run - Updated",
  "status": "completed",
  "date": "2025-11-09T08:00:00Z",
  "value": "7km"
}
```

**Alternative**: `PATCH /api/activities/{id}/` (partial update, only changed fields):
```json
{
  "status": "completed",
  "value": "7km"
}
```

**Success Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "workout",
  "description": "Morning Run - Updated",
  "status": "completed",
  "date": "2025-11-09T08:00:00Z",
  "value": "7km",
  "created_at": "2025-11-09T07:00:00Z",
  "updated_at": "2025-11-09T11:00:00Z"
}
```

**Error Response** (403 Forbidden):
```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

### 4.5 Delete Activity

**Endpoint**: `DELETE /api/activities/{id}/`

**Success Response** (204 No Content):
```
(Empty response body)
```

**Error Response** (404 Not Found):
```json
{
  "detail": "Not found."
}
```

---

## 5. Django Serializers

```python
# serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Activity

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')
        read_only_fields = ('id',)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError(
                {"email": "User with this email already exists."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ('id', 'type', 'description', 'status', 'date', 'value', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def validate_description(self, value):
        if not value or value.strip() == '':
            raise serializers.ValidationError("Description cannot be empty.")
        if len(value) > 255:
            raise serializers.ValidationError("Description must be less than 255 characters.")
        return value.strip()
    
    def validate_value(self, value):
        if value and len(value) > 50:
            raise serializers.ValidationError("Value must be less than 50 characters.")
        return value
```

---

## 6. Django Views

```python
# views.py
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Activity
from .serializers import UserSerializer, RegisterSerializer, ActivitySerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        user = User.objects.get(email=email)
        user = authenticate(username=user.username, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            })
        else:
            return Response(
                {'detail': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    except User.DoesNotExist:
        return Response(
            {'detail': 'Invalid credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(
            {'detail': 'Successfully logged out'}, 
            status=status.HTTP_205_RESET_CONTENT
        )
    except Exception:
        return Response(
            {'detail': 'Invalid token'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Activity.objects.filter(user=self.request.user)
        
        # Filter by type
        activity_type = self.request.query_params.get('type')
        if activity_type:
            queryset = queryset.filter(type=activity_type)
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
```

---

## 7. URL Configuration

```python
# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, login_view, logout_view, ActivityViewSet

router = DefaultRouter()
router.register(r'activities', ActivityViewSet, basename='activity')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
```

```python
# Main urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('your_app.urls')),
]
```

---

## 8. Django Settings Configuration

```python
# settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'your_app',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

---

## 9. React Frontend Integration Points

### Update API Base URL

Create an API client configuration:

```typescript
// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = {
  baseURL: API_BASE_URL,
  
  getAuthHeader: () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  
  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
    });
    
    if (response.status === 401) {
      // Token expired, try refresh
      await this.refreshToken();
      // Retry original request
      return this.request(endpoint, options);
    }
    
    return response;
  },
  
  async refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token');
    
    const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
    } else {
      // Refresh failed, logout user
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
  }
};
```

### Update Login Handler

```typescript
// src/pages/Login.tsx
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await apiClient.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email
      }));
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      const error = await response.json();
      toast.error(error.detail || "Login failed");
    }
  } catch (error) {
    toast.error("Network error occurred");
  } finally {
    setLoading(false);
  }
};
```

---

## 10. Security Considerations

### Input Validation
- ✅ All inputs validated on both client and server
- ✅ Max length limits enforced (description: 255, value: 50, email: 255)
- ✅ Required field validation
- ✅ Type checking for enums (activity type, status)

### Authentication
- ✅ JWT tokens with 1-hour expiration
- ✅ Refresh tokens with 7-day expiration
- ✅ Token blacklisting on logout
- ✅ Password hashing with Django's default PBKDF2

### Authorization
- ✅ Users can only access their own activities
- ✅ User ID taken from JWT token, not request body
- ✅ Proper permission classes on all endpoints

### CORS
- ✅ Specific origin whitelist (no *)
- ✅ Credentials support enabled
- ✅ Proper headers configuration

---

## 11. Testing Endpoints

Use tools like Postman, Insomnia, or curl:

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!","password2":"Test123!"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Create Activity (replace YOUR_TOKEN)
curl -X POST http://localhost:8000/api/activities/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"workout","description":"Morning Run","status":"completed","date":"2025-11-09T08:00:00Z","value":"5km"}'

# List Activities
curl -X GET http://localhost:8000/api/activities/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 12. Database Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser for admin panel
python manage.py createsuperuser
```

---

## 13. Running the Server

```bash
# Development server
python manage.py runserver

# Run on specific port
python manage.py runserver 8000
```

The API will be available at: `http://localhost:8000/api/`

---

## Summary Checklist

- ✅ JWT-based authentication with refresh tokens
- ✅ User registration with validation
- ✅ Login/logout functionality
- ✅ Complete CRUD operations for activities
- ✅ User-specific activity filtering
- ✅ Query parameter filtering (type, status, date range)
- ✅ Proper error handling and validation
- ✅ CORS configuration for React frontend
- ✅ Security best practices implemented
- ✅ Input validation and sanitization
