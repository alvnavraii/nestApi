
# Security Documentation

## Authentication

### JWT Implementation
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
}
```

### Token Structure
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "roleId": 1,
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Authorization

### Role-Based Access Control (RBAC)
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndMerge<number[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.roleId);
  }
}
```

### Available Roles
| Role ID | Name  | Description |
|---------|-------|-------------|
| 1       | ADMIN | Full system access |
| 0       | USER  | Read-only access |

## Password Security

### Hashing Implementation
```typescript
// Password hashing using bcrypt
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### Password Validation
```typescript
const isValid = await bcrypt.compare(password, hashedPassword);
```

## API Security

### CORS Configuration
```typescript
app.enableCors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
});
```

### Rate Limiting
- Implementation pending
- Planned limits:
  - 100 requests per minute for authenticated users
  - 20 requests per minute for unauthenticated users

## Database Security

### Connection Security
```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'oracle',
    connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${configService.get('BD_HOST')})(PORT=${configService.get('BD_PORT')}))(CONNECT_DATA=(SERVICE_NAME=${configService.get('BD_SERVICE_NAME')})))`,
    username: configService.get<string>('BD_USER'),
    password: configService.get<string>('BD_PASSWORD'),
    synchronize: false,
    logging: true,
  }),
});
```

### Audit Trail
All database operations are tracked with:
- User identification
- Timestamp
- Operation type
- Previous values

## Environment Security

### Required Environment Variables
```properties
# Database Configuration
DB_HOST=localhost
DB_PORT=1521
DB_SERVICE_NAME=xe
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRATION_TIME=24h
```

## Best Practices

### API Security
1. Always use HTTPS in production
2. Implement rate limiting
3. Validate all inputs
4. Use proper HTTP methods
5. Return appropriate status codes

### Database Security
1. Use parameterized queries
2. Implement row-level security
3. Encrypt sensitive data
4. Regular security audits
5. Principle of least privilege

### Authentication Security
1. Enforce strong passwords
2. Implement account lockout
3. Use secure session management
4. Regular token rotation
5. Implement refresh tokens

## Next Steps
- [Error Handling](errors.md)
- [Database Structure](database.md)
- [API Documentation](../api/authentication.md) 