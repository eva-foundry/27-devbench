import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'

const SAMPLE_DIFF = `diff --git a/src/auth/AuthService.ts b/src/auth/AuthService.ts
index 1234567..abcdefg 100644
--- a/src/auth/AuthService.ts
+++ b/src/auth/AuthService.ts
@@ -1,10 +1,15 @@
 import { User } from '../types'
+import { TokenManager } from './TokenManager'
+import { validateCredentials } from './validators'
 
 export class AuthService {
-  login(username: string, password: string): User | null {
-    if (username && password) {
-      return { id: '1', username }
+  private tokenManager: TokenManager
+
+  constructor() {
+    this.tokenManager = new TokenManager()
+  }
+
+  async login(username: string, password: string): Promise<User | null> {
+    if (await validateCredentials(username, password)) {
+      const token = await this.tokenManager.generateToken(username)
+      return { id: '1', username, token }
     }
     return null
   }
diff --git a/src/domain/UserRepository.ts b/src/domain/UserRepository.ts
index 2345678..bcdefgh 100644
--- a/src/domain/UserRepository.ts
+++ b/src/domain/UserRepository.ts
@@ -15,8 +15,16 @@ export class UserRepository {
   }
 
-  async findById(id: string): Promise<User | null> {
-    return this.db.query('SELECT * FROM users WHERE id = ?', [id])
+  async findById(id: string, includeDeleted = false): Promise<User | null> {
+    let query = 'SELECT * FROM users WHERE id = ?'
+    if (!includeDeleted) {
+      query += ' AND deleted_at IS NULL'
+    }
+    
+    const result = await this.db.query(query, [id])
+    if (!result) {
+      return null
+    }
+    return this.mapToUser(result)
   }
 }
diff --git a/src/controllers/UserController.ts b/src/controllers/UserController.ts
new file mode 100644
index 0000000..1234abc
--- /dev/null
+++ b/src/controllers/UserController.ts
@@ -0,0 +1,45 @@
+import { Request, Response } from 'express'
+import { UserService } from '../services/UserService'
+import { logger } from '../utils/logger'
+
+export class UserController {
+  private userService: UserService
+
+  constructor() {
+    this.userService = new UserService()
+  }
+
+  async getUser(req: Request, res: Response): Promise<void> {
+    try {
+      const { id } = req.params
+      const user = await this.userService.getUserById(id)
+      
+      if (!user) {
+        res.status(404).json({ error: 'User not found' })
+        return
+      }
+      
+      res.json(user)
+    } catch (error) {
+      logger.error('Error fetching user', { error, userId: req.params.id })
+      res.status(500).json({ error: 'Internal server error' })
+    }
+  }
+
+  async createUser(req: Request, res: Response): Promise<void> {
+    try {
+      const userData = req.body
+      const newUser = await this.userService.createUser(userData)
+      res.status(201).json(newUser)
+    } catch (error) {
+      logger.error('Error creating user', { error })
+      res.status(500).json({ error: 'Internal server error' })
+    }
+  }
+
+  async deleteUser(req: Request, res: Response): Promise<void> {
+    const { id } = req.params
+    await this.userService.deleteUser(id)
+    res.status(204).send()
+  }
+}
diff --git a/src/services/UserService.ts b/src/services/UserService.ts
index 3456789..cdefghi 100644
--- a/src/services/UserService.ts
+++ b/src/services/UserService.ts
@@ -1,15 +1,28 @@
 import { UserRepository } from '../domain/UserRepository'
+import { EmailService } from './EmailService'
 import { User, CreateUserDTO } from '../types'
 
 export class UserService {
   private repository: UserRepository
+  private emailService: EmailService
 
   constructor() {
     this.repository = new UserRepository()
+    this.emailService = new EmailService()
   }
 
-  async createUser(data: CreateUserDTO): Promise<User> {
-    return this.repository.create(data)
+  async getUserById(id: string): Promise<User | null> {
+    return this.repository.findById(id)
+  }
+
+  async createUser(data: CreateUserDTO): Promise<User> {
+    const user = await this.repository.create(data)
+    await this.emailService.sendWelcomeEmail(user.email)
+    return user
+  }
+
+  async deleteUser(id: string): Promise<void> {
+    await this.repository.softDelete(id)
   }
 }
diff --git a/src/types/User.ts b/src/types/User.ts
index 4567890..defghij 100644
--- a/src/types/User.ts
+++ b/src/types/User.ts
@@ -1,8 +1,12 @@
 export interface User {
   id: string
   username: string
   email: string
+  token?: string
+  createdAt: Date
+  updatedAt: Date
+  deletedAt?: Date
 }
 
 export interface CreateUserDTO {
diff --git a/tests/UserService.test.ts b/tests/UserService.test.ts
new file mode 100644
index 0000000..efghijk
--- /dev/null
+++ b/tests/UserService.test.ts
@@ -0,0 +1,65 @@
+import { describe, it, expect, beforeEach, vi } from 'vitest'
+import { UserService } from '../src/services/UserService'
+import { UserRepository } from '../src/domain/UserRepository'
+
+vi.mock('../src/domain/UserRepository')
+
+describe('UserService', () => {
+  let userService: UserService
+  let mockRepository: jest.Mocked<UserRepository>
+
+  beforeEach(() => {
+    mockRepository = new UserRepository() as jest.Mocked<UserRepository>
+    userService = new UserService()
+  })
+
+  describe('getUserById', () => {
+    it('should return user when found', async () => {
+      const mockUser = {
+        id: '1',
+        username: 'testuser',
+        email: 'test@example.com',
+        createdAt: new Date(),
+        updatedAt: new Date()
+      }
+      
+      mockRepository.findById.mockResolvedValue(mockUser)
+      
+      const result = await userService.getUserById('1')
+      
+      expect(result).toEqual(mockUser)
+      expect(mockRepository.findById).toHaveBeenCalledWith('1')
+    })
+
+    it('should return null when user not found', async () => {
+      mockRepository.findById.mockResolvedValue(null)
+      
+      const result = await userService.getUserById('999')
+      
+      expect(result).toBeNull()
+    })
+  })
+
+  describe('createUser', () => {
+    it('should create user and send welcome email', async () => {
+      const createDTO = {
+        username: 'newuser',
+        email: 'new@example.com'
+      }
+      
+      const mockUser = {
+        id: '2',
+        ...createDTO,
+        createdAt: new Date(),
+        updatedAt: new Date()
+      }
+      
+      mockRepository.create.mockResolvedValue(mockUser)
+      
+      const result = await userService.createUser(createDTO)
+      
+      expect(result).toEqual(mockUser)
+      expect(mockRepository.create).toHaveBeenCalledWith(createDTO)
+    })
+  })
+})
diff --git a/README.md b/README.md
index 5678901..fghijkl 100644
--- a/README.md
+++ b/README.md
@@ -1,10 +1,25 @@
 # User Management System
 
-A simple user management application.
+A comprehensive user management application with authentication and email notifications.
 
 ## Features
 
-- User CRUD operations
+- User authentication with token management
+- User CRUD operations with soft delete
+- Email notifications for new users
+- Comprehensive test coverage
+
+## Installation
+
+\`\`\`bash
+npm install
+\`\`\`
+
+## Running Tests
+
+\`\`\`bash
+npm test
+\`\`\`
 
 ## License
 
diff --git a/config/database.json b/config/database.json
index 6789012..ghijklm 100644
--- a/config/database.json
+++ b/config/database.json
@@ -1,7 +1,10 @@
 {
   "host": "localhost",
   "port": 5432,
   "database": "users_db",
-  "pool": 10
+  "pool": 10,
+  "ssl": false,
+  "timeout": 30000,
+  "retryAttempts": 3
 }
`

export function useSampleDiff() {
  const [sampleDiffContent, setSampleDiffContent] = useKV<string>('sample-diff-content', '')

  useEffect(() => {
    if (!sampleDiffContent) {
      setSampleDiffContent(SAMPLE_DIFF)
    }
  }, [sampleDiffContent, setSampleDiffContent])

  return sampleDiffContent
}
