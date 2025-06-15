# NexCV Architecture Documentation

## Overview
NexCV is a resume builder application that allows users to create, edit, and manage their resumes with various templates and AI-powered features. The application uses Next.js for the frontend, MongoDB with Prisma for the database, and Clerk for authentication.

## Database Schema

### User Model
```prisma
model User {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  clerkUserId    String   @unique
  email          String
  name           String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  resumes        Resume[]
  creditBalance  Int      @default(0)
  transactions   CreditTransaction[]
}
```

### Resume Model
```prisma
model Resume {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  userId       String   @db.ObjectId
  title        String
  slug         String   @unique
  data         Json
  template     String
  visibility   String   @default("private")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### CreditTransaction Model
```prisma
model CreditTransaction {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  type        String   // "earn" or "spend"
  amount      Int
  reason      String
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Template Model
```prisma
model Template {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  key         String   @unique
  name        String
  description String?
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## API Endpoints

### Resume Endpoints
- `GET /api/resumes` - Get all resumes for the current user
- `GET /api/resumes/[id]` - Get a specific resume by ID
- `POST /api/resumes` - Create a new resume
- `PUT /api/resumes/[id]` - Update a specific resume
- `DELETE /api/resumes/[id]` - Delete a specific resume

### AI Endpoints
- `POST /api/ai/modify` - Modify resume content using AI
- `POST /api/ai/scrape` - Scrape content from a URL
- `POST /api/ai/complete` - Complete or enhance resume sections

## Resume Data Structure

The resume data is stored as JSON in the database with the following structure:

```typescript
interface ResumeData {
  basics: {
    name: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    url: {
      label: string;
      href: string;
    };
    customFields: any[];
    picture: {
      url: string;
      size: number;
      aspectRatio: number;
      borderRadius: number;
      effects: {
        hidden: boolean;
        border: boolean;
        grayscale: boolean;
      };
    };
  };
  sections: {
    [key: string]: {
      name: string;
      columns: number;
      separateLinks: boolean;
      visible: boolean;
      id: string;
      content?: string;
      items?: Array<{
        id: string;
        visible: boolean;
        [key: string]: any;
      }>;
    };
  };
  metadata: {
    template: string;
    layout: string[][];
    css: {
      value: string;
      visible: boolean;
    };
    page: {
      margin: number;
      format: string;
      options: {
        breakLine: boolean;
        pageNumbers: boolean;
      };
    };
    theme: {
      background: string;
      text: string;
      primary: string;
    };
    typography: {
      font: {
        family: string;
        subset: string;
        variants: string[];
        size: number;
      };
      lineHeight: number;
      hideIcons: boolean;
      underlineLinks: boolean;
    };
    notes: string;
  };
}
```

## Environment Variables
```
DATABASE_URL="mongodb://..."
CLERK_SECRET_KEY="..."
CLERK_PUBLISHABLE_KEY="..."
```

## Security Considerations
1. All API routes are protected with Clerk authentication
2. Resume data is scoped to the user who created it
3. Credit transactions are immutable once created
4. Template metadata is validated before saving

## Rate Limiting
- AI endpoints: 10 requests per minute per user
- Resume creation: 5 resumes per hour per user
- Export: 10 exports per hour per user

## Error Handling
All API endpoints return standardized error responses:
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Future Considerations
1. Credit System Implementation
   - Daily bonus credits
   - Credit spending for premium features
   - Credit earning through referrals

2. Template System
   - Custom template creation
   - Template marketplace
   - Template versioning

3. Export Options
   - PDF export
   - DOCX export
   - HTML export
   - Custom format export

4. AI Features
   - Resume optimization
   - Job matching
   - Skill gap analysis
   - Content suggestions

## Development Guidelines
1. Always validate input data before saving to database
2. Use TypeScript for type safety
3. Follow REST API best practices
4. Implement proper error handling
5. Write unit tests for critical functionality
6. Document all new features and API endpoints 