/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - id
 *          - email
 *          - phoneNumber
 *        properties:
 *          id:
 *            type: string
 *            description: UUID of the user.
 *          email:
 *            type: string
 *            description: Email address of the user.
 *          phoneNumber:
 *            type: string
 *            description: Phone number of the user.
 *          roles:
 *            type: array
 *            items:
 *              type: string
 *            description: Role for the user. Options are USER or RESTAURANT.
 *          firstName:
 *            type: string
 *          lastName:
 *            type: string
 *    securitySchemes:
 *      bearerAuth:
 *        type: http
 *        scheme: bearer
 *        bearerFormat: JWT 
 * schemes:
 *   - http
 *   - https
 * path:
 *  /auth/signup:
 *    post:
 *      summary: Create a new user
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                 - id
 *                 - email
 *                 - phoneNumber
 *                 - password
 *                 - account_type
 *              properties:
 *                id:
 *                  type: string
 *                email:
 *                  type: string
 *                phoneNumber:
 *                  type: string
 *                password:
 *                  type: string
 *                account_type:
 *                  type: string
 *                firstName:
 *                  type: string
 *                lastName:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /auth/signin:
 *    post:
 *      summary: Signs a user in (can use email, phoneNumber, or username)
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                 - id
 *                 - password
 *              properties:
 *                id:
 *                  type: string
 *                password:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /auth/forgot:
 *    post:
 *      summary: Sends email with password reset
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                 - email
 *              properties:
 *                email:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /auth/forgot/test:
 *    post:
 *      summary: Returns password reset token (dev/test only)
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                 - email
 *              properties:
 *                email:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /auth/reset/{token}:
 *    get:
 *      summary: Checks if token is valid
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: token
 *          schema:
 *            type: string
 *          required: true
 *          description: Reset token
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *    post:
 *      summary: Signs a user in (can use email, phoneNumber, or username)
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: token
 *          schema:
 *            type: string
 *          required: true
 *          description: Reset token
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                 - newPassword
 *                 - verifyPassword
 *              properties:
 *                newPassword:
 *                  type: string
 *                verifyPassword:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /auth/signin/{token}:
 *    post:
 *      summary: Signs a user in using a token
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: token
 *          schema:
 *            type: string
 *          required: true
 *          description: Magic link token 
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /user/me:
 *    get:
 *      summary: Gets user profile
 *      security:
 *        - bearerAuth: []
 *      tags: [Users]
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /user:
 *    get:
 *      summary: Gets user profile
 *      security:
 *        - bearerAuth: []
 *      tags: [Users]
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *    put:
 *      summary: Updates user profile
 *      security:
 *        - bearerAuth: []
 *      tags: [Users]
 *      requestBody:
 *        required: false
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                email:
 *                  type: string
 *                phoneNumber:
 *                  type: string
 *                firstName:
 *                  type: string
 *                lastName:
 *                  type: string
 *                hospitalId:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /user/password:
 *    post:
 *      summary: Updates user profile
 *      security:
 *        - bearerAuth: []
 *      tags: [Users]
 *      requestBody:
 *        required: false
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                 - currentPassword
 *                 - newPassword
 *                 - verifyPassword
 *              properties:
 *                currentPassword:
 *                  type: string
 *                newPassword:
 *                  type: string
 *                verifyPassword:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *  /users:
 *    get:
 *      summary: Gets all user profiles. Only available in dev.
 *      tags: [Users]
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 */